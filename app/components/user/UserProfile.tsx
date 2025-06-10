import React, { useState } from 'react';
import { User, Camera, Trash2, Save, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { useAuth } from '~/contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '~/lib/firebase';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    const imageRef = ref(storage, `profile-images/${user.uid}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const deleteImage = async () => {
    if (!user?.photoURL) return;

    try {
      setIsLoading(true);
      
      // Delete from storage
      const imageRef = ref(storage, `profile-images/${user.uid}`);
      await deleteObject(imageRef);

      // Update user profile
      await updateProfile(user, {
        photoURL: null,
      });

      // Update Firestore
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        photoURL: null,
      });

      setShowDeleteImageDialog(false);
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      let photoURL = user.photoURL;

      // Upload new image if selected
      if (imageFile) {
        photoURL = await uploadImage(imageFile);
      }

      // Update user profile
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL,
      });

      // Update Firestore
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        displayName: displayName.trim(),
        photoURL,
      });

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setImageFile(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
            <DialogDescription>
              Atualize suas informações de perfil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || user?.photoURL || undefined} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {user?.displayName ? getInitials(user.displayName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {user?.photoURL && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteImageDialog(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir imagem
                </Button>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de exibição</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !displayName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog open={showDeleteImageDialog} onOpenChange={setShowDeleteImageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imagem de perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua imagem de perfil? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteImage}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
