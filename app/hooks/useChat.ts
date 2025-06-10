import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '~/lib/firebase';
import { useAuth } from '~/contexts/AuthContext';
import type { Message, ChatState, TypingIndicator } from '~/types';

export const useChat = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    loading: true,
    error: null,
    isTyping: false,
  });

  // Listen to messages in real-time
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            text: data.text,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            timestamp: data.timestamp?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });

        setState(prev => ({
          ...prev,
          messages,
          loading: false,
          error: null,
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar mensagens',
        }));
        console.error('Error fetching messages:', error);
      }
    );

    return unsubscribe;
  }, [user]);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!user || !text.trim()) return;

    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        text: text.trim(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao enviar mensagem',
      }));
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user]);

  const setTyping = useCallback(async (isTyping: boolean): Promise<void> => {
    if (!user) return;

    try {
      const typingRef = doc(db, 'typing', user.uid);

      if (isTyping) {
        await setDoc(typingRef, {
          userId: user.uid,
          userName: user.displayName || user.email,
          timestamp: serverTimestamp(),
        });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [user]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sendMessage,
    setTyping,
    clearError,
  };
};
