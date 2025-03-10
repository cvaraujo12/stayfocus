import { rest, RestRequest, ResponseComposition, RestContext } from 'msw';
import { createClient, SupabaseClient, Provider } from '@supabase/supabase-js';
import { server } from '../../../jest.setup';

// Declarações do Jest
declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void) => void;
declare const afterEach: (fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: jest.Expect;
declare const fail: (message?: string) => void;

// Mock do localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: function(key: string) {
    return this.store[key] || null;
  },
  setItem: function(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem: function(key: string) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

// Mock do Supabase client
const mockSupabase: SupabaseClient = createClient('http://localhost:54321', 'test-anon-key');

describe('Supabase Authentication Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // 1. Testes de autenticação OAuth
  describe('OAuth Authentication', () => {
    it('should prepare GitHub OAuth flow', async () => {
      server.use(
        rest.get('http://localhost:54321/auth/v1/authorize', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({
            provider: 'github',
            url: 'http://localhost:54321/auth/v1/callback'
          }));
        })
      );

      // Mock window.location para evitar erros de navegação
      const mockLocation = {
        assign: jest.fn()
      };
      Object.defineProperty(window, 'location', { value: mockLocation, writable: true });

      const response = await mockSupabase.auth.signInWithOAuth({
        provider: 'github' as Provider,
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      });

      expect(response.error).toBeNull();
      expect(response.data.url).toBeTruthy();
      expect(mockLocation.assign).toHaveBeenCalledWith(response.data.url);
    });

    it('should prepare Google OAuth flow', async () => {
      server.use(
        rest.get('http://localhost:54321/auth/v1/authorize', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({
            provider: 'google',
            url: 'http://localhost:54321/auth/v1/callback'
          }));
        })
      );

      // Mock window.location para evitar erros de navegação
      const mockLocation = {
        assign: jest.fn()
      };
      Object.defineProperty(window, 'location', { value: mockLocation, writable: true });

      const response = await mockSupabase.auth.signInWithOAuth({
        provider: 'google' as Provider,
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      });

      expect(response.error).toBeNull();
      expect(response.data.url).toBeTruthy();
      expect(mockLocation.assign).toHaveBeenCalledWith(response.data.url);
    });

    it('should handle OAuth errors gracefully', async () => {
      server.use(
        rest.get('http://localhost:54321/auth/v1/authorize', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.status(400), ctx.json({
            error: 'invalid_request',
            error_description: 'Invalid OAuth state'
          }));
        })
      );

      // Mock window.location para evitar erros de navegação
      const mockLocation = {
        assign: jest.fn()
      };
      Object.defineProperty(window, 'location', { value: mockLocation, writable: true });

      try {
        await mockSupabase.auth.signInWithOAuth({
          provider: 'github' as Provider,
          options: {
            redirectTo: 'http://localhost:3000/auth/callback'
          }
        });
        fail('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeTruthy();
        expect(mockLocation.assign).not.toHaveBeenCalled();
      }
    });
  });

  // 2. Testes de sessão
  describe('Session Management', () => {
    it('should maintain session during operations', async () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600
      };

      server.use(
        rest.post('http://localhost:54321/auth/v1/token', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json(mockSession));
        })
      );

      const response = await mockSupabase.auth.getSession();
      expect(response.error).toBeNull();
    });

    it('should handle session expiration correctly', async () => {
      server.use(
        rest.post('http://localhost:54321/auth/v1/token', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.status(401), ctx.json({ error: 'Token expired' }));
        })
      );

      const response = await mockSupabase.auth.getSession();
      expect(response.data.session).toBeNull();
    });
  });

  // 3. Testes de logout
  describe('Logout Flow', () => {
    it('should handle sign out correctly', async () => {
      server.use(
        rest.post('http://localhost:54321/auth/v1/logout', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({}));
        })
      );

      localStorage.removeItem('sb-token');
      localStorage.removeItem('sb-refresh-token');
      const response = await mockSupabase.auth.signOut();
      expect(response.error).toBeNull();
    });
  });
});
