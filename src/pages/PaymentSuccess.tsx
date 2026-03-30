import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const adId = searchParams.get('adId');
  const type = searchParams.get('type');
  const plan = searchParams.get('plan');

  useEffect(() => {
    // In a real app, you would verify the Mercado Pago payment here
    // and then confirm the ad highlight in the database.
  }, [adId, type, plan]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-zinc-900 rounded-3xl p-12 border border-zinc-800 shadow-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-8">
          <CheckCircle className="text-emerald-500" size={48} />
        </div>
        
        <h1 className="text-4xl font-black text-zinc-100 uppercase tracking-tighter mb-4">
          Anúncio Confirmado!
        </h1>
        
        <p className="text-xl text-zinc-400 mb-10 max-w-md mx-auto">
          {type === 'plan' || plan 
            ? "Seu anúncio foi publicado com o destaque selecionado e os interessados já podem falar direto com você."
            : "Seu anúncio foi publicado com sucesso e os interessados já podem falar direto com você."
          }
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-colors"
          >
            <Home size={20} />
            Página Inicial
          </Link>
          <Link 
            to="/profile?tab=ads" 
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20"
          >
            <ShoppingBag size={20} />
            Meus Anúncios
          </Link>
        </div>
      </div>
    </div>
  );
}
