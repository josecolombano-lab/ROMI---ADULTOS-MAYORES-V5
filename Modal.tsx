import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'alert' | 'prompt';
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  type = 'alert',
  inputValue = '',
  onInputChange,
  onSubmit,
  submitText = 'ACEPTAR',
  cancelText = 'CANCELAR',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#001F3F] border-4 border-[#FFD580] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#FFD580] mb-4 text-center">{title}</h2>
        <p className="text-xl text-[#FFFDD0] mb-6 text-center">{message}</p>
        
        {type === 'prompt' && onInputChange && (
          <input
            type="email"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] focus:outline-none focus:ring-2 focus:ring-[#FFD580] mb-6"
            placeholder="ejemplo@correo.com"
            autoFocus
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {type === 'prompt' && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-600 text-white text-xl font-bold py-3 px-6 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={type === 'prompt' ? onSubmit : onClose}
            className="w-full sm:w-auto bg-[#FFD580] text-[#001F3F] text-xl font-bold py-3 px-6 rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};
