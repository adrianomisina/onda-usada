import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSuccess(false);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha');
      setForgotSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro na autenticação');
      }

      login(data.user);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-3xl font-black text-zinc-100 text-center uppercase tracking-tighter mb-2">
              {isForgotPassword ? 'Recuperação' : isLogin ? 'Entrar' : 'Cadastrar'}
            </h3>
            <p className="text-zinc-400 text-center mb-6">
              {isForgotPassword 
                ? 'Informe seu e-mail para receber o link de recuperação.' 
                : isLogin ? 'Acesse sua conta para continuar.' : 'Crie sua conta para anunciar e criar alertas.'}
            </p>

            {error && (
              <div className="bg-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-4 text-center">
                {error}
              </div>
            )}
            {forgotSuccess && (
              <div className="bg-green-500/20 text-green-500 p-3 rounded-xl text-sm mb-4 text-center">
                Se o e-mail existir, um link foi enviado! (Para teste, veja o console do servidor)
              </div>
            )}

            {isForgotPassword ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                      placeholder="surfista@exemplo.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors flex justify-center items-center mt-6"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Enviar Link'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Nome</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    placeholder="surfista@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors flex justify-center items-center mt-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </form>
            )}

            <div className="mt-6 flex flex-col items-center space-y-3">
              {isLogin && !isForgotPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setForgotSuccess(false);
                  }}
                  className="text-red-500 hover:text-red-400 text-sm font-semibold transition-colors"
                >
                  Esqueci minha senha
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isForgotPassword) {
                    setIsForgotPassword(false);
                  } else {
                    setIsLogin(!isLogin);
                  }
                  setError('');
                  setForgotSuccess(false);
                }}
                className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
              >
                {isForgotPassword 
                  ? 'Voltar para o Login' 
                  : isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
