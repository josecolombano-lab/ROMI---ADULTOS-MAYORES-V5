import React from 'react';
import { Header } from './Header';
import { ExternalLink } from './types';
import { AlertTriangle } from 'lucide-react';

interface ExternalViewProps {
  title: string;
  links: ExternalLink[];
  onBack: () => void;
}

export const ExternalView: React.FC<ExternalViewProps> = ({ title, links, onBack }) => {
  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6">
      <Header title={title} onBack={onBack} />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl border-4 border-red-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
          <AlertTriangle className="w-16 h-16 flex-shrink-0 text-yellow-300 animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold mb-2 uppercase text-center sm:text-left text-yellow-300">¡Atención!</h2>
            <p className="text-lg sm:text-xl font-medium leading-relaxed text-center sm:text-left">
              Está por ingresar en una página externa a "ROMI - ADULTOS MAYORES". 
              <strong className="text-yellow-300"> NO clickee en ninguna publicidad</strong> a menos que conozca su funcionamiento. 
              Ante la duda, vuelva hacia atrás o salga e ingrese nuevamente a la aplicación.
            </p>
          </div>
        </div>
        {links.map((link, index) => (
          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="block bg-[#FFD580] text-[#001F3F] p-6 rounded-2xl shadow-xl transform active:scale-[0.98] transition-all hover:brightness-110">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 uppercase">{link.title}</h3>
            {link.description && <p className="text-lg sm:text-xl opacity-90 leading-relaxed">{link.description}</p>}
            <div className="mt-4 text-sm font-bold opacity-60">TOCAR PARA ABRIR →</div>
          </a>
        ))}
      </div>
    </div>
  );
};
