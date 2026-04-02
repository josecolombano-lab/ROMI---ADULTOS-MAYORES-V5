import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface RegisterViewProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onBack, onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onClose: () => {},
  });

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Por favor complete todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem('romi_is_logged_in', 'true');
      localStorage.setItem('romi_user_email', email);
      setModalState({
        isOpen: true,
        title: '¡ÉXITO!',
        message: 'Cuenta creada con éxito.',
        onClose: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          onRegisterSuccess();
        }
      });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Esta cuenta ya existe. Por favor, vuelva atrás y use el botón 'INGRESAR'.");
      } else if (err.code === 'auth/invalid-email') {
        setError("El correo electrónico no es válido.");
      } else if (err.code === 'auth/weak-password') {
        setError("La contraseña es demasiado débil.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Error de red: Verifique su conexión a internet o intente más tarde.");
      } else {
        setError("Error al crear la cuenta: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6">
      <Header title="REGISTRARSE" onBack={onBack} />
      
      <div className="max-w-md mx-auto bg-[#FFD580]/10 p-8 rounded-3xl border-2 border-[#FFD580]/30 shadow-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-[#FFD580] text-lg font-bold mb-2">CORREO ELECTRÓNICO</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] focus:outline-none focus:ring-2 focus:ring-[#FFD580]"
              placeholder="ejemplo@correo.com"
            />
          </div>
          
          <div>
            <label className="block text-[#FFD580] text-lg font-bold mb-2">CONTRASEÑA</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] focus:outline-none focus:ring-2 focus:ring-[#FFD580]"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-[#FFD580] text-lg font-bold mb-2">REPETIR CONTRASEÑA</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] focus:outline-none focus:ring-2 focus:ring-[#FFD580]"
              placeholder="Repita su contraseña"
            />
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl text-red-200 text-center font-bold">{error}</div>}

          <button 
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#FFD580] text-[#001F3F] text-2xl font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>

          <div className="text-center pt-4 space-y-2">
            <p className="mb-2">¿Ya tiene una cuenta?</p>
            <button onClick={onBack} className="block w-full text-[#FFD580] font-bold underline text-xl">INGRESAR AQUÍ</button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onClose={modalState.onClose}
      />
    </div>
  );
};
