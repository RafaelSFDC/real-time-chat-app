import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { useChat } from '~/hooks/useChat';
import { useTypingIndicator } from '~/hooks/useTypingIndicator';
import { cn } from '~/lib/utils';

const MAX_MESSAGE_LENGTH = 500;

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendMessage, setTyping } = useChat();
  const typingUsers = useTypingIndicator();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(message);
      setMessage('');
      await setTyping(false);

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
    }

    // Handle typing indicator
    if (value.trim()) {
      setTyping(true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isNearLimit = remainingChars <= 50;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {typingUsers.length === 1 ? (
            <span>{typingUsers[0].userName} está digitando...</span>
          ) : (
            <span>
              {typingUsers.slice(0, 2).map(user => user.userName).join(', ')}
              {typingUsers.length > 2 && ` e mais ${typingUsers.length - 2}`} estão digitando...
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[44px] max-h-32 resize-none"
            disabled={isSending}
            rows={1}
          />

          {/* Character counter */}
          <div className={cn(
            'text-xs mt-1 text-right',
            isNearLimit ? 'text-red-500' : 'text-gray-400'
          )}>
            {message.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || isSending || message.length > MAX_MESSAGE_LENGTH}
          className="h-11 px-3"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
