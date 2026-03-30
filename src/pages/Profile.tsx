import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Package, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdCard from "../components/AdCard";

export default function Profile() {
  const { user, logout, isReady } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "ads" ? "ads" : searchParams.get("tab") === "settings" ? "settings" : "favorites";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!user) {
      navigate("/");
      return;
    }

    if (activeTab === "favorites") {
      setLoading(true);
      fetch(`/api/users/${user.id}/favorites`)
        .then(res => res.json())
        .then(data => {
          setFavorites(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch favorites", err);
          setLoading(false);
        });
      return;
    }

    if (activeTab === "ads") {
      setLoading(true);
      fetch(`/api/users/${user.id}/ads`)
        .then(res => res.json())
        .then(data => {
          setMyAds(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch user ads", err);
          setLoading(false);
        });
    }
  }, [user, navigate, activeTab, user?.favorites, isReady]); // Re-fetch when user.favorites changes

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "ads" || tab === "settings" || tab === "favorites") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!isReady) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleTabChange = (tab: "favorites" | "ads" | "settings") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-100">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-zinc-100">{user.name}</h2>
                <p className="text-sm text-zinc-400 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => handleTabChange("favorites")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === "favorites" 
                    ? "bg-red-600/10 text-red-500 font-medium" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                <Heart size={20} className={activeTab === "favorites" ? "fill-red-500/20" : ""} />
                Meus Favoritos
              </button>
              <button 
                onClick={() => handleTabChange("ads")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === "ads" 
                    ? "bg-red-600/10 text-red-500 font-medium" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                <Package size={20} />
                Meus Anúncios
              </button>
              <button 
                onClick={() => handleTabChange("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === "settings" 
                    ? "bg-red-600/10 text-red-500 font-medium" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                <Settings size={20} />
                Configurações
              </button>
            </nav>

            <div className="mt-8 pt-8 border-t border-zinc-800">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={20} />
                Sair da conta
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {activeTab === "favorites" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8"
            >
              <h1 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
                <Heart className="text-red-500 fill-red-500/20" />
                Meus Favoritos
              </h1>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map((ad, index) => (
                    <motion.div
                      key={ad._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AdCard ad={ad} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-4">
                    <Heart className="text-zinc-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-2">Nenhum favorito ainda</h3>
                  <p className="text-zinc-400 max-w-md mx-auto mb-6">
                    Você ainda não salvou nenhum anúncio. Navegue pelos anúncios e clique no coração para salvá-los aqui.
                  </p>
                  <button 
                    onClick={() => navigate("/")}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-colors"
                  >
                    Explorar Anúncios
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "ads" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8"
            >
              <h1 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
                <Package className="text-zinc-400" />
                Meus Anúncios
              </h1>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : myAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myAds.map((ad, index) => (
                    <motion.div
                      key={ad._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AdCard ad={ad} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                  <p className="text-zinc-400">Você ainda não tem anúncios publicados.</p>
                  <button 
                    onClick={() => navigate("/post-ad")}
                    className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-colors inline-block"
                  >
                    Criar Anúncio
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 md:p-8"
            >
              <h1 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
                <Settings className="text-zinc-400" />
                Configurações
              </h1>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Nome</label>
                  <input 
                    type="text" 
                    value={user.name}
                    disabled
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">E-mail</label>
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 opacity-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-sm text-zinc-500 italic">
                  A edição de perfil estará disponível em breve.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
