import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/ads/${id}`)
      .then(res => res.json())
      .then(data => setAd(data))
      .catch(err => console.error(err));
  }, [id]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: id, type: 'product' }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar link de pagamento");
      }

      const data = await response.json();
      
      if (data.checkoutUrl) {
        if (data.checkoutUrl.startsWith('http')) {
          window.location.href = data.checkoutUrl;
        } else {
          navigate(data.checkoutUrl);
        }
      } else {
        throw new Error("Erro ao gerar link de pagamento");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!ad) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Pagamento Aprovado!</h2>
        <p className="text-zinc-400 mb-6">Sua compra do item "{ad.title}" foi confirmada com sucesso.</p>
        <p className="text-sm text-zinc-500">Redirecionando para a página inicial...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 sm:p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-center gap-3 mb-8">
        <ShieldCheck className="text-emerald-500" size={28} />
        <h2 className="text-2xl font-bold text-zinc-100">Pagamento Seguro</h2>
      </div>
      
      <div className="bg-zinc-950 rounded-xl p-6 mb-8 border border-zinc-800/50">
        <div className="flex gap-4 mb-6">
          <img src={ad.images[0]} alt={ad.title} className="w-20 h-20 object-cover rounded-lg" />
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-zinc-100 line-clamp-2">{ad.title}</h3>
            <p className="text-zinc-500 text-sm mt-1">{ad.location}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex justify-between text-zinc-400">
            <span>Preço do Item</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Proteção OndaUsada</span>
            <span className="text-emerald-500">Grátis</span>
          </div>
          <div className="flex justify-between text-xl font-black text-zinc-100 pt-3 border-t border-zinc-800">
            <span>Total</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-zinc-400 text-sm text-center">
          Você será redirecionado para o ambiente seguro do Mercado Pago para finalizar sua compra.
        </p>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-600/20"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processando...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Pagar com Mercado Pago
          </>
        )}
      </button>

      <div className="mt-6 flex items-center justify-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-bold">
        <ShieldCheck size={14} />
        Pagamento 100% Seguro
      </div>
    </div>
  );
}
