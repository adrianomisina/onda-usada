import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, User, Calendar, Tag, ChevronLeft, ShoppingCart } from "lucide-react";

export default function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ads/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAd(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch ad", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Anúncio não encontrado</h2>
        <p className="text-zinc-400 mb-6">O anúncio que você está procurando não existe ou foi removido.</p>
        <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors">
          Voltar para o Início
        </Link>
      </div>
    );
  }

  const isPremium = ad.plan === "premium";
  const isPro = ad.plan === "pro";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-red-500 mb-6 transition-colors font-bold uppercase tracking-wider text-sm">
        <ChevronLeft size={20} className="mr-1" />
        Voltar para a lista
      </Link>

      <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-zinc-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="bg-zinc-800 aspect-square lg:aspect-auto lg:h-full relative">
            <img 
              src={ad.images[0] || "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=1200"} 
              alt={ad.title}
              className="w-full h-full object-cover"
            />
            {isPremium && (
              <div className="absolute top-4 left-4 bg-amber-500 text-amber-950 text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                Premium
              </div>
            )}
            {isPro && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                Pro
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {ad.category}
              </span>
              <span className="bg-red-600/20 text-red-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {ad.condition}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-zinc-100 mb-4 leading-tight uppercase tracking-tighter">
              {ad.title}
            </h1>
            
            <div className="text-4xl font-black text-red-500 mb-8">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}
            </div>

            <div className="space-y-6 mb-8 flex-grow">
              <div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2 uppercase tracking-wider">Descrição</h3>
                <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                  {ad.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-800">
                <div className="flex items-center text-zinc-400">
                  <MapPin className="text-zinc-500 mr-3" size={20} />
                  <span>{ad.location}</span>
                </div>
                <div className="flex items-center text-zinc-400">
                  <Calendar className="text-zinc-500 mr-3" size={20} />
                  <span>Publicado em {new Date(ad.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Seller Info & Contact */}
            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-800 mt-auto">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
                Informações do Vendedor
              </h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 mr-4">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-100 text-lg">{ad.sellerName}</div>
                    <div className="text-zinc-500 text-sm">Vendedor verificado</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <a 
                    href={`https://wa.me/55${ad.sellerPhone.replace(/\D/g, '')}?text=Olá! Vi seu anúncio "${ad.title}" no OndaUsada e tenho interesse.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm shadow-green-600/20"
                  >
                    <Phone size={20} />
                    WhatsApp
                  </a>
                  
                  {(isPremium || isPro) && (
                    <button
                      onClick={() => navigate(`/checkout/${ad._id}`)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm shadow-emerald-600/20"
                    >
                      <ShoppingCart size={20} />
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
