import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = 12;

// Models
const adSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  condition: String,
  location: String,
  images: [String],
  plan: { type: String, enum: ["basic", "pro", "premium"], default: "basic" },
  createdAt: { type: Date, default: Date.now },
  sellerName: String,
  sellerPhone: String,
  ownerId: String,
});

const Ad = mongoose.models.Ad || mongoose.model("Ad", adSchema);
const AdModel = Ad as any;

const subscriptionSchema = new mongoose.Schema({
  email: String,
  category: String,
  location: String,
  searchTerm: String,
  createdAt: { type: Date, default: Date.now },
});

const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String }, // In a real app, this MUST be hashed
  favorites: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const passwordResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Expira em 1 hora
});

const PasswordResetToken = mongoose.models.PasswordResetToken || mongoose.model("PasswordResetToken", passwordResetTokenSchema);

// In-memory fallback if MongoDB is not connected
let inMemoryAds: any[] = [
  {
    _id: "1",
    title: "Prancha Al Merrick 5'10",
    description: "Prancha em ótimo estado, poucas marcas de uso. Acompanha quilhas FCS II.",
    price: 1800,
    category: "Pranchas",
    condition: "Usado - Excelente",
    location: "Rio de Janeiro, RJ",
    images: ["https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&q=80&w=800"],
    plan: "premium",
    createdAt: new Date().toISOString(),
    sellerName: "João Silva",
    sellerPhone: "13999999999"
  },
  {
    _id: "2",
    title: "Longboard Clássico 9'0",
    description: "Longboard perfeito para os dias pequenos. Flutuação incrível.",
    price: 2500,
    category: "Pranchas",
    condition: "Usado - Bom",
    location: "Florianópolis, SC",
    images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800"],
    plan: "pro",
    createdAt: new Date().toISOString(),
    sellerName: "Carlos Souza",
    sellerPhone: "13988888888"
  },
  {
    _id: "3",
    title: "Roupa de Borracha Rip Curl 3/2mm",
    description: "Wetsuit Rip Curl E-Bomb, super flexível. Usado apenas 1 temporada.",
    price: 800,
    category: "Equipamentos",
    condition: "Usado - Bom",
    location: "Saquarema, RJ",
    // BUG-001 CORRIGIDO: URL de imagem válida para wetsuit (verificada com curl)
    images: ["https://images.unsplash.com/photo-1527956041665-d7a1b380c460?auto=format&fit=crop&q=80&w=800"],
    plan: "basic",
    createdAt: new Date().toISOString(),
    sellerName: "Mariana Costa",
    sellerPhone: "13977777777"
  }
];

let inMemorySubscriptions: any[] = [];
let sseClients: { email: string, res: express.Response }[] = [];

function notifySubscribers(ad: any, isMongoConnected: boolean) {
  const checkAndNotify = (subs: any[]) => {
    subs.forEach(sub => {
      const matchesCategory = !sub.category || ad.category === sub.category;
      const matchesLocation = !sub.location || ad.location.toLowerCase().includes(sub.location.toLowerCase());
      const matchesSearch = !sub.searchTerm || 
        ad.title.toLowerCase().includes(sub.searchTerm.toLowerCase()) || 
        ad.description.toLowerCase().includes(sub.searchTerm.toLowerCase());
      
      if (matchesCategory && matchesLocation && matchesSearch) {
        sseClients.forEach(client => {
          if (client.email === sub.email) {
            client.res.write(`data: ${JSON.stringify({ type: 'NEW_AD', ad })}\n\n`);
          }
        });
      }
    });
  };

  if (isMongoConnected) {
    Subscription.find().then(subs => checkAndNotify(subs)).catch(console.error);
  } else {
    checkAndNotify(inMemorySubscriptions);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB if URI is provided
  let isMongoConnected = false;
  // BUG-004 CORRIGIDO: Sem credenciais hardcoded — use .env para desenvolvimento
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      isMongoConnected = true;
      console.log("Connected to MongoDB Atlas");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      console.log("Using in-memory database for prototype fallback.");
    }
  } else {
    console.log("MONGODB_URI não configurada. Usando banco em memória (apenas dev).");
  }

  // Mercado Pago Configuration
  // BUG-004 CORRIGIDO: Sem token hardcoded
  const mpAccessToken = process.env.MP_ACCESS_TOKEN;
  const client = mpAccessToken ? new MercadoPagoConfig({ accessToken: mpAccessToken }) : null;
  const preference = client ? new Preference(client) : null;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: isMongoConnected ? "mongodb" : "in-memory" });
  });

  app.get("/api/ads", async (req, res) => {
    try {
      if (isMongoConnected) {
        const ads = await (Ad as any).find().sort({ plan: -1, createdAt: -1 });
        // Sort premium first, then pro, then basic
        const order = { premium: 3, pro: 2, basic: 1 };
        ads.sort((a: any, b: any) => order[b.plan as keyof typeof order] - order[a.plan as keyof typeof order]);
        res.json(ads);
      } else {
        const ads = [...inMemoryAds];
        const order = { premium: 3, pro: 2, basic: 1 };
        ads.sort((a: any, b: any) => order[b.plan as keyof typeof order] - order[a.plan as keyof typeof order]);
        res.json(ads);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  app.get("/api/ads/:id", async (req, res) => {
    try {
      if (isMongoConnected) {
        const ad = await (Ad as any).findById(req.params.id);
        if (!ad) return res.status(404).json({ error: "Ad not found" });
        res.json(ad);
      } else {
        const ad = inMemoryAds.find(a => a._id === req.params.id);
        if (!ad) return res.status(404).json({ error: "Ad not found" });
        res.json(ad);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch ad" });
    }
  });

  app.post("/api/ads", async (req, res) => {
    try {
      const newAdData = req.body;
      let createdAd;
      if (isMongoConnected) {
        const newAd = new (Ad as any)(newAdData);
        await newAd.save();
        createdAd = newAd;
      } else {
        const newAd = {
          _id: Math.random().toString(36).substr(2, 9),
          ...newAdData,
          createdAt: new Date().toISOString()
        };
        inMemoryAds.push(newAd);
        createdAd = newAd;
      }
      
      notifySubscribers(createdAd, isMongoConnected);
      res.status(201).json(createdAd);
    } catch (err) {
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  app.get("/api/users/:id/ads", async (req, res) => {
    try {
      const { id } = req.params;

      if (isMongoConnected) {
        const ads = await (Ad as any).find({ ownerId: id }).sort({ createdAt: -1 });
        return res.json(ads);
      }

      const ads = inMemoryAds
        .filter(ad => ad.ownerId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(ads);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar anúncios do usuário" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const subData = req.body;
      if (isMongoConnected) {
        const newSub = new Subscription(subData);
        await newSub.save();
        res.status(201).json(newSub);
      } else {
        const newSub = {
          _id: Math.random().toString(36).substr(2, 9),
          ...subData,
          createdAt: new Date().toISOString()
        };
        inMemorySubscriptions.push(newSub);
        res.status(201).json(newSub);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.get("/api/notifications/stream", (req, res) => {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: "Email required" });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { email, res };
    sseClients.push(client);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== client);
    });
  });

  // Auth Routes
  let inMemoryUsers: any[] = [];
  let inMemoryResetTokens: any[] = [];

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
      }

      // BUG-003 CORRIGIDO: Hash da senha com bcrypt
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      let user;
      if (isMongoConnected) {
        const existingUser = await (User as any).findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: "E-mail já cadastrado" });
        }
        
        user = new (User as any)({ name, email, password: hashedPassword });
        await user.save();
      } else {
        const existingUser = inMemoryUsers.find(u => u.email === email);
        if (existingUser) {
          return res.status(400).json({ error: "E-mail já cadastrado" });
        }
        
        user = {
          _id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          password: hashedPassword,
          favorites: [],
          createdAt: new Date().toISOString()
        };
        inMemoryUsers.push(user);
      }

      res.status(201).json({ 
        user: { id: user._id, name: user.name, email: user.email, favorites: user.favorites || [] } 
      });
    } catch (err) {
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
      }

      let user;
      if (isMongoConnected) {
        user = await (User as any).findOne({ email });
      } else {
        user = inMemoryUsers.find(u => u.email === email);
      }

      if (!user) {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }

      // BUG-003 CORRIGIDO: Comparação segura com bcrypt
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }

      res.json({ 
        user: { id: user._id, name: user.name, email: user.email, favorites: user.favorites || [] } 
      });
    } catch (err) {
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });

      let userExists = false;
      if (isMongoConnected) {
        const user = await (User as any).findOne({ email });
        userExists = !!user;
      } else {
        userExists = !!inMemoryUsers.find((u) => u.email === email);
      }

      if (!userExists) {
        // Retornamos 200 mesmo sem usuário para não vazar emails
        return res.json({ message: "Se o e-mail existir, um link de recuperação foi enviado." });
      }

      // Generate a simple token (normally would be a secure random hex)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      if (isMongoConnected) {
        await PasswordResetToken.create({ email, token });
      } else {
        inMemoryResetTokens.push({ email, token, createdAt: Date.now() });
      }

      // NO MUNDO REAL AQUI ENVIARIA UM E-MAIL. PARA ESTE PROJETO:
      console.log(`\n\n=== RECOVERY TOKEN ==\nEmail: ${email}\nURL: /reset-password?token=${token}\n=====================\n\n`);

      res.json({ message: "Se o e-mail existir, um link de recuperação foi enviado." });
    } catch (err) {
      res.status(500).json({ error: "Erro ao solicitar redefinição" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Token inválido ou senha muito curta (mínimo 6)" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      let emailToReset = null;

      if (isMongoConnected) {
        const resetTokenDoc = await (PasswordResetToken as any).findOne({ token });
        if (!resetTokenDoc) return res.status(400).json({ error: "Token inválido ou expirado" });
        emailToReset = resetTokenDoc.email;
        
        await (User as any).updateOne({ email: emailToReset }, { password: hashedPassword });
        await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id }); // Invalida token
      } else {
        const resetObjIndex = inMemoryResetTokens.findIndex(t => t.token === token);
        if (resetObjIndex === -1) return res.status(400).json({ error: "Token inválido ou expirado" });
        emailToReset = inMemoryResetTokens[resetObjIndex].email;
        
        const userIndex = inMemoryUsers.findIndex(u => u.email === emailToReset);
        if (userIndex !== -1) {
          inMemoryUsers[userIndex].password = hashedPassword;
        }
        inMemoryResetTokens.splice(resetObjIndex, 1); // Invalida token
      }

      res.json({ message: "Senha atualizada com sucesso" });
    } catch (err) {
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  });

  // Favorites Routes
  app.get("/api/users/:id/favorites", async (req, res) => {
    try {
      const { id } = req.params;
      let user;
      if (isMongoConnected) {
        user = await (User as any).findById(id);
      } else {
        user = inMemoryUsers.find(u => u._id === id);
      }

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const favoriteIds = user.favorites || [];
      let favoriteAds;
      
      if (isMongoConnected) {
        favoriteAds = await (Ad as any).find({ _id: { $in: favoriteIds } });
      } else {
        favoriteAds = inMemoryAds.filter(ad => favoriteIds.includes(ad._id));
      }

      res.json(favoriteAds);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar favoritos" });
    }
  });

  app.post("/api/users/:id/favorites", async (req, res) => {
    try {
      const { id } = req.params;
      const { adId } = req.body;

      if (!adId) {
        return res.status(400).json({ error: "ID do anúncio é obrigatório" });
      }

      let user;
      if (isMongoConnected) {
        user = await (User as any).findById(id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        
        if (!user.favorites) user.favorites = [];
        if (!user.favorites.includes(adId)) {
          user.favorites.push(adId);
          await user.save();
        }
      } else {
        user = inMemoryUsers.find(u => u._id === id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        
        if (!user.favorites) user.favorites = [];
        if (!user.favorites.includes(adId)) {
          user.favorites.push(adId);
        }
      }

      res.json({ favorites: user.favorites });
    } catch (err) {
      res.status(500).json({ error: "Erro ao adicionar favorito" });
    }
  });

  app.delete("/api/users/:id/favorites/:adId", async (req, res) => {
    try {
      const { id, adId } = req.params;

      let user;
      if (isMongoConnected) {
        user = await (User as any).findById(id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        
        if (user.favorites) {
          user.favorites = user.favorites.filter((favId: string) => favId !== adId);
          await user.save();
        }
      } else {
        user = inMemoryUsers.find(u => u._id === id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        
        if (user.favorites) {
          user.favorites = user.favorites.filter((favId: string) => favId !== adId);
        }
      }

      res.json({ favorites: user.favorites || [] });
    } catch (err) {
      res.status(500).json({ error: "Erro ao remover favorito" });
    }
  });

  // Mercado Pago Checkout
  app.post("/api/checkout", async (req, res) => {
    try {
      const { plan, adId, type = 'plan' } = req.body;
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const hasPublicAppUrl = Boolean(appUrl) && !/localhost|127\.0\.0\.1/.test(appUrl);
      
      let title = "";
      let amount = 0;

      if (type === 'plan') {
        const prices = {
          basic: 0,
          pro: 29.90,
          premium: 59.90
        };
        amount = prices[plan as keyof typeof prices];
        title = `Plano ${plan.toUpperCase()} - OndaUsada`;
      } else {
        // Product purchase
        let ad;
        if (isMongoConnected) {
          ad = await (Ad as any).findById(adId);
        } else {
          ad = inMemoryAds.find(a => a._id === adId);
        }
        
        if (!ad) return res.status(404).json({ error: "Anúncio não encontrado" });
        
        amount = ad.price;
        title = ad.title;
      }

      if (amount === 0) {
        return res.json({
          success: true,
          checkoutUrl: `/payment-success?adId=${adId}&plan=${plan || 'basic'}`,
          amount: 0
        });
      }

      if (!preference) {
        return res.status(503).json({
          error: "Pagamento não disponível. Configure a variável MP_ACCESS_TOKEN."
        });
      }

      // Calculate 10% marketplace fee for product sales
      const marketplaceFee = type === 'product' ? amount * 0.1 : 0;

      const preferenceBody: any = {
        items: [
          {
            id: adId,
            title: title,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL'
          }
        ],
        marketplace_fee: marketplaceFee, // This is where the 10% cut goes to the platform owner
      };

      if (hasPublicAppUrl) {
        preferenceBody.back_urls = {
          success: `${appUrl}/payment-success?adId=${adId}&type=${type}`,
          failure: `${appUrl}/`,
          pending: `${appUrl}/`
        };
        preferenceBody.auto_return = 'approved';
      }

      const result = await preference.create({
        body: preferenceBody
      });

      res.json({
        success: true,
        checkoutUrl: result.init_point,
        amount: amount
      });
    } catch (err) {
      console.error("Mercado Pago error:", err);
      res.status(500).json({ error: "Erro ao processar pagamento" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist/client");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
