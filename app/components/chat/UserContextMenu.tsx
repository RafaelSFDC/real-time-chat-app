import React from 'react';
import { User, MessageCircle, UserPlus, Eye } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';

interface UserContextMenuProps {
  userId: string;
  userName: string;
  userEmail: string;
  isOwnMessage: boolean;
  onViewProfile?: (userId: string) => void;
  onSendDirectMessage?: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  children: React.ReactNode;
}

export const UserContextMenu: React.FC<UserContextMenuProps> = ({
  userId,
  userName,
  userEmail,
  isOwnMessage,
  onViewProfile,
  onSendDirectMessage,
  onAddFriend,
  children,
}) => {
  const handleViewProfile = () => {
    onViewProfile?.(userId);
  };

  const handleSendDirectMessage = () => {
    onSendDirectMessage?.(userId);
  };

  const handleAddFriend = () => {
    onAddFriend?.(userId);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>
          {children}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleViewProfile}>
          <Eye className="h-4 w-4 mr-2" />
          Ver perfil
        </ContextMenuItem>

        {!isOwnMessage && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleSendDirectMessage}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar mensagem direta
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddFriend}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar amigo
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
