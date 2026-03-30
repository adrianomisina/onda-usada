import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Upload, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PostAd() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Pranchas",
    condition: "Usado - Bom",
    location: "",
    sellerName: "",
    sellerPhone: "",
    images: ["https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&q=80&w=800"], // Default image for prototype
    plan: "basic"
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (plan: string) => {
    setFormData({ ...formData, plan });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal();
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      // 1. Create Ad
      const adResponse = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          ownerId: user.id,
        }),
      });

      if (!adResponse.ok) {
        throw new Error("Erro ao criar anúncio");
      }

      const ad = await adResponse.json();

      // 2. Process Payment (Mercado Pago)
      if (formData.plan !== "basic") {
        const checkoutResponse = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: formData.plan, adId: ad._id }),
        });

        if (!checkoutResponse.ok) {
          throw new Error("Erro ao iniciar pagamento");
        }

        const checkout = await checkoutResponse.json();
        
        if (checkout.checkoutUrl.startsWith('http')) {
          window.location.href = checkout.checkoutUrl;
        } else {
          navigate(checkout.checkoutUrl);
        }
      } else {
        // Free plan, go straight to success
        navigate(`/payment-success?adId=${ad._id}&plan=basic`);
      }
    } catch (err) {
      console.error("Failed to post ad", err);
      alert("Erro ao publicar anúncio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "Grátis",
      features: ["Anúncio ativo por 30 dias", "Até 3 fotos", "Busca padrão"],
      color: "border-zinc-800 hover:border-red-500",
      bg: "bg-zinc-900",
      badge: null
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$ 29,90",
      features: ["Anúncio ativo por 60 dias", "Até 10 fotos", "Destaque nas buscas", "Selo Pro"],
      color: "border-red-600 ring-1 ring-red-600",
      bg: "bg-red-950/20",
      badge: "Mais Popular"
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 59,90",
      features: ["Anúncio ativo por tempo indeterminado", "Fotos ilimitadas", "Topo da página inicial", "Selo Premium", "Suporte prioritário"],
      color: "border-amber-500 ring-2 ring-amber-500",
      bg: "bg-amber-950/20",
      badge: "Máxima Visibilidade"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter">Anunciar Equipamento</h1>
        <p className="text-zinc-400 mt-2">Venda sua prancha ou equipamento para milhares de surfistas em todo o Brasil.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center mb-8">
        <div className={`flex-1 h-2 rounded-l-full ${step >= 1 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
        <div className={`flex-1 h-2 rounded-r-full ${step >= 2 ? 'bg-red-600' : 'bg-zinc-800'}`}></div>
      </div>

      <div className="bg-zinc-900 rounded-3xl shadow-sm border border-zinc-800 overflow-hidden">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="p-8 sm:p-10">
              <h2 className="text-xl font-bold text-zinc-100 mb-6 uppercase tracking-wider">Detalhes do Produto</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Título do Anúncio</label>
                    <input 
                      required
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ex: Prancha Al Merrick 5'10" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Preço (R$)</label>
                    <input 
                      required
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Ex: 1500" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Categoria</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    >
                      <option value="Pranchas">Pranchas</option>
                      <option value="Equipamentos">Equipamentos (Wetsuits, etc)</option>
                      <option value="Acessórios">Acessórios (Quilhas, Leash)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Condição</label>
                    <select 
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Usado - Excelente">Usado - Excelente</option>
                      <option value="Usado - Bom">Usado - Bom</option>
                      <option value="Usado - Com marcas">Usado - Com marcas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Descrição</label>
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4} 
                    placeholder="Descreva os detalhes, medidas, tempo de uso..."
                    className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow resize-none placeholder-zinc-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Localização</label>
                    <input 
                      required
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ex: Rio de Janeiro, RJ" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Seu Nome</label>
                    <input 
                      required
                      type="text" 
                      name="sellerName"
                      value={formData.sellerName}
                      onChange={handleChange}
                      placeholder="Ex: João Silva" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">WhatsApp</label>
                    <input 
                      required
                      type="tel" 
                      name="sellerPhone"
                      value={formData.sellerPhone}
                      onChange={handleChange}
                      placeholder="(21) 99999-9999" 
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">Fotos</label>
                  <div className="border-2 border-dashed border-zinc-700 bg-zinc-800/50 rounded-2xl p-8 text-center hover:bg-zinc-800 transition-colors cursor-pointer">
                    <Upload className="mx-auto text-zinc-500 mb-3" size={32} />
                    <p className="text-zinc-300 font-bold">Clique para fazer upload de fotos</p>
                    <p className="text-zinc-500 text-sm mt-1">JPG, PNG até 5MB</p>
                    <p className="text-xs text-red-500 mt-4 font-bold">*Para este protótipo, uma imagem padrão será usada.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-colors text-lg shadow-lg shadow-red-600/20"
                >
                  Continuar para Planos
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-wider">Escolha um Plano</h2>
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-zinc-400 hover:text-red-500 font-bold uppercase tracking-wider text-sm transition-colors"
                >
                  Voltar para edição
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 border-2 ${plan.color} ${plan.bg} ${formData.plan === plan.id ? 'scale-105 shadow-xl z-10' : 'hover:shadow-md'}`}
                  >
                    {plan.badge && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm whitespace-nowrap ${plan.id === 'premium' ? 'bg-amber-500 text-amber-950' : 'bg-red-600 text-white'}`}>
                        {plan.badge}
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-zinc-100 mb-2 uppercase tracking-wider">{plan.name}</h3>
                      <div className="text-3xl font-black text-zinc-100">{plan.price}</div>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-zinc-400">
                          <Check className="text-red-500 mr-2 shrink-0" size={18} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className={`w-full py-3 rounded-xl text-center font-bold uppercase tracking-wider transition-colors ${formData.plan === plan.id ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}>
                      {formData.plan === plan.id ? 'Selecionado' : 'Selecionar'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-800 mb-10 flex items-start gap-4">
                <ShieldCheck className="text-red-500 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-zinc-100 uppercase tracking-wider">Pagamento Seguro via Mercado Pago</h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    Ao prosseguir, você será redirecionado para o Mercado Pago para pagar apenas pelo destaque do anúncio selecionado.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-wider transition-colors text-lg shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    formData.plan === 'basic' ? 'Publicar Anúncio Grátis' : 'Ir para Pagamento'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
