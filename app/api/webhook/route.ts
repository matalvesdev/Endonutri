import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const telegramId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (telegramId) {
          await adminDb.collection('users').doc(telegramId).set({
            plan: 'premium',
            stripeCustomerId: customerId,
            subscriptionId: subscriptionId,
            subscriptionStatus: 'active',
          }, { merge: true });
          
          await adminDb.collection('logs').doc().set({
            user_id: telegramId,
            action: 'SUBSCRIPTION_CREATED',
            details: `User upgraded to premium. Subscription ID: ${subscriptionId}`,
            createdAt: new Date()
          });
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customerId
        const usersSnapshot = await adminDb.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const status = subscription.status;
          
          await userDoc.ref.set({
            subscriptionStatus: status,
            plan: status === 'active' ? 'premium' : 'free',
            subscriptionId: status === 'canceled' ? null : subscription.id
          }, { merge: true });
          
          await adminDb.collection('logs').doc().set({
            user_id: userDoc.id,
            action: 'SUBSCRIPTION_UPDATED',
            details: `Subscription status changed to: ${status}`,
            createdAt: new Date()
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
