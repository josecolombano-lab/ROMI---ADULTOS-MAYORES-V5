import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Modal } from './Modal';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot, 
  collection,
  query,
  where
} from 'firebase/firestore';
import { OperationType, handleFirestoreError } from './firebaseError';

interface AgendaViewProps {
  onBack: () => void;
}

interface AgendaEvent {
  note: string;
  hour?: number;
  minute?: number;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onBack }) => {
  const [events, setEvents] = useState<{[key: string]: AgendaEvent}>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [note, setNote] = useState('');
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));
  const goToPreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthName = currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          const userEventsRef = collection(db, 'users', user.uid, 'agenda');
          unsubscribeSnapshot = onSnapshot(userEventsRef, (snapshot) => {
            const fetchedEvents: {[key: string]: AgendaEvent} = {};
            snapshot.docs.forEach(doc => {
              const data = doc.data();
              fetchedEvents[doc.id] = {
                note: data.note || '',
                hour: data.hour !== undefined ? data.hour : undefined,
                minute: data.minute !== undefined ? data.minute : undefined
              };
            });
            setEvents(fetchedEvents);
            setLoading(false);
          }, (err) => {
            setLoading(false);
            setError(err.message || "Error al cargar la agenda.");
            try { handleFirestoreError(err, OperationType.LIST, 'users/' + user.uid + '/agenda'); } catch (e) { console.error(e); }
          });
        } catch (err: any) {
          setLoading(false);
          setError(err.message || "Error al inicializar la agenda.");
        }
      } else {
        setEvents({});
        setLoading(false);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    const currentEvent = events[selectedDate];
    setNote(currentEvent?.note || '');
    setHour(currentEvent?.hour !== undefined ? currentEvent.hour : 12);
    setMinute(currentEvent?.minute !== undefined ? currentEvent.minute : 0);
  }, [selectedDate, events]);

  const handleSave = async () => {
    if (!auth.currentUser) {
      setModalState({ isOpen: true, title: 'ERROR', message: 'No hay usuario autenticado.' });
      return;
    }
    try {
      const eventRef = doc(db, 'users', auth.currentUser.uid, 'agenda', selectedDate);
      await setDoc(eventRef, { note, hour, minute, updatedAt: new Date().toISOString() });
      setModalState({ isOpen: true, title: '¡ÉXITO!', message: 'Evento guardado correctamente.' });
    } catch (error) {
      setModalState({ isOpen: true, title: 'ERROR', message: 'Error al guardar el evento. Revise los permisos.' });
      try { handleFirestoreError(error, OperationType.WRITE, 'users/' + auth.currentUser.uid + '/agenda/' + selectedDate); } catch (e) { console.error(e); }
    }
  };

  const handleDelete = async (dateToDelete: string = selectedDate) => {
    if (!auth.currentUser) return;
    try {
      const eventRef = doc(db, 'users', auth.currentUser.uid, 'agenda', dateToDelete);
      await deleteDoc(eventRef);
      if (dateToDelete === selectedDate) setNote('');
      setModalState({ isOpen: true, title: '¡ÉXITO!', message: 'Recordatorio eliminado correctamente.' });
    } catch (error) {
      setModalState({ isOpen: true, title: 'ERROR', message: 'Error al eliminar el recordatorio.' });
      try { handleFirestoreError(error, OperationType.DELETE, 'users/' + auth.currentUser.uid + '/agenda/' + dateToDelete); } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6">
      <Header title="AGENDA" onBack={onBack} />
      <div className="max-w-md mx-auto space-y-6">
        {loading ? (
          <p className="text-center text-[#FFD580]">Cargando agenda...</p>
        ) : error ? (
          <div className="bg-red-500/20 border-2 border-red-500 p-6 rounded-3xl text-center">
            <p className="text-red-400 font-bold mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-[#FFD580] text-[#001F3F] font-bold py-2 px-4 rounded-xl">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="bg-[#FFD580]/10 p-6 rounded-3xl border-2 border-[#FFD580]/30">
              <div className="flex justify-between items-center mb-4">
                <button onClick={goToPreviousMonth} className="text-3xl text-[#FFD580]">◀</button>
                <h2 className="text-xl font-bold text-[#FFD580]">{monthName}</h2>
                <button onClick={goToNextMonth} className="text-3xl text-[#FFD580]">▶</button>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                  <div key={`dow-${index}`} className="text-center font-bold text-[#FFD580]">{day}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {days.map(day => {
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const hasEvent = !!events[dateStr];
                  return (
                    <button key={day} onClick={() => setSelectedDate(dateStr)} className={`p-2 rounded-lg text-center font-bold ${isSelected ? 'bg-[#FFD580] text-[#001F3F]' : 'bg-[#001F3F] text-[#FFD580]'} ${hasEvent ? 'border-2 border-red-500' : ''}`}>
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[#FFD580] font-bold">Fecha seleccionada: {selectedDate}</p>
            </div>

            <div className="bg-[#FFD580]/10 p-6 rounded-3xl border-2 border-[#FFD580]/30">
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <label className="block text-[#FFD580] text-lg font-bold mb-2">RECORDATORIO</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] h-32" placeholder="Escriba aquí lo que debe recordar..." />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[#FFD580] text-lg font-bold mb-2">HORA</label>
                    <select value={hour} onChange={(e) => setHour(parseInt(e.target.value))} className="w-full bg-[#001F3F] border-2 border-[
