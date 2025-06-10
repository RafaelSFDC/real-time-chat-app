import type { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface MessageReaction {
  emoji: string;
  users: string[]; // Array de userIds que reagiram
  count: number;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt?: Date;
  roomId?: string;
  mentions?: string[]; // Array de userIds mencionados
  reactions?: { [emoji: string]: MessageReaction };
  isEdited?: boolean;
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

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: string[]; // Array de userIds
  isPrivate: boolean;
  password?: string; // Senha para salas privadas
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  currentRoom?: Room;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: Date;
}
