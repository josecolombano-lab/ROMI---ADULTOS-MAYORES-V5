import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#001F3F] flex flex-col items-center justify-center">
      {/* Imagen de fondo */}
      <img 
        src="https://i.postimg.cc/jd6KgW4W/Hombre-mayor-corrien.jpg" 
        alt="Adulto mayor corriendo" 
        className="absolute inset-0 w-full h-full object-cover opacity-80" 
        referrerPolicy="no-referrer"
      />
      
      {/* Texto de respaldo por si la imagen no carga */}
      <div className="relative z-10 text-center p-6">
        <h1 className="text-4xl font-bold text-[#FFFDD0] mb-2 drop-shadow-lg">ROMI</h1>
        <p className="text-xl text-[#FFD580] drop-shadow-md">Adultos Mayores</p>
      </div>

      {/* Etiqueta SOLO + 60 en la esquina inferior derecha */}
      <div className="absolute bottom-8 right-6 bg-black px-4 py-2 border-2 border-red-600 shadow-lg z-20">
        <span className="text-red-600 font-bold text-2xl tracking-widest">
          SOLO + 60
        </span>
      </div>
    </div>
  );
};