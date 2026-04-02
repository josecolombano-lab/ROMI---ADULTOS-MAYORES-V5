import React, { useState } from 'react';
import { Header } from './Header';
import { Modal } from './Modal';
import { auth } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface LoginViewProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  onRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBack, onLoginSuccess, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
          setModalState({ isOpen: true, title: 'CORREO ENVIADO', message: 'Se ha enviado un correo para restablecer su contraseña. Por favor revise su bandeja de entrada.', type: 'alert', inputValue: '' });
        } catch (error: any) {
          console.error(error);
          setModalState({ isOpen: true, title: 'ERROR', message: 'Verifique que el correo esté bien escrito o que la cuenta exista.', type: 'alert', inputValue: '' });
        }
      }
    } else {
      closeModal();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor complete todos los campos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('romi_is_logged_in', 'true');
      localStorage.setItem('romi_user_email', email);
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Correo o contraseña incorrectos.");
      } else if (err.code === 'auth/invalid-email') {
        setError("El correo electrónico no es válido.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Error de red: Verifique su conexión a internet o intente más tarde. Si el problema persiste, contacte al administrador.");
      } else {
        setError("Error al iniciar sesión: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setModalState({ isOpen: true, title: 'RECUPERAR CONTRASEÑA', message: 'Por favor, ingrese su correo electrónico para recuperar su contraseña:', type: 'prompt', inputValue: email || '' });
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6">
      <Header title="INICIAR SESIÓN" onBack={onBack} />
      <div className="max-w-md mx-auto bg-[#FFD580]/10 p-8 rounded-3xl border-2 border-[#FFD580]/30 shadow-2xl">
        <p className="text-center text-xl mb-8 opacity-80">Ingrese sus datos para acceder a las funciones protegidas.</p>
        <div className="space-y-6">
          <div>
            <label className="block text-[#FFD580] text-lg font-bold mb-2">CORREO ELECTRÓNICO</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] focus:outline-none focu
