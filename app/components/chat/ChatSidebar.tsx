import React, { useState } from 'react';
import { Search, Plus, Hash, Users, MessageCircle, Lock } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Switch } from '~/components/ui/switch';
import { Label } from '~/components/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '~/components/ui/sidebar';
import { useRooms } from '~/hooks/useRooms';
import { useUsers } from '~/hooks/useUsers';
import { useAuth } from '~/contexts/AuthContext';
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
  const { searchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    rooms: Room[];
    users: User[];
  }>({ rooms: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [roomPassword, setRoomPassword] = useState('');

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
    if (isPrivateRoom && !roomPassword.trim()) {
      alert('Senha é obrigatória para salas privadas');
      return;
    }

    try {
      await createRoom(newRoomName, '', isPrivateRoom, isPrivateRoom ? roomPassword : undefined);
      setNewRoomName('');
      setIsPrivateRoom(false);
      setRoomPassword('');
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
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat</h2>
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
          <div className="mt-3 space-y-3">
            <Input
              placeholder="Nome da sala..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateRoom();
                } else if (e.key === 'Escape') {
                  setShowCreateRoom(false);
                  setNewRoomName('');
                  setIsPrivateRoom(false);
                  setRoomPassword('');
                }
              }}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="private-room"
                checked={isPrivateRoom}
                onCheckedChange={setIsPrivateRoom}
              />
              <Label htmlFor="private-room" className="text-sm">
                Sala privada
              </Label>
            </div>

            {isPrivateRoom && (
              <Input
                type="password"
                placeholder="Senha da sala..."
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRoom();
                  } else if (e.key === 'Escape') {
                    setShowCreateRoom(false);
                    setNewRoomName('');
                    setIsPrivateRoom(false);
                    setRoomPassword('');
                  }
                }}
              />
            )}

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
                  setIsPrivateRoom(false);
                  setRoomPassword('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Search Results */}
        {searchTerm && (
          <SidebarGroup>
            <SidebarGroupLabel>Resultados da busca</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Room Results */}
                {searchResults.rooms.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-gray-400 mb-2 flex items-center px-2">
                      <Hash className="h-3 w-3 mr-1" />
                      Salas
                    </div>
                    {searchResults.rooms.map((room) => (
                      <SidebarMenuItem key={room.id}>
                        <SidebarMenuButton
                          onClick={() => isUserInRoom(room) ? onRoomSelect(room) : handleJoinRoom(room)}
                          className="w-full justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            {room.isPrivate ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Hash className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm">{room.name}</span>
                          </div>
                          {!isUserInRoom(room) && (
                            <Badge variant="outline" className="text-xs">
                              Entrar
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </>
                )}

                {/* User Results */}
                {searchResults.users.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-gray-400 mb-2 flex items-center px-2 mt-4">
                      <Users className="h-3 w-3 mr-1" />
                      Usuários
                    </div>
                    {searchResults.users.map((user) => (
                      <SidebarMenuItem key={user.uid}>
                        <SidebarMenuButton
                          onClick={() => onUserSelect(user)}
                          className="w-full"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.displayName}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </>
                )}

                {!isSearching && searchResults.rooms.length === 0 && searchResults.users.length === 0 && (
                  <div className="px-2 py-4">
                    <p className="text-sm text-gray-500">
                      Nenhum resultado encontrado
                    </p>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Room List */}
        {!searchTerm && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Global Chat */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onRoomSelect(null)}
                      isActive={!currentRoom}
                      className="w-full"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">Chat Global</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Minhas Salas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <SidebarMenuItem key={room.id}>
                        <SidebarMenuButton
                          onClick={() => onRoomSelect(room)}
                          isActive={currentRoom?.id === room.id}
                          className="w-full justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            {room.isPrivate ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Hash className="h-4 w-4" />
                            )}
                            <span className="text-sm">{room.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {room.members.length}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-4">
                      <p className="text-sm text-gray-500">
                        Nenhuma sala encontrada. Crie uma nova sala ou procure por salas públicas.
                      </p>
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
