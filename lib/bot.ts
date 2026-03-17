import { Telegraf, Context } from 'telegraf';
import { adminDb } from './firebase-admin';
import { generateMealPlanAndGroceryList, analyzeFoodImage } from './ai';
import Stripe from 'stripe';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will fail.');
    }
    stripeClient = new Stripe(key || 'dummy_key', {
      apiVersion: '2026-02-25.clover',
    });
  }
  return stripeClient;
}

if (!BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN is not set. Bot will not function.');
}

export const bot = new Telegraf(BOT_TOKEN || 'dummy_token');

// Simple in-memory state for the conversation flow (MVP)
// In a real production app, use a database or Redis for session state.
const userState = new Map<number, {
  step: number;
  name?: string;
  symptoms?: string[];
  restrictions?: string[];
  goals?: string[];
  rating?: number;
}>();

const FREE_TIER_LIMIT = 1;

async function checkFreeLimitReached(telegramId: number): Promise<boolean> {
  const userDoc = await adminDb.collection('users').doc(telegramId.toString()).get();
  const userData = userDoc.data();
  
  if (userData?.plan === 'premium') {
    return false;
  }
  
  const plansSnapshot = await adminDb.collection('meal_plans')
    .where('user_id', '==', telegramId.toString())
    .get();
    
  return plansSnapshot.size >= FREE_TIER_LIMIT;
}

bot.start(async (ctx) => {
  const telegramId = ctx.from.id;
  
  try {
    const limitReached = await checkFreeLimitReached(telegramId);
    
    if (limitReached) {
      // Generate Stripe link
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Endonutri Premium (Mensal)',
                description: 'Planos alimentares e listas de compras ilimitados.',
              },
              unit_amount: 1990, // R$ 19,90
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/`,
        client_reference_id: telegramId.toString(),
      });

      await ctx.reply(
        `Você atingiu o limite do plano gratuito (${FREE_TIER_LIMIT} plano alimentar). 😔\n\n` +
        "Para continuar gerando planos e listas de compras ilimitados, assine o Endonutri Premium por apenas R$ 19,90/mês!\n\n" +
        `👉 [Assinar Premium Agora](${session.url})`,
        { parse_mode: 'Markdown' }
      );
      return;
    }
  } catch (error) {
    console.error("Error checking user limits:", error);
  }

  userState.set(telegramId, { step: 1 });
  
  await ctx.reply(
    "Olá! Sou a Endonutri, sua assistente de nutrição especializada em endometriose. 🌿\n\n" +
    "Vou te ajudar a criar um plano alimentar anti-inflamatório e uma lista de compras.\n\n" +
    "Para começar, qual é o seu nome?"
  );
});

bot.command('premium', async (ctx) => {
  const telegramId = ctx.from.id;
  
  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Endonutri Premium (Mensal)',
              description: 'Planos alimentares e listas de compras ilimitados.',
            },
            unit_amount: 1990, // R$ 19,90
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
      client_reference_id: telegramId.toString(),
    });

    await ctx.reply(
      "🌟 *Endonutri Premium* 🌟\n\n" +
      "Por apenas R$ 19,90/mês você tem acesso a:\n" +
      "✅ Planos alimentares ilimitados\n" +
      "✅ Listas de compras ilimitadas\n" +
      "✅ Suporte prioritário\n\n" +
      `👉 [Assinar Premium Agora](${session.url})`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error("Error creating premium link:", error);
    await ctx.reply("Desculpe, ocorreu um erro ao gerar o link de pagamento. Tente novamente mais tarde.");
  }
});

bot.on('text', async (ctx) => {
  const telegramId = ctx.from.id;
  const text = ctx.message.text;
  const state = userState.get(telegramId);

  if (!state) {
    return ctx.reply("Por favor, digite /start para iniciar nossa conversa.");
  }

  try {
    switch (state.step) {
      case 1:
        state.name = text;
        state.step = 2;
        await ctx.reply(`Prazer em conhecer você, ${state.name}! 😊\n\nQuais são os seus principais sintomas de endometriose? (ex: cólicas fortes, inchaço, fadiga)`);
        break;
      case 2:
        state.symptoms = text.split(',').map(s => s.trim());
        state.step = 3;
        await ctx.reply("Entendi. Você tem alguma restrição alimentar ou alergia? (ex: sem glúten, sem lactose, vegana)");
        break;
      case 3:
        state.restrictions = text.split(',').map(s => s.trim());
        state.step = 4;
        await ctx.reply("Perfeito. E quais são os seus principais objetivos com a alimentação? (ex: reduzir dor, mais energia, perder peso)");
        break;
      case 4:
        state.goals = text.split(',').map(s => s.trim());
        state.step = 5;
        
        try {
          const limitReached = await checkFreeLimitReached(telegramId);
          
          if (limitReached) {
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            let sessionUrl = `${appUrl}/premium`; // Fallback URL
            
            try {
              const session = await getStripe().checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                  {
                    price_data: {
                      currency: 'brl',
                      product_data: {
                        name: 'Endonutri Premium (Mensal)',
                        description: 'Planos alimentares e listas de compras ilimitados.',
                      },
                      unit_amount: 1990,
                      recurring: { interval: 'month' },
                    },
                    quantity: 1,
                  },
                ],
                mode: 'subscription',
                success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${appUrl}/`,
                client_reference_id: telegramId.toString(),
              });
              sessionUrl = session.url || sessionUrl;
            } catch (stripeError) {
              console.error("Stripe session creation failed:", stripeError);
              // Continue with fallback URL if Stripe fails
            }

            await ctx.reply(
              `Você atingiu o limite do plano gratuito (${FREE_TIER_LIMIT} plano alimentar). 😔\n\n` +
              "Para continuar gerando planos e listas de compras ilimitados, assine o Endonutri Premium por apenas R$ 19,90/mês!\n\n" +
              "Com o plano Premium, você tem acesso a:\n" +
              "✅ *Planos Alimentares Ilimitados*: Gere novos cardápios sempre que precisar.\n" +
              "✅ *Listas de Compras Ilimitadas*: Facilite sua ida ao mercado.\n" +
              "✅ *Análise de Fotos Ilimitada*: Tire foto do seu prato e saiba na hora se é anti-inflamatório.\n" +
              "✅ *Suporte Prioritário*: Respostas mais rápidas da nossa IA.\n\n" +
              "Transforme sua rotina e cuide da sua saúde com a melhor tecnologia.",
              { 
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '⭐ Assinar Premium Agora', url: sessionUrl }]
                  ]
                }
              }
            );
            userState.delete(telegramId);
            return;
          }
        } catch (error) {
          console.error("Error checking user limits before generation:", error);
          // If we can't check limits, we should probably allow them to continue or show an error.
          // Let's allow them to continue for now, but log the error.
        }

        await ctx.reply("Obrigada pelas informações! Estou gerando o seu plano alimentar anti-inflamatório e a lista de compras. Isso pode levar alguns segundos... ⏳");
        
        // Generate AI Plan
        const generated = await generateMealPlanAndGroceryList(
          state.symptoms || [],
          state.restrictions || [],
          state.goals || []
        );

        // Save to Database
        const userRef = adminDb.collection('users').doc(telegramId.toString());
        await userRef.set({
          uid: telegramId.toString(),
          name: state.name || 'Usuário',
          telegram_id: telegramId.toString(),
          role: 'user',
          createdAt: new Date()
        }, { merge: true });

        const profileRef = adminDb.collection('profiles').doc(telegramId.toString());
        await profileRef.set({
          user_id: telegramId.toString(),
          symptoms: state.symptoms || [],
          restrictions: state.restrictions || [],
          goals: state.goals || [],
          updatedAt: new Date()
        });

        const mealPlanRef = adminDb.collection('meal_plans').doc();
        await mealPlanRef.set({
          user_id: telegramId.toString(),
          weekly_plan: JSON.stringify(generated.mealPlan),
          createdAt: new Date()
        });

        const groceryListRef = adminDb.collection('grocery_lists').doc();
        await groceryListRef.set({
          user_id: telegramId.toString(),
          categorized_items: JSON.stringify(generated.groceryList),
          createdAt: new Date()
        });

        const logRef = adminDb.collection('logs').doc();
        await logRef.set({
          user_id: telegramId.toString(),
          action: 'GENERATE_MEAL_PLAN',
          details: 'Successfully generated meal plan and grocery list.',
          createdAt: new Date()
        });

        // Format and send response
        const escapeHTML = (str: any) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        let responseText = `✨ <b>Seu Plano Alimentar Anti-inflamatório</b> ✨\n\n`;
        generated.mealPlan.forEach((day: any) => {
          responseText += `<b>${escapeHTML(day.day)}</b>\n`;
          responseText += `🍳 Café: ${escapeHTML(day.breakfast)}\n`;
          responseText += `🥗 Almoço: ${escapeHTML(day.lunch)}\n`;
          responseText += `🍎 Lanche: ${escapeHTML(day.snack)}\n`;
          responseText += `🍲 Jantar: ${escapeHTML(day.dinner)}\n\n`;
        });

        await ctx.replyWithHTML(responseText);

        let groceryText = `🛒 <b>Sua Lista de Compras</b> 🛒\n\n`;
        generated.groceryList.forEach((cat: any) => {
          groceryText += `<b>${escapeHTML(cat.category)}</b>\n`;
          cat.items.forEach((item: string) => {
            groceryText += `- ${escapeHTML(item)}\n`;
          });
          groceryText += `\n`;
        });

        await ctx.replyWithHTML(groceryText);
        
        state.step = 6;
        await ctx.reply("Como você avalia o plano alimentar gerado?", {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '1 ⭐', callback_data: 'rate_1' },
                { text: '2 ⭐', callback_data: 'rate_2' },
                { text: '3 ⭐', callback_data: 'rate_3' },
                { text: '4 ⭐', callback_data: 'rate_4' },
                { text: '5 ⭐', callback_data: 'rate_5' }
              ]
            ]
          }
        });
        break;
      case 6:
        await ctx.reply("Por favor, use os botões de estrelas acima para avaliar o plano alimentar.");
        break;
      case 7:
        const comment = text === '/pular' ? '' : text;
        
        await adminDb.collection('logs').doc().set({
          user_id: telegramId.toString(),
          action: 'feedback',
          details: JSON.stringify({ rating: state.rating, comment }),
          createdAt: new Date()
        });
        
        await ctx.reply("Feedback salvo com sucesso! Obrigada por ajudar a melhorar a Endonutri. 🌿\n\nSe precisar de um novo plano no futuro, basta digitar /start.");
        userState.delete(telegramId);
        break;
    }
  } catch (error: any) {
    console.error("Error processing message:", error);
    await ctx.reply(`Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde digitando /start. Erro: ${error.message}`);
    userState.delete(telegramId);
  }
});

bot.action(/rate_(\d)/, async (ctx) => {
  const telegramId = ctx.from.id;
  const state = userState.get(telegramId);
  
  if (!state || state.step !== 6) {
    await ctx.answerCbQuery("Sessão expirada ou inválida.");
    return;
  }
  
  const rating = parseInt(ctx.match[1]);
  state.rating = rating;
  state.step = 7;
  
  await ctx.answerCbQuery(`Você avaliou com ${rating} estrelas!`);
  await ctx.reply("Obrigada pela avaliação! Você gostaria de deixar algum comentário ou sugestão? (Digite seu comentário ou clique em /pular)");
});

bot.on('photo', async (ctx) => {
  const telegramId = ctx.from.id;
  
  try {
    const userDoc = await adminDb.collection('users').doc(telegramId.toString()).get();
    const userData = userDoc.data();
    
    if (!userDoc.exists || userData?.plan !== 'premium') {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      let sessionUrl = `${appUrl}/premium`; // Fallback URL
      
      try {
        const session = await getStripe().checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'brl',
                product_data: {
                  name: 'Endonutri Premium (Mensal)',
                  description: 'Planos alimentares, listas de compras ilimitados e análise de alimentos por foto.',
                },
                unit_amount: 1990,
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/`,
          client_reference_id: telegramId.toString(),
        });
        sessionUrl = session.url || sessionUrl;
      } catch (stripeError) {
        console.error("Stripe session creation failed:", stripeError);
        // Continue with fallback URL if Stripe fails
      }

      await ctx.reply(
        "🌟 *Desbloqueie o Poder da Análise por Foto com o Premium!* 🌟\n\n" +
        "A funcionalidade de enviar fotos de alimentos para análise nutricional instantânea é exclusiva para assinantes do *Endonutri Premium*.\n\n" +
        "Com o plano Premium, você tem acesso a:\n" +
        "✅ *Análise de Fotos Ilimitada*: Tire foto do seu prato e saiba na hora se é anti-inflamatório.\n" +
        "✅ *Planos Alimentares Ilimitados*: Gere novos cardápios sempre que precisar.\n" +
        "✅ *Listas de Compras Ilimitadas*: Facilite sua ida ao mercado.\n" +
        "✅ *Suporte Prioritário*: Respostas mais rápidas da nossa IA.\n\n" +
        "Tudo isso por apenas *R$ 19,90/mês*! Transforme sua rotina e cuide da sua saúde com a melhor tecnologia.",
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⭐ Assinar Premium Agora', url: sessionUrl }]
            ]
          }
        }
      );
      return;
    }

    await ctx.reply("Estou analisando a sua foto... 🔍🍎");

    // Get the highest resolution photo
    const photos = ctx.message.photo;
    const fileId = photos[photos.length - 1].file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    const response = await fetch(fileLink.href);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Get user profile
    const profileDoc = await adminDb.collection('profiles').doc(telegramId.toString()).get();
    const profileData = profileDoc.exists ? profileDoc.data() : null;

    const analysis = await analyzeFoodImage(base64Image, 'image/jpeg', profileData);

    await ctx.replyWithMarkdown(analysis || "Não consegui analisar a imagem no momento.");

    // Log action
    await adminDb.collection('logs').doc().set({
      user_id: telegramId.toString(),
      action: 'ANALYZE_FOOD_IMAGE',
      details: 'Successfully analyzed food image.',
      createdAt: new Date()
    });

  } catch (error) {
    console.error("Error analyzing photo:", error);
    await ctx.reply("Desculpe, ocorreu um erro ao analisar a sua foto. Tente novamente mais tarde.");
  }
});
