import React, { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatSidebar } from './ChatSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '~/components/ui/sidebar';
import { useChat } from '~/hooks/useChat';
import { useRooms } from '~/hooks/useRooms';
import type { Room, User } from '~/types';

export const ChatRoom: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const { messages, loading, error } = useChat(currentRoom);
  const { setCurrentRoom: setRoomInHook } = useRooms();

  const handleRoomSelect = (room: Room | null) => {
    setCurrentRoom(room);
    setRoomInHook(room);
  };

  const handleUserSelect = (user: User) => {
    // TODO: Implementar chat direto com usuário (criar sala privada)
    console.log('Selected user:', user);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChatSidebar
          currentRoom={currentRoom}
          onRoomSelect={handleRoomSelect}
          onUserSelect={handleUserSelect}
        />

        <SidebarInset className="flex flex-col flex-1">
          <ChatHeader currentRoom={currentRoom} />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <MessageList messages={messages} loading={loading} currentRoom={currentRoom} />
          <MessageInput currentRoom={currentRoom} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
