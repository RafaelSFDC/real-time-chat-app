import type { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: Date;
  createdAt: Date;
}

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: Date;
}
