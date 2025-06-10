import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Smile, AtSign } from 'lucide-react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useChat } from '~/hooks/useChat';
import { useTypingIndicator } from '~/hooks/useTypingIndicator';
import { useUsers } from '~/hooks/useUsers';
import { cn } from '~/lib/utils';
import type { User, Room } from '~/types';

const MAX_MESSAGE_LENGTH = 500;

interface MessageInputProps {
  currentRoom?: Room | null;
}

export const MessageInput: React.FC<MessageInputProps> = ({ currentRoom }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentions, setMentions] = useState<string[]>([]);

  const { sendMessage, setTyping } = useChat(currentRoom);
  const typingUsers = useTypingIndicator();
  const { searchUsers, users } = useUsers();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(message, mentions);
      setMessage('');
      setMentions([]);
      setShowMentions(false);
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
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev =>
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev =>
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionSuggestions[selectedMentionIndex]) {
          selectMention(mentionSuggestions[selectedMentionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
      setCursorPosition(cursorPos);

      // Check for @ mentions
      const beforeCursor = value.substring(0, cursorPos);
      const atIndex = beforeCursor.lastIndexOf('@');

      if (atIndex !== -1) {
        const afterAt = beforeCursor.substring(atIndex + 1);
        const spaceIndex = afterAt.indexOf(' ');

        if (spaceIndex === -1 && afterAt.length <= 20) {
          // We're in a mention
          setMentionSearch(afterAt);
          setShowMentions(true);
          searchMentions(afterAt);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
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

  // Search for mentions
  const searchMentions = async (search: string) => {
    if (!search.trim()) {
      setMentionSuggestions(users.slice(0, 5));
      return;
    }

    try {
      const results = await searchUsers(search);
      setMentionSuggestions(results.slice(0, 5));
      setSelectedMentionIndex(0);
    } catch (error) {
      console.error('Error searching mentions:', error);
    }
  };

  // Select a mention
  const selectMention = (user: User) => {
    const beforeCursor = message.substring(0, cursorPosition);
    const afterCursor = message.substring(cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const beforeAt = beforeCursor.substring(0, atIndex);
      const newMessage = `${beforeAt}@${user.displayName} ${afterCursor}`;
      setMessage(newMessage);

      // Add to mentions array if not already there
      if (!mentions.includes(user.uid)) {
        setMentions(prev => [...prev, user.uid]);
      }

      setShowMentions(false);
      setMentionSearch('');

      // Focus back to textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = beforeAt.length + user.displayName.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const beforeCursor = message.substring(0, cursorPosition);
    const afterCursor = message.substring(cursorPosition);
    const newMessage = beforeCursor + emoji + afterCursor;

    if (newMessage.length <= MAX_MESSAGE_LENGTH) {
      setMessage(newMessage);
      setShowEmojiPicker(false);

      // Focus back to textarea and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = cursorPosition + emoji.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          setCursorPosition(newCursorPos);
        }
      }, 0);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Initialize mention suggestions
  useEffect(() => {
    if (showMentions && !mentionSearch) {
      setMentionSuggestions(users.slice(0, 5));
    }
  }, [showMentions, mentionSearch, users]);

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isNearLimit = remainingChars <= 50;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 relative">
      {/* Mention Suggestions */}
      {showMentions && mentionSuggestions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {mentionSuggestions.map((user, index) => (
            <div
              key={user.uid}
              className={cn(
                'flex items-center space-x-2 p-3 cursor-pointer',
                index === selectedMentionIndex
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              onClick={() => selectMention(user)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{user.displayName}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}

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
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua mensagem... (@ para mencionar, Shift+Enter para quebra de linha)"
            className="min-h-[44px] max-h-32 resize-none pr-20"
            disabled={isSending}
            rows={1}
          />

          {/* Emoji and Mention buttons */}
          <div className="absolute right-2 bottom-2 flex space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const textarea = textareaRef.current;
                if (textarea) {
                  const atPos = textarea.selectionStart;
                  const beforeCursor = message.substring(0, atPos);
                  const afterCursor = message.substring(atPos);
                  const newMessage = beforeCursor + '@' + afterCursor;
                  setMessage(newMessage);
                  setCursorPosition(atPos + 1);
                  setShowMentions(true);
                  searchMentions('');
                  setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(atPos + 1, atPos + 1);
                  }, 0);
                }
              }}
            >
              <AtSign className="h-4 w-4" />
            </Button>

            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={350}
                  height={400}
                />
              </PopoverContent>
            </Popover>
          </div>

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
