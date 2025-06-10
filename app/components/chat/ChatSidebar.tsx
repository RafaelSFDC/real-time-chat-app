import React, { useState } from 'react';
import { Search, Plus, Hash, Users, MessageCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { useRooms } from '~/hooks/useRooms';
import { useUsers } from '~/hooks/useUsers';
import { useAuth } from '~/contexts/AuthContext';
import { cn } from '~/lib/utils';
import type { Room, User } from '~/types';

interface ChatSidebarProps {
  currentRoom: Room | null;
  onRoomSelect: (room: Room | null) => void;
  onUserSelect: (user: User) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentRoom,
  onRoomSelect,
  onUserSelect,
}) => {
  const { user: currentUser } = useAuth();
  const { rooms, createRoom, joinRoom, searchRooms } = useRooms();
  const { users, searchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    rooms: Room[];
    users: User[];
  }>({ rooms: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults({ rooms: [], users: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const [roomResults, userResults] = await Promise.all([
        searchRooms(term),
        searchUsers(term)
      ]);

      setSearchResults({
        rooms: roomResults,
        users: userResults.filter(u => u.uid !== currentUser?.uid), // Exclude current user
      });
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const roomId = await createRoom(newRoomName);
      setNewRoomName('');
      setShowCreateRoom(false);
      // The room will appear in the list automatically due to real-time updates
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = async (room: Room) => {
    try {
      await joinRoom(room.id);
      onRoomSelect(room);
    } catch (error) {
      console.error('Error joining room:', error);
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

  const isUserInRoom = (room: Room) => {
    return currentUser && room.members.includes(currentUser.uid);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateRoom(!showCreateRoom)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar salas e usuários..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Room Form */}
        {showCreateRoom && (
          <div className="mt-3 space-y-2">
            <Input
              placeholder="Nome da sala..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleCreateRoom}>
                Criar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateRoom(false);
                  setNewRoomName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {/* Search Results */}
        {searchTerm && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Resultados da busca
            </h3>
            
            {/* Room Results */}
            {searchResults.rooms.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center">
                  <Hash className="h-3 w-3 mr-1" />
                  Salas
                </h4>
                {searchResults.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => isUserInRoom(room) ? onRoomSelect(room) : handleJoinRoom(room)}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{room.name}</span>
                    </div>
                    {!isUserInRoom(room) && (
                      <Badge variant="outline" className="text-xs">
                        Entrar
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* User Results */}
            {searchResults.users.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Usuários
                </h4>
                {searchResults.users.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => onUserSelect(user)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.displayName}</span>
                  </div>
                ))}
              </div>
            )}

            {!isSearching && searchResults.rooms.length === 0 && searchResults.users.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum resultado encontrado
              </p>
            )}
          </div>
        )}

        {/* Room List */}
        {!searchTerm && (
          <div className="p-4">
            {/* Global Chat */}
            <div
              className={cn(
                'flex items-center space-x-2 p-2 rounded-lg cursor-pointer mb-2',
                !currentRoom
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              onClick={() => onRoomSelect(null)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Chat Global</span>
            </div>

            <Separator className="my-3" />

            {/* My Rooms */}
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Minhas Salas
            </h3>
            {rooms.map((room) => (
              <div
                key={room.id}
                className={cn(
                  'flex items-center space-x-2 p-2 rounded-lg cursor-pointer',
                  currentRoom?.id === room.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                onClick={() => onRoomSelect(room)}
              >
                <Hash className="h-4 w-4" />
                <span className="text-sm">{room.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {room.members.length}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
