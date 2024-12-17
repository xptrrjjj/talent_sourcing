import React, { useState } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { MicrosoftLoginButton } from '../components/auth/MicrosoftLoginButton';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthRedirect } from '../services/auth/hooks/useAuthRedirect';

export function Login() {
  const { login, loginWithMicrosoft, isLoading, error } = useUserContext();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Handle auth redirects
  useAuthRedirect();

  const handleSubmit = async (username: string, password: string) => {
    setFormError(null);
    try {
      await login(username, password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleMicrosoftLogin = async () => {
    setFormError(null);
    try {
      await loginWithMicrosoft();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Microsoft login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {(error || formError) && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error || formError}
            </div>
          )}

          <div className="space-y-6">
            <MicrosoftLoginButton
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              isLoading={isLoading}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <LoginForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}