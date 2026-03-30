import React, { useState, useEffect } from "react";
import { Search, MapPin, Filter, Bell } from "lucide-react";
import AdCard from "../components/AdCard";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, openAuthModal } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  
  // Subscription states
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        setAds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch ads", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  const handleCreateAlertClick = () => {
    if (!user) {
      openAuthModal();
    } else {
      setShowModal(true);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribing(true);
    try {
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          category,
          location,
          searchTerm
        })
      });
      
      // Save email to local storage to receive SSE notifications
      localStorage.setItem("ondaUsadaEmail", email);
      
      setSubscribed(true);
      setTimeout(() => {
        setShowModal(false);
        setSubscribed(false);
      }, 2000);
      
      // Dispatch event to app to reconnect SSE
      window.dispatchEvent(new Event('subscription-updated'));
    } catch (err) {
      console.error("Failed to subscribe", err);
      alert("Erro ao criar alerta. Tente novamente.");
    } finally {
      setSubscribing(false);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category ? ad.category === category : true;
    const matchesLocation = location ? ad.location.toLowerCase().includes(location.toLowerCase()) : true;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=2000" 
            alt="Surfer" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6"
          >
            Sua próxima onda <br className="hidden md:block" />
            <span className="text-red-600">começa aqui.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-10"
          >
            Encontre equipamentos usados e fale direto com o anunciante. No OndaUsada, você paga apenas para destacar seu anúncio.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl"
          >
            <div className="flex-grow flex items-center px-4 bg-zinc-800/50 rounded-xl">
              <Search className="text-zinc-400 mr-2 shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="O que você está procurando?" 
                className="w-full bg-transparent border-none focus:ring-0 py-3 text-zinc-100 placeholder-zinc-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48 flex items-center px-4 bg-zinc-800/50 rounded-xl border-t sm:border-t-0 sm:border-l border-zinc-800">
              <MapPin className="text-zinc-400 mr-2 shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Localização" 
                className="w-full bg-transparent border-none focus:ring-0 py-3 text-zinc-100 placeholder-zinc-500 outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="sm:w-48 flex items-center px-4 bg-zinc-800/50 rounded-xl border-t sm:border-t-0 sm:border-l border-zinc-800">
              <Filter className="text-zinc-400 mr-2 shrink-0" size={20} />
              <select 
                className="w-full bg-zinc-800 border-none focus:ring-0 py-3 text-zinc-100 outline-none cursor-pointer rounded-lg"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" className="bg-zinc-900 text-zinc-100">Todas Categorias</option>
                <option value="Pranchas" className="bg-zinc-900 text-zinc-100">Pranchas</option>
                <option value="Equipamentos" className="bg-zinc-900 text-zinc-100">Equipamentos</option>
                <option value="Acessórios" className="bg-zinc-900 text-zinc-100">Acessórios</option>
              </select>
            </div>
            <button 
              onClick={handleCreateAlertClick}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-zinc-700"
              title="Criar Alerta"
            >
              <Bell size={20} />
              <span className="sm:hidden">Criar Alerta</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-zinc-100">
            {searchTerm || category || location ? "Resultados da Busca" : "Anúncios Recentes"}
          </h2>
          <div className="text-sm text-zinc-500">
            {filteredAds.length} {filteredAds.length === 1 ? 'resultado' : 'resultados'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAds.map((ad, index) => (
              <motion.div
                key={ad._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AdCard ad={ad} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
              <Search className="text-zinc-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Não encontramos anúncios com os filtros atuais. Tente outros termos, categorias ou localização.
            </p>
            <button 
              onClick={() => { setSearchTerm(""); setCategory(""); setLocation(""); }}
              className="mt-6 text-red-500 font-bold hover:text-red-400 underline underline-offset-4"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {/* Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                <Bell className="text-red-500" size={32} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-zinc-100 text-center uppercase tracking-tighter mb-2">
              Criar Alerta
            </h3>
            <p className="text-zinc-400 text-center mb-6">
              Receba notificações quando novos anúncios corresponderem à sua busca atual.
            </p>

            <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 border border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Filtros Atuais:</h4>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li><span className="text-zinc-500">Busca:</span> {searchTerm || "Qualquer"}</li>
                <li><span className="text-zinc-500">Local:</span> {location || "Qualquer"}</li>
                <li><span className="text-zinc-500">Categoria:</span> {category || "Todas"}</li>
              </ul>
            </div>

            {subscribed ? (
              <div className="bg-green-500/20 text-green-500 p-4 rounded-xl text-center font-bold">
                Alerta criado com sucesso!
              </div>
            ) : (
              <form onSubmit={handleSubscribe}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                    Seu E-mail
                  </label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="surfista@exemplo.com"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow placeholder-zinc-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={subscribing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors flex justify-center items-center"
                  >
                    {subscribing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      "Salvar Alerta"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
