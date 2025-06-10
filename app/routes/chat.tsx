import React from 'react';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';
import { ChatRoom } from '~/components/chat/ChatRoom';
import type { Route } from './+types/chat';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat - Chat App" },
    { name: "description", content: "Chat em tempo real" },
  ];
}

export default function Chat() {
  return (
    <ProtectedRoute>
      <ChatRoom />
    </ProtectedRoute>
  );
}
