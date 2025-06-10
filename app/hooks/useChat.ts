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
import type { Message, ChatState, TypingIndicator, Room } from '~/types';

export const useChat = (currentRoom?: Room | null) => {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    loading: true,
    error: null,
    isTyping: false,
    currentRoom: currentRoom || undefined,
  });

  // Listen to messages in real-time
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'messages');
    let q;

    if (currentRoom) {
      // Filter messages by room
      q = query(
        messagesRef,
        where('roomId', '==', currentRoom.id),
        orderBy('createdAt', 'asc')
      );
    } else {
      // Global chat (messages without roomId or with roomId as null)
      q = query(
        messagesRef,
        orderBy('createdAt', 'asc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const message = {
            id: doc.id,
            text: data.text,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            timestamp: data.timestamp?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            roomId: data.roomId || null,
            mentions: data.mentions || [],
          };

          // Filter messages based on current room
          if (currentRoom) {
            // Only show messages for this room
            if (message.roomId === currentRoom.id) {
              messages.push(message);
            }
          } else {
            // Global chat: show messages without roomId
            if (!message.roomId) {
              messages.push(message);
            }
          }
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
  }, [user, currentRoom]);

  const sendMessage = useCallback(async (text: string, mentions: string[] = []): Promise<void> => {
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
        roomId: currentRoom?.id || null,
        mentions: mentions.length > 0 ? mentions : [],
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao enviar mensagem',
      }));
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user, currentRoom]);

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
