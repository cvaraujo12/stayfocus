import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/supabase/client';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) {
    return (
      <a
        href="/login"
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        <User className="w-4 h-4" />
        Fazer Login
      </a>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
          {user.email?.[0].toUpperCase()}
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {user.email}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
} 