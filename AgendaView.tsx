import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { db, auth } from '../firebase';
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
import { OperationType, handleFirestoreError } from '../utils/firebaseError';

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
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

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
            try {
              handleFirestoreError(err, OperationType.LIST, 'users/' + user.uid + '/agenda');
            } catch (e) {
              console.error(e);
            }
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
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Update note and time when date changes
  useEffect(() => {
    const currentEvent = events[selectedDate];
    setNote(currentEvent?.note || '');
    setHour(currentEvent?.hour !== undefined ? currentEvent.hour : 12);
    setMinute(currentEvent?.minute !== undefined ? currentEvent.minute : 0);
  }, [selectedDate, events]);

  const handleSave = async () => {
    if (!auth.currentUser) {
      setModalState({
        isOpen: true,
        title: 'ERROR',
        message: 'No hay usuario autenticado.',
      });
      return;
    }

    try {
      console.log('ROMI: Intentando guardar evento en:', selectedDate);
      const eventRef = doc(db, 'users', auth.currentUser.uid, 'agenda', selectedDate);
      await setDoc(eventRef, {
        note: note,
        hour: hour,
        minute: minute,
        updatedAt: new Date().toISOString()
      });
      console.log('ROMI: Evento guardado exitosamente');
      setModalState({
        isOpen: true,
        title: '¡ÉXITO!',
        message: 'Evento guardado correctamente.',
      });
    } catch (error) {
      console.error('ROMI: Error al guardar evento:', error);
      setModalState({
        isOpen: true,
        title: 'ERROR',
        message: 'Error al guardar el evento. Revise los permisos.',
      });
      // No lanzamos el error aquí para que el Modal pueda mostrarse sin que el ErrorBoundary tome el control
      try {
        handleFirestoreError(error, OperationType.WRITE, 'users/' + auth.currentUser.uid + '/agenda/' + selectedDate);
      } catch (e) {
        console.error('ROMI: Error reportado:', e);
      }
    }
  };

  const handleDelete = async (dateToDelete: string = selectedDate) => {
    if (!auth.currentUser) return;

    try {
      console.log('ROMI: Intentando borrar evento en:', dateToDelete);
      const eventRef = doc(db, 'users', auth.currentUser.uid, 'agenda', dateToDelete);
      await deleteDoc(eventRef);
      console.log('ROMI: Evento borrado exitosamente');
      
      if (dateToDelete === selectedDate) {
        setNote('');
      }

      setModalState({
        isOpen: true,
        title: '¡ÉXITO!',
        message: 'Recordatorio eliminado correctamente.',
      });
    } catch (error) {
      console.error('ROMI: Error al borrar evento:', error);
      setModalState({
        isOpen: true,
        title: 'ERROR',
        message: 'Error al eliminar el recordatorio.',
      });
      try {
        handleFirestoreError(error, OperationType.DELETE, 'users/' + auth.currentUser.uid + '/agenda/' + dateToDelete);
      } catch (e) {
        console.error('ROMI: Error reportado:', e);
      }
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
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#FFD580] text-[#001F3F] font-bold py-2 px-4 rounded-xl"
            >
              Reintentar
            </button>
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
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 rounded-lg text-center font-bold ${isSelected ? 'bg-[#FFD580] text-[#001F3F]' : 'bg-[#001F3F] text-[#FFD580]'} ${hasEvent ? 'border-2 border-red-500' : ''}`}
                    >
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
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] h-32"
                    placeholder="Escriba aquí lo que debe recordar..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[#FFD580] text-lg font-bold mb-2">HORA</label>
                    <select 
                      value={hour}
                      onChange={(e) => setHour(parseInt(e.target.value))}
                      className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0]"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[#FFD580] text-lg font-bold mb-2">MINUTOS</label>
                    <select 
                      value={minute}
                      onChange={(e) => setMinute(parseInt(e.target.value))}
                      className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0]"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[#FFD580] text-[#001F3F] text-2xl font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                  GUARDAR
                </button>
                {events[selectedDate] && (
                  <button 
                    onClick={() => handleDelete(selectedDate)}
                    className="bg-red-600 text-white text-xl font-bold py-4 px-6 rounded-xl shadow-lg active:scale-95 transition-transform"
                  >
                    BORRAR
                  </button>
                )}
              </div>
            </div>
            
            {events[selectedDate] && (
              <div className="bg-[#FFD580] text-[#001F3F] p-4 rounded-xl font-bold text-center animate-pulse">
                ¡TIENE UN RECORDATORIO PARA HOY A LAS {String(events[selectedDate].hour).padStart(2, '0')}:{String(events[selectedDate].minute).padStart(2, '0')}!
              </div>
            )}

            <div className="bg-[#FFD580]/10 p-6 rounded-3xl border-2 border-[#FFD580]/30 mt-6">
              <h3 className="text-[#FFD580] text-xl font-bold mb-4">TODOS LOS RECORDATORIOS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[#FFFDD0]">
                  <thead>
                    <tr className="border-b border-[#FFD580]/30">
                      <th className="text-left p-2">Fecha</th>
                      <th className="text-left p-2">Hora</th>
                      <th className="text-left p-2">Recordatorio</th>
                      <th className="text-center p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(events).sort().map(([date, event]) => (
                      <tr key={date} className="border-b border-[#FFD580]/10">
                        <td className="p-2 font-bold">{date}</td>
                        <td className="p-2 font-bold">
                          {event.hour !== undefined ? `${String(event.hour).padStart(2, '0')}:${String(event.minute).padStart(2, '0')}` : '-'}
                        </td>
                        <td className="p-2">{event.note}</td>
                        <td className="p-2 text-center">
                          <button 
                            onClick={() => handleDelete(date)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg transition-colors"
                            title="Eliminar recordatorio"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onClose={closeModal}
      />
    </div>
  );
};
