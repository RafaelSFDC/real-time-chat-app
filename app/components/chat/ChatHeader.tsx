import React from 'react';
import { LogOut, MessageCircle, Hash, Users } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { useAuth } from '~/contexts/AuthContext';
import type { Room } from '~/types';

interface ChatHeaderProps {
  currentRoom?: Room | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ currentRoom }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
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

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SidebarTrigger />
          {currentRoom ? (
            <>
              <Hash className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentRoom.name}
                </h1>
                {currentRoom.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentRoom.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="ml-2">
                <Users className="h-3 w-3 mr-1" />
                {currentRoom.members.length}
              </Badge>
            </>
          ) : (
            <>
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chat Global
              </h1>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {user?.displayName ? getInitials(user.displayName) : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {user?.displayName || user?.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2 hidden sm:block">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
