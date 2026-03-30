import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, LogOut, User as UserIcon } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();

  const handlePostAdClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8" />
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 mr-4">
                <Link to="/profile" className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm transition-colors">
                  <UserIcon size={16} />
                  <span>{user.name}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-zinc-500 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={openAuthModal}
                className="text-zinc-400 hover:text-zinc-100 text-sm font-bold uppercase tracking-wider mr-2"
              >
                Entrar
              </button>
            )}

            <Link 
              to="/post-ad" 
              onClick={handlePostAdClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-colors"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Anunciar</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
