import React, { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, Trash2, Smile, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Skeleton } from '~/components/ui/skeleton';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Badge } from '~/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { useAuth } from '~/contexts/AuthContext';
import { useUsers } from '~/hooks/useUsers';
import { useChat } from '~/hooks/useChat';
import { UserContextMenu } from './UserContextMenu';
import type { Message, Room } from '~/types';
import { cn } from '~/lib/utils';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentRoom?: Room | null;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading, currentRoom }) => {
  const { user } = useAuth();
  const { getUserById } = useUsers();
  const { editMessage, deleteMessage, addReaction, removeReaction } = useChat(currentRoom);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ptBR });
    } else if (isYesterday(date)) {
      return `Ontem ${format(date, 'HH:mm', { locale: ptBR })}`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
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

  // Render message text with line breaks and mentions
  const renderMessageText = (text: string, mentions: string[] = []) => {
    // First, handle line breaks
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {renderLineWithMentions(line, mentions)}
      </React.Fragment>
    ));
  };

  // Render a line with mentions highlighted
  const renderLineWithMentions = (line: string, mentions: string[] = []) => {
    if (mentions.length === 0) {
      return line;
    }

    // Create a regex to find @mentions
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(line)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      // Find the mentioned user
      const mentionedUserName = match[1];
      const mentionedUser = getUserById(mentions.find(uid => {
        const user = getUserById(uid);
        return user?.displayName === mentionedUserName;
      }) || '');

      // Add the mention with styling
      parts.push(
        <span
          key={match.index}
          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded font-medium"
        >
          @{mentionedUserName}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  // Handle message editing
  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;

    try {
      await editMessage(messageId, editText);
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  // Handle emoji reaction
  const handleEmojiReaction = async (messageId: string, emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    setShowEmojiPicker(null);

    try {
      const message = messages.find(m => m.id === messageId);
      const hasReacted = message?.reactions?.[emoji]?.users?.includes(user?.uid || '');

      if (hasReacted) {
        await removeReaction(messageId, emoji);
      } else {
        await addReaction(messageId, emoji);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  // Copy message text
  const copyMessageText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Start editing
  const startEditing = (message: Message) => {
    setEditingMessage(message.id);
    setEditText(message.text);
  };

  // User context menu handlers
  const handleViewProfile = (userId: string) => {
    // TODO: Implementar visualização de perfil
    console.log('Ver perfil do usuário:', userId);
  };

  const handleSendDirectMessage = (userId: string) => {
    // TODO: Implementar mensagem direta
    console.log('Enviar mensagem direta para:', userId);
  };

  const handleAddFriend = (userId: string) => {
    // TODO: Implementar adicionar amigo
    console.log('Adicionar amigo:', userId);
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full max-w-xs" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.userId === user?.uid;
        const isEditing = editingMessage === message.id;

        return (
          <div
            key={message.id}
            className={cn(
              'flex items-start space-x-3',
              isOwnMessage && 'flex-row-reverse space-x-reverse'
            )}
          >
            <UserContextMenu
              userId={message.userId}
              userName={message.userName}
              userEmail={message.userEmail}
              isOwnMessage={isOwnMessage}
              onViewProfile={handleViewProfile}
              onSendDirectMessage={handleSendDirectMessage}
              onAddFriend={handleAddFriend}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={cn(
                  'text-xs',
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white'
                )}>
                  {getInitials(message.userName)}
                </AvatarFallback>
              </Avatar>
            </UserContextMenu>

            <div className={cn(
              'flex flex-col max-w-xs lg:max-w-md',
              isOwnMessage && 'items-end'
            )}>
              <div className={cn(
                'flex items-center space-x-2 mb-1',
                isOwnMessage && 'flex-row-reverse space-x-reverse'
              )}>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {isOwnMessage ? 'Você' : message.userName}
                </span>
                <span className="text-xs text-gray-400">
                  {formatMessageTime(message.timestamp)}
                  {message.isEdited && (
                    <span className="ml-1 text-xs text-gray-500">(editado)</span>
                  )}
                </span>
              </div>

              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap cursor-pointer hover:opacity-90 transition-opacity',
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    )}
                    onClick={(e) => {
                      // Trigger context menu on normal click too
                      e.preventDefault();
                      const contextMenuEvent = new MouseEvent('contextmenu', {
                        bubbles: true,
                        cancelable: true,
                        clientX: e.clientX,
                        clientY: e.clientY,
                      });
                      e.currentTarget.dispatchEvent(contextMenuEvent);
                    }}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEditMessage(message.id);
                            } else if (e.key === 'Escape') {
                              setEditingMessage(null);
                              setEditText('');
                            }
                          }}
                          className="text-sm min-h-[60px] resize-none"
                          autoFocus
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditMessage(message.id)}
                            className="h-6 px-2 text-xs"
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMessage(null);
                              setEditText('');
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      renderMessageText(message.text, message.mentions)
                    )}
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem onClick={() => copyMessageText(message.text)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar texto
                  </ContextMenuItem>

                  <ContextMenuItem onClick={() => setShowEmojiPicker(message.id)}>
                    <Smile className="h-4 w-4 mr-2" />
                    Reagir
                  </ContextMenuItem>

                  {isOwnMessage && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => startEditing(message)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleDeleteMessage(message.id)}
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>

              {/* Reactions */}
              {message.reactions && Object.keys(message.reactions).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(message.reactions).map(([emoji, reaction]) => {
                    if (reaction.count <= 0) return null;

                    const hasReacted = reaction.users?.includes(user?.uid || '');

                    return (
                      <Button
                        key={emoji}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-6 px-2 text-xs',
                          hasReacted && 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
                        )}
                        onClick={() => {
                          if (hasReacted) {
                            removeReaction(message.id, emoji);
                          } else {
                            addReaction(message.id, emoji);
                          }
                        }}
                      >
                        {emoji} {reaction.count}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Emoji Picker for Reactions */}
              {showEmojiPicker === message.id && (
                <Popover open={true} onOpenChange={() => setShowEmojiPicker(null)}>
                  <PopoverContent className="w-auto p-0" align="start">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => handleEmojiReaction(message.id, emojiData)}
                      width={300}
                      height={350}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
