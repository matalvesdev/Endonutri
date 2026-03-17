import Link from 'next/link';
import { ArrowRight, CheckCircle2, Heart, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-rose-50/30 text-slate-800 font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-rose-500" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">Endonutri</span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://t.me/EndonutriBot" 
            target="_blank" 
            rel="noreferrer"
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm shadow-rose-200"
          >
            Começar no Telegram
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4" />
          <span>Inteligência Artificial para Mulheres com Endometriose</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Nutrição Anti-inflamatória <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
            Feita para Você.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Receba cardápios semanais e listas de compras personalizadas diretamente no seu Telegram. Reduza a inflamação, alivie as dores e recupere sua qualidade de vida.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="https://t.me/EndonutriBot" 
            target="_blank" 
            rel="noreferrer"
            className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 group"
          >
            Começar no Telegram
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">A dor não precisa ser o seu normal.</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                A endometriose afeta milhões de mulheres, trazendo dores intensas, fadiga e inchaço. A alimentação é uma das ferramentas mais poderosas para combater a inflamação no corpo, mas saber o que comer todos os dias é exaustivo.
              </p>
              <p className="text-slate-600 leading-relaxed">
                A <strong>Endonutri</strong> resolve isso. Nossa IA analisa seus sintomas, restrições e objetivos para criar um plano alimentar focado em reduzir a inflamação, sem dietas restritivas impossíveis de seguir.
              </p>
            </div>
            <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-rose-200 w-32 h-32 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 bg-orange-200 w-32 h-32 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm">
                  <div className="bg-rose-100 p-2 rounded-full text-rose-600 mt-1">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Alívio das Dores</h4>
                    <p className="text-sm text-slate-500">Alimentos selecionados para reduzir prostaglandinas inflamatórias.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm">
                  <div className="bg-orange-100 p-2 rounded-full text-orange-600 mt-1">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Imunidade Fortalecida</h4>
                    <p className="text-sm text-slate-500">Nutrientes essenciais para equilibrar seu sistema imunológico.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-16">Como funciona?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6">1</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Inicie o Chat</h3>
              <p className="text-slate-600">Abra o Telegram e converse com a nossa assistente virtual.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6">2</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Conte sobre você</h3>
              <p className="text-slate-600">Compartilhe seus sintomas, restrições alimentares e objetivos.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Receba seu Plano</h3>
              <p className="text-slate-600">Em segundos, receba seu cardápio semanal e lista de compras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Planos Simples e Transparentes</h2>
          <p className="text-slate-600 mb-16 max-w-2xl mx-auto">Escolha o plano ideal para a sua jornada de nutrição anti-inflamatória.</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {/* Free Plan */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratuito</h3>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">R$ 0<span className="text-lg font-medium text-slate-500">/mês</span></div>
              <p className="text-slate-600 mb-8">Perfeito para conhecer a Endonutri e testar o primeiro plano.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">1 plano alimentar por conta</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">1 lista de compras</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Acesso via Telegram</span>
                </li>
              </ul>
              
              <a 
                href="https://t.me/EndonutriBot" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-4 rounded-full text-center font-semibold transition-colors"
              >
                Testar Grátis
              </a>
            </div>

            {/* Premium Plan */}
            <div className="bg-rose-500 rounded-3xl p-8 border border-rose-600 flex flex-col relative shadow-xl shadow-rose-200">
              <div className="absolute top-0 right-8 -mt-4 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recomendado
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="text-4xl font-extrabold text-white mb-6">R$ 19,90<span className="text-lg font-medium text-rose-200">/mês</span></div>
              <p className="text-rose-100 mb-8">Acesso total para transformar sua alimentação de verdade.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white shrink-0 mt-0.5" />
                  <span className="text-white">Planos alimentares <strong>ilimitados</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white shrink-0 mt-0.5" />
                  <span className="text-white">Listas de compras <strong>ilimitadas</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white shrink-0 mt-0.5" />
                  <span className="text-white">Acesso via Telegram</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white shrink-0 mt-0.5" />
                  <span className="text-white">Suporte prioritário</span>
                </li>
              </ul>
              
              <a 
                href="https://t.me/EndonutriBot" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-white hover:bg-rose-50 text-rose-600 px-6 py-4 rounded-full text-center font-semibold transition-colors shadow-sm"
              >
                Assinar Premium
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-rose-500 text-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Pronta para transformar sua alimentação?</h2>
          <p className="text-rose-100 text-lg mb-10">
            Junte-se a outras mulheres que estão retomando o controle de seus corpos através da nutrição anti-inflamatória.
          </p>
          <a 
            href="https://t.me/EndonutriBot" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white text-rose-600 hover:bg-rose-50 px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"
          >
            Começar no Telegram
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400 text-center">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Leaf className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold text-white tracking-tight">Endonutri</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Endonutri. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-4 max-w-2xl mx-auto opacity-60">
            Aviso: A Endonutri é uma ferramenta de apoio baseada em IA e não substitui o acompanhamento médico ou nutricional profissional. Sempre consulte seu médico antes de iniciar qualquer dieta.
          </p>
        </div>
      </footer>
    </div>
  );
}
