import React from 'react';

interface HeaderProps {
  title: string;
  onBack: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, className = '' }) => {
  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] bg-[#001F3F] border-b-2 border-[#FFD580] shadow-2xl flex items-center px-4 py-3 sm:py-4 h-20 ${className}`}>
      <button 
        onClick={onBack}
        className="bg-[#FFD580] text-[#001F3F] text-xl sm:text-2xl font-bold px-6 py-2 sm:py-3 rounded-xl mr-4 active:scale-95 hover:brightness-110 shadow-lg border-2 border-[#001F3F]/20 transition-all whitespace-nowrap flex-shrink-0"
        aria-label="Volver a la pantalla anterior"
      >
        ← VOLVER
      </button>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#FFD580] truncate flex-1 leading-tight">
        {title}
      </h2>
    </div>
  );
};
