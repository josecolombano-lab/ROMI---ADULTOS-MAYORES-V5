import React from 'react';

interface SectionButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export const SectionButton: React.FC<SectionButtonProps> = ({ label, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-[#FFD580] text-[#001F3F] text-2xl sm:text-3xl font-bold py-4 px-6 rounded-xl shadow-lg transform active:scale-95 transition-transform duration-150 uppercase tracking-wide hover:brightness-110 ${className}`}
    >
      {label}
    </button>
  );
};
