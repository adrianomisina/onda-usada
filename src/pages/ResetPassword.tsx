import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de recuperação ausente. Use o link correto.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha');
      
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center">
            Redefinir Senha
          </h2>
          <p className="text-zinc-400 text-center mb-6">
            Crie uma nova senha para sua conta.
          </p>

          {error && (
            <div className="bg-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-4 text-center">
              {error}
            </div>
          )}
          {success ? (
            <div className="bg-green-500/20 text-green-500 p-6 rounded-xl text-center">
              <p className="font-bold mb-2">Senha alterada com sucesso!</p>
              <p className="text-sm">Você será redirecionado para o início...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  'Salvar Senha'
                )}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
