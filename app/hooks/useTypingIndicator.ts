import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '~/lib/firebase';
import { useAuth } from '~/contexts/AuthContext';
import type { TypingIndicator } from '~/types';

export const useTypingIndicator = () => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    if (!user) return;

    const typingRef = collection(db, 'typing');
    const q = query(typingRef, where('userId', '!=', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typing: TypingIndicator[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        typing.push({
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      });

      // Filter out old typing indicators (older than 3 seconds)
      const now = new Date();
      const filtered = typing.filter(
        (indicator) => now.getTime() - indicator.timestamp.getTime() < 3000
      );

      setTypingUsers(filtered);
    });

    return unsubscribe;
  }, [user]);

  return typingUsers;
};
