import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { LoginForm } from '~/components/auth/LoginForm';
import { RegisterForm } from '~/components/auth/RegisterForm';
import { useAuth } from '~/contexts/AuthContext';
import type { Route } from './+types/auth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Autenticação - Chat App" },
    { name: "description", content: "Entre ou crie sua conta no Chat App" },
  ];
}

export default function Auth() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Redirect to chat if user is already authenticated
  if (!loading && user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
