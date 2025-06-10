import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '~/lib/firebase';
import type { User } from '~/types';

interface UseUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export const useUsers = () => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: true,
    error: null,
  });

  // Listen to all users in real-time
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('displayName', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });

        setState({
          users,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar usuários',
        }));
        console.error('Error fetching users:', error);
      }
    );

    return unsubscribe;
  }, []);

  // Search users by name or email
  const searchUsers = useCallback(async (searchTerm: string): Promise<User[]> => {
    if (!searchTerm.trim()) return [];

    try {
      const usersRef = collection(db, 'users');
      
      // Search by display name (case insensitive)
      const nameQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );

      // Search by email
      const emailQuery = query(
        usersRef,
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        limit(10)
      );

      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery)
      ]);

      const users: User[] = [];
      const userIds = new Set<string>();

      // Add users from name search
      nameSnapshot.forEach((doc) => {
        if (!userIds.has(doc.id)) {
          const data = doc.data();
          users.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
          userIds.add(doc.id);
        }
      });

      // Add users from email search
      emailSnapshot.forEach((doc) => {
        if (!userIds.has(doc.id)) {
          const data = doc.data();
          users.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
          userIds.add(doc.id);
        }
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  const getUserById = useCallback((userId: string): User | undefined => {
    return state.users.find(user => user.uid === userId);
  }, [state.users]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    searchUsers,
    getUserById,
    clearError,
  };
};
