import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Modal } from './Modal';
import { Note } from './types';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { OperationType, handleFirestoreError } from './firebaseError';
import { X, Pencil } from 'lucide-react';

interface NotesViewProps {
  onBack: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onBack }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
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

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    try {
      const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
      
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const fetchedNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Note[];
        setNotes(fetchedNotes);
        setLoading(false);
      }, (err) => {
        setLoading(false);
        setError(err.message || "Error al cargar notas.");
        try {
          handleFirestoreError(err, OperationType.LIST, 'notes');
        } catch (e) {
          console.error(e);
        }
      });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Error al inicializar notas.");
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsEditor(user.email === 'josecolombano@gmail.com');
      } else {
        setIsEditor(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const handleAdd = async () => {
    if (!text.trim()) return;
    if (!auth.currentUser) {
      setModalState({ isOpen: true, title: 'ERROR', message: 'Debe iniciar sesión para publicar notas.' });
      return;
    }
    try {
      await addDoc(collection(db, 'notes'), {
        content: text,
        authorEmail: auth.currentUser.email || 'Anónimo',
        authorUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleString()
      });
      setText('');
    } catch (err) {
      console.error("Error al publicar nota:", err);
      setModalState({ isOpen: true, title: 'ERROR', message: 'No se pudo publicar la nota. Intente de nuevo.' });
      handleFirestoreError(err, OperationType.WRITE, 'notes');
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (err) {
      console.error("Error al eliminar nota:", err);
      handleFirestoreError(err, OperationType.DELETE, `notes/${noteId}`);
    }
  };

  const startEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    try {
      await updateDoc(doc(db, 'notes', noteId), { content: editContent });
      setEditingNoteId(null);
      setEditContent('');
    } catch (err) {
      console.error("Error al actualizar nota:", err);
      handleFirestoreError(err, OperationType.UPDATE, `notes/${noteId}`);
    }
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6">
      <Header title="NOTAS DEL EDITOR Y MAS" onBack={onBack} />
      <div className="max-w-2xl mx-auto space-y-6">
        {isEditor && (
          <div className="bg-[#FFD580]/10 p-6 rounded-3xl border-2 border-[#FFD580]/30">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
              className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-4 rounded-xl text-xl text-[#FFFDD0] h-64"
              placeholder="Escriba una nueva nota del editor..."
            />
            <div className="text-right text-[#FFD580]/60 text-sm mt-1">{text.length} / 5000 caracteres</div>
            <button onClick={handleAdd} className="w-full mt-4 bg-[#FFD580] text-[#001F3F] text-2xl font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
              PUBLICAR NOTA
            </button>
          </div>
        )}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-[#FFD580]">Cargando notas...</p>
          ) : error ? (
            <div className="bg-red-500/20 border-2 border-red-500 p-6 rounded-3xl text-center">
              <p className="text-red-400 font-bold mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-[#FFD580] text-[#001F3F] font-bold py-2 px-4 rounded-xl">Reintentar</button>
            </div>
          ) : notes.length === 0 ? (
            <p className="text-center text-[#FFD580]/60">No hay notas publicadas aún.</p>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-[#FFD580] text-[#001F3F] p-6 rounded-2xl shadow-lg relative">
                {isEditor && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => startEdit(note)} className="p-2 hover:bg-[#001F3F]/10 rounded-full transition-colors" aria-label="Editar"><Pencil size={20} /></button>
                    <button onClick={() => handleDelete(note.id)} className="p-2 hover:bg-red-500/20 text-red-600 rounded-full transition-colors" aria-label="Eliminar"><X size={24} /></button>
                  </div>
                )}
                {editingNoteId === note.id ? (
                  <div className="mt-2">
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} maxLength={5000} className="w-full bg-[#001F3F] border-2 border-[#FFD580] p-3 rounded-xl text-xl text-[#FFFDD0] h-64 mb-1" />
                    <div className="text-right text-[#001F3F]/60 text-sm mb-4">{editContent.length} / 5000 caracteres</div>
                    <div className="flex gap-4">
                      <button onClick={() => saveEdit(note.id)} className="flex-1 bg-[#001F3F] text-[#FFD580] px-4 py-3 rounded-xl font-bold text-lg">GUARDAR</button>
                      <button onClick={cancelEdit} className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-bold text-lg">CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl mb-2 pr-16 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex justify-between items-center text-sm font-bold opacity-60 mt-4">
                      <span>{note.date}</span>
                      {note.authorEmail && <span>Por: {note.authorEmail.split('@')[0]}</span>}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Modal isOpen={modalState.isOpen} title={modalState.title} message={modalState.message} onClose={closeModal} />
    </div>
  );
};

