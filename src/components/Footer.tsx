import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo className="h-6 mb-4" />
            <p className="text-sm">
              A maior plataforma de pranchas e equipamentos de surf usados de todo o Brasil.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-red-500 transition-colors">Início</Link></li>
              <li><Link to="/post-ad" className="hover:text-red-500 transition-colors">Anunciar</Link></li>
              <li><Link to="/#como-funciona" className="hover:text-red-500 transition-colors">Como Funciona</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contato@ondausada.com.br" className="hover:text-red-500 transition-colors">
                  contato@ondausada.com.br
                </a>
              </li>
              <li>Todo o Brasil</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-900 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} OndaUsada. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
