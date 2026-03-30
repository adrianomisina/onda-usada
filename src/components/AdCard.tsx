import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Tag, Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AdCardProps {
  ad: {
    _id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
    plan: string;
    category: string;
  };
}

export default function AdCard({ ad }: AdCardProps) {
  const { user, openAuthModal, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const isPremium = ad.plan === "premium";
  const isPro = ad.plan === "pro";
  const isFavorite = user?.favorites?.includes(ad._id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      openAuthModal();
      return;
    }

    await toggleFavorite(ad._id);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/checkout/${ad._id}`);
  };

  return (
    <Link 
      to={`/ad/${ad._id}`} 
      className={`group flex flex-col bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border ${
        isPremium ? "border-amber-500 ring-1 ring-amber-500" : 
        isPro ? "border-red-500" : "border-zinc-800"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        <img 
          src={ad.images[0] || "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800"} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isPremium && (
          <div className="absolute top-3 left-3 bg-amber-500 text-amber-950 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            Premium
          </div>
        )}
        {isPro && !isPremium && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            Pro
          </div>
        )}
        
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-900/80 transition-colors z-10"
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart 
            size={20} 
            className={isFavorite ? "fill-red-500 text-red-500" : "text-zinc-100"} 
          />
        </button>

        <div className="absolute bottom-3 right-3 bg-zinc-900/90 backdrop-blur-sm text-zinc-100 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
          <Tag size={12} />
          {ad.category}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-zinc-100 line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
          {ad.title}
        </h3>
        
        <div className="mt-auto pt-4 flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black text-zinc-100">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}
              </p>
              <div className="flex items-center text-zinc-400 text-sm mt-1">
                <MapPin size={14} className="mr-1" />
                <span className="truncate max-w-[150px]">{ad.location}</span>
              </div>
            </div>
          </div>

          {(isPremium || isPro) && (
            <button
              onClick={handleBuyClick}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <ShoppingCart size={18} />
              Comprar
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
