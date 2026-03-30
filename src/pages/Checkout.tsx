import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Phone, ShieldCheck, User } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams();
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/ads/${id}`)
      .then(res => res.json())
      .then(data => setAd(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!ad) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 sm:p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-center gap-3 mb-8">
        <ShieldCheck className="text-emerald-500" size={28} />
        <h2 className="text-2xl font-bold text-zinc-100">Contato do Anunciante</h2>
      </div>
      
      <div className="bg-zinc-950 rounded-xl p-6 mb-8 border border-zinc-800/50">
        <div className="flex gap-4 mb-6">
          <img src={ad.images[0]} alt={ad.title} className="w-20 h-20 object-cover rounded-lg" />
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-zinc-100 line-clamp-2">{ad.title}</h3>
            <p className="text-zinc-500 text-sm mt-1">{ad.location}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 text-zinc-300">
            <User size={18} className="text-zinc-500" />
            <span>{ad.sellerName}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <Phone size={18} className="text-zinc-500" />
            <span>{ad.sellerPhone}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-zinc-400 text-sm text-center">
          A negociação e a forma de pagamento são combinadas diretamente com o anunciante.
        </p>
      </div>

      <a
        href={`https://wa.me/55${ad.sellerPhone.replace(/\D/g, '')}?text=Olá! Vi seu anúncio "${ad.title}" no OndaUsada e tenho interesse.`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-600/20"
      >
        <MessageCircle size={20} />
        Falar no WhatsApp
      </a>

      <Link
        to={`/ad/${ad._id}`}
        className="mt-4 block text-center text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
      >
        Voltar ao anúncio
      </Link>
    </div>
  );
}
