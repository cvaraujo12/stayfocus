'use client';

import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';

export default function LogoutButton() {
  const { logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("[LOGOUT] Iniciando processo de logout...");
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('[LOGOUT] Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading || authLoading}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
      aria-label="Sair da conta"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
} 