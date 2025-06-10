import React from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '~/hooks/useChat';

export const ChatRoom: React.FC = () => {
  const { messages, loading, error } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <ChatHeader />
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <MessageList messages={messages} loading={loading} />
      <MessageInput />
    </div>
  );
};
