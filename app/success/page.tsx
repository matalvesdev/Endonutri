import Link from 'next/link';
import { CheckCircle2, Leaf } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-rose-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Pagamento Confirmado!</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Obrigada por assinar o <strong>Endonutri Premium</strong>. Seu acesso ilimitado já foi liberado no Telegram.
        </p>
        
        <a 
          href="https://t.me/EndonutriBot" 
          target="_blank" 
          rel="noreferrer"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-4 rounded-full text-lg font-semibold transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 mb-4"
        >
          Voltar para o Telegram
        </a>
        
        <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          Voltar para a página inicial
        </Link>
      </div>
      
      <div className="mt-12 flex items-center gap-2 opacity-50">
        <Leaf className="h-5 w-5 text-rose-500" />
        <span className="font-bold text-slate-900 tracking-tight">Endonutri</span>
      </div>
    </div>
  );
}
