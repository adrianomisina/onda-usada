import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  favorites?: string[];
}

interface AuthContextType {
  user: User | null;
  isReady: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  toggleFavorite: (adId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('ondaUsadaUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user");
      }
    }
    setIsReady(true);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ondaUsadaUser', JSON.stringify(userData));
    localStorage.setItem('ondaUsadaEmail', userData.email); // For SSE
    window.dispatchEvent(new Event('subscription-updated')); // Reconnect SSE with new email
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ondaUsadaUser');
    localStorage.removeItem('ondaUsadaEmail');
    window.dispatchEvent(new Event('subscription-updated')); // Disconnect SSE
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const toggleFavorite = async (adId: string) => {
    if (!user) return;

    const isFavorite = user.favorites?.includes(adId);
    const method = isFavorite ? 'DELETE' : 'POST';
    const url = isFavorite 
      ? `/api/users/${user.id}/favorites/${adId}`
      : `/api/users/${user.id}/favorites`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isFavorite ? undefined : JSON.stringify({ adId })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, favorites: data.favorites };
        setUser(updatedUser);
        localStorage.setItem('ondaUsadaUser', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, logout, isAuthModalOpen, openAuthModal, closeAuthModal, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
