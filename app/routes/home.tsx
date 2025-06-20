import React, { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '~/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat App - Aplicativo de Chat em Tempo Real" },
    { name: "description", content: "Aplicativo de chat em tempo real com Firebase" },
  ];
}

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect based on authentication status
  if (user) {
    return <Navigate to="/chat" replace />;
  } else {
    return <Navigate to="/auth" replace />;
  }
}
