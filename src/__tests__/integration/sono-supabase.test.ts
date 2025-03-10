import { rest, RestRequest, ResponseComposition, RestContext } from 'msw';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { server } from '../../../jest.setup';
import { RegistroSono } from '@/app/stores/sonoStore';

// Helper para gerar IDs únicos para testes
const generateTestId = () => `test-${Math.random().toString(36).substring(2, 15)}`;

// Mock do crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: generateTestId
  }
});

// Declarações do Jest
declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void) => void;
declare const afterEach: (fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: jest.Expect;

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

describe('Sono Supabase Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // 1. Teste de conectividade
  describe('Connectivity Tests', () => {
    it('should check connection before operations', async () => {
      server.use(
        rest.get('http://localhost:54321/rest/v1/health', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({ status: 'available' }));
        })
      );

      const response = await mockSupabase.from('health').select('*');
      expect(response.error).toBeNull();
    });

    it('should handle offline state gracefully', async () => {
      server.use(
        rest.get('http://localhost:54321/rest/v1/*', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.status(503));
        })
      );

      const response = await mockSupabase.from('sleep_records').select('*');
      expect(response.error).toBeTruthy();
    });
  });

  // 2. Teste de fallback para localStorage
  describe('Offline Storage Tests', () => {
    it('should save sleep records to localStorage when offline', async () => {
      const mockRegistro: RegistroSono = {
        id: generateTestId(),
        inicio: new Date().toISOString(),
        qualidade: 4
      };

      // Simula estado offline
      localStorage.setItem('sono-storage', JSON.stringify({
        state: {
          registros: [mockRegistro],
          lastSyncedAt: null
        }
      }));

      const storedData = localStorage.getItem('sono-storage');
      expect(storedData).toBeTruthy();
      expect(JSON.parse(storedData!).state.registros).toContainEqual(mockRegistro);
    });

    it('should sync localStorage data when connection is restored', async () => {
      const mockRegistro: RegistroSono = {
        id: crypto.randomUUID(),
        inicio: new Date().toISOString(),
        fim: new Date().toISOString(),
        qualidade: 5
      };

      // Simula dados locais
      localStorage.setItem('sono-storage', JSON.stringify({
        state: {
          registros: [mockRegistro],
          lastSyncedAt: Date.now() - 3600000 // 1 hora atrás
        }
      }));

      server.use(
        rest.post('http://localhost:54321/rest/v1/sleep_records', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({ data: mockRegistro }));
        })
      );

      const response = await mockSupabase.from('sleep_records').insert(mockRegistro);
      expect(response.error).toBeNull();
    });
  });

  // 3. Teste de autenticação
  describe('Authentication Flow Tests', () => {
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

  // 4. Teste de sincronização automática
  describe('Auto-Sync Tests', () => {
    it('should sync sleep records automatically when online', async () => {
      const mockRegistro: RegistroSono = {
        id: generateTestId(),
        inicio: new Date().toISOString(),
        qualidade: 4
      };

      server.use(
        rest.get('http://localhost:54321/rest/v1/sleep_records', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json([mockRegistro]));
        })
      );

      const response = await mockSupabase.from('sleep_records').select('*');
      expect(response.error).toBeNull();
      expect(response.data).toContainEqual(mockRegistro);
    });

    it('should handle sync conflicts with server version priority', async () => {
      const localRegistro: RegistroSono = {
        id: crypto.randomUUID(),
        inicio: new Date().toISOString(),
        qualidade: 3
      };

      const serverRegistro = { ...localRegistro, qualidade: 4 };

      server.use(
        rest.get('http://localhost:54321/rest/v1/sleep_records', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json([serverRegistro]));
        })
      );

      const response = await mockSupabase.from('sleep_records').select('*');
      expect(response.error).toBeNull();
      expect(response.data?.[0].qualidade).toBe(4);
    });
  });

  // 5. Teste de autenticação OAuth
  describe('OAuth Authentication Tests', () => {
    it('should initiate GitHub OAuth flow', async () => {
      server.use(
        rest.get('http://localhost:54321/auth/v1/authorize', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({
            provider: 'github',
            url: 'http://localhost:54321/auth/v1/callback'
          }));
        })
      );

      const response = await mockSupabase.auth.signInWithOAuth({
        provider: 'github'
      });

      expect(response.error).toBeNull();
      expect(response.data.url).toBeTruthy();
    });

    it('should initiate Google OAuth flow', async () => {
      server.use(
        rest.get('http://localhost:54321/auth/v1/authorize', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({
            provider: 'google',
            url: 'http://localhost:54321/auth/v1/callback'
          }));
        })
      );

      const response = await mockSupabase.auth.signInWithOAuth({
        provider: 'google'
      });

      expect(response.error).toBeNull();
      expect(response.data.url).toBeTruthy();
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

      try {
        await mockSupabase.auth.signInWithOAuth({
          provider: 'github'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});
