import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
} from 'firebase/firestore';
import { db } from '~/lib/firebase';
import { useAuth } from '~/contexts/AuthContext';
import type { Room } from '~/types';

interface UseRoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  currentRoom: Room | null;
}

export const useRooms = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UseRoomsState>({
    rooms: [],
    loading: true,
    error: null,
    currentRoom: null,
  });

  // Listen to rooms where user is a member
  useEffect(() => {
    if (!user) return;

    const roomsRef = collection(db, 'rooms');
    const q = query(
      roomsRef,
      where('members', 'array-contains', user.uid),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rooms: Room[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          rooms.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate() || new Date(),
            members: data.members || [],
            isPrivate: data.isPrivate || false,
          });
        });

        setState(prev => ({
          ...prev,
          rooms,
          loading: false,
          error: null,
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar salas',
        }));
        console.error('Error fetching rooms:', error);
      }
    );

    return unsubscribe;
  }, [user]);

  // Create a new room
  const createRoom = useCallback(async (
    name: string,
    description?: string,
    isPrivate: boolean = false
  ): Promise<string> => {
    if (!user || !name.trim()) {
      throw new Error('Usuário não autenticado ou nome inválido');
    }

    try {
      const roomsRef = collection(db, 'rooms');
      const docRef = await addDoc(roomsRef, {
        name: name.trim(),
        description: description?.trim() || '',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        members: [user.uid],
        isPrivate,
      });

      return docRef.id;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao criar sala',
      }));
      console.error('Error creating room:', error);
      throw error;
    }
  }, [user]);

  // Join a room
  const joinRoom = useCallback(async (roomId: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao entrar na sala',
      }));
      console.error('Error joining room:', error);
      throw error;
    }
  }, [user]);

  // Leave a room
  const leaveRoom = useCallback(async (roomId: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        members: arrayRemove(user.uid),
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao sair da sala',
      }));
      console.error('Error leaving room:', error);
      throw error;
    }
  }, [user]);

  // Search public rooms
  const searchRooms = useCallback(async (searchTerm: string): Promise<Room[]> => {
    if (!searchTerm.trim()) return [];

    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(
        roomsRef,
        where('isPrivate', '==', false),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(q);
      const rooms: Room[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        rooms.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          members: data.members || [],
          isPrivate: data.isPrivate || false,
        });
      });

      return rooms;
    } catch (error) {
      console.error('Error searching rooms:', error);
      return [];
    }
  }, []);

  // Set current room
  const setCurrentRoom = useCallback((room: Room | null): void => {
    setState(prev => ({
      ...prev,
      currentRoom: room,
    }));
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createRoom,
    joinRoom,
    leaveRoom,
    searchRooms,
    setCurrentRoom,
    clearError,
  };
};
