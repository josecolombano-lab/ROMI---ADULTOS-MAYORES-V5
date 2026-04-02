import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { SectionButton } from './SectionButton';
import { Modal } from './Modal';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';

interface MainMenuProps {
  onNavigate: (view: ViewState) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'prompt';
    inputValue: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    inputValue: '',
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const handleModalSubmit = async () => {
    if (modalState.title === 'RECUPERAR CONTRASEÑA') {
      const emailToReset = modalState.inputValue;
      if (emailToReset) {
        try {
          await sendPasswordResetEmail(auth, emailToReset);
          setModalState({
            isOpen: true,
            title: 'CORREO ENVIADO',
            message: 'Se ha enviado un correo para restablecer su contraseña. Por favor revise su bandeja de entrada.',
            type: 'alert',
            inputValue: '',
          });
        } catch (error: any) {
          console.error(error);
          let errorMessage = 'Verifique que el correo esté bien escrito o que la cuenta exista.';
          if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Error de red: Verifique su conexión a internet.';
          }
          setModalState({
            isOpen: true,
            title: 'ERROR',
            message: errorMessage,
            type: 'alert',
            inputValue: '',
          });
        }
      }
    } else {
      closeModal();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed, user:", user);
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
        localStorage.setItem('romi_is_logged_in', 'true');
        localStorage.setItem('romi_user_email', user.email || '');
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
        localStorage.removeItem('romi_is_logged_in');
        localStorage.removeItem('romi_user_email');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProtectedNavigation = (view: ViewState) => {
    if (isLoggedIn) {
      onNavigate(view);
    } else {
      onNavigate(ViewState.LOGIN);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setModalState({
        isOpen: true,
        title: 'SESIÓN CERRADA',
        message: 'Ha CERRADO SESIÓN correctamente.',
        type: 'alert',
        inputValue: '',
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleForgotPassword = () => {
    setModalState({
      isOpen: true,
      title: 'RECUPERAR CONTRASEÑA',
      message: 'Por favor, ingrese su correo electrónico para recuperar su contraseña:',
      type: 'prompt',
      inputValue: '',
    });
  };

  const handleContact = () => {
    setModalState({
      isOpen: true,
      title: 'CONTÁCTENOS',
      message: 'Contactese a romina.mayores.sesenta@gmail.com',
      type: 'alert',
      inputValue: '',
    });
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto p-4 sm:p-6">
      <header className="text-center mt-6 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#FFFDD0] mb-4 leading-tight">
          ROMI - ADULTOS MAYORES
        </h1>
        {isLoggedIn && (
          <div className="bg-[#FFD580]/10 p-2 rounded-lg border border-[#FFD580]/30">
            <p className="text-[#FFD580] text-sm">Sesión: {userEmail}</p>
            <button onClick={handleLogout} className="text-red-400 text-xs underline mt-1">Cerrar Sesión</button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <SectionButton label="NOTICIAS Y CLIMA" onClick={() => onNavigate(ViewState.NEWS)} />
        <SectionButton label="SALUD" onClick={() => onNavigate(ViewState.HEALTH)} />
        <SectionButton label="JUEGOS" onClick={() => onNavigate(ViewState.GAMES)} />
        <SectionButton label="AGENDA" onClick={() => handleProtectedNavigation(ViewState.AGENDA)} />
        <SectionButton label="NOTAS DEL EDITOR Y MAS" onClick={() => onNavigate(ViewState.NOTES)} />
        <SectionButton label="PREMIUM" onClick={() => onNavigate(ViewState.PREMIUM)} />
      </div>

      <footer className="mt-auto pt-10 pb-6 text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[#FFD580]/80">
          <button onClick={() => onNavigate(ViewState.LOGIN)} className="underline font-bold">INGRESAR</button>
          <button onClick={() => onNavigate(ViewState.REGISTER)} className="underline font-bold">REGISTRARSE</button>
          <button onClick={handleForgotPassword} className="underline font-bold">¿OLVIDÓ SU CONTRASEÑA?</button>
          <button onClick={handleContact} className="underline font-bold">CONTÁCTENOS</button>
        </div>
        <p className="text-[#FFD580]/60 text-base font-bold italic">"Acompañando tu día con tecnología simple"</p>
      </footer>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        inputValue={modalState.inputValue}
        onInputChange={(val) => setModalState(prev => ({ ...prev, inputValue: val }))}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        submitText={modalState.type === 'prompt' ? 'ENVIAR' : 'ACEPTAR'}
      />
    </div>
  );
};
