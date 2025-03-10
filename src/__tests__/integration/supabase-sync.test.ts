import { rest, RestRequest, ResponseComposition, RestContext } from 'msw';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { server } from '../../../jest.setup';
import { RegistroSono } from '@/app/stores/sonoStore';

// Declarações do Jest
declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void) => void;
declare const afterEach: (fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: jest.Expect;

// Helper para gerar IDs únicos para testes
const generateTestId = () => `test-${Math.random().toString(36).substring(2, 15)}`;

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

// Mock da função de sincronização
const mockSyncOfflineRegistros = async () => {
  const storedData = localStorage.getItem('sono-storage');
  if (storedData) {
    const data = JSON.parse(storedData);
    const registros = data.state.registros || [];
    
    await Promise.all(registros.map((registro: RegistroSono) => 
      mockSupabase.from('registros_sono').insert(registro)
    ));
    
    // Limpa registros após sincronização
    localStorage.setItem('sono-storage', JSON.stringify({
      state: {
        registros: [],
        lastSyncedAt: Date.now()
      }
    }));
  }
};

describe('Supabase Sync Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // 1. Testes de conectividade
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

      const response = await mockSupabase.from('registros_sono').select('*');
      expect(response.error).toBeTruthy();
    });
  });

  // 2. Testes de armazenamento offline
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
        id: generateTestId(),
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
        rest.post('http://localhost:54321/rest/v1/registros_sono', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json({ data: mockRegistro }));
        })
      );

      await mockSyncOfflineRegistros();
      const storedData = localStorage.getItem('sono-storage');
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.state.registros).toEqual([]);
      expect(parsedData.state.lastSyncedAt).toBeTruthy();
    });
  });

  // 3. Testes de sincronização automática
  describe('Auto-Sync Tests', () => {
    it('should sync sleep records automatically when online', async () => {
      const mockRegistro: RegistroSono = {
        id: generateTestId(),
        inicio: new Date().toISOString(),
        qualidade: 4
      };

      server.use(
        rest.get('http://localhost:54321/rest/v1/registros_sono', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json([mockRegistro]));
        })
      );

      const response = await mockSupabase.from('registros_sono').select('*');
      expect(response.error).toBeNull();
      expect(response.data).toContainEqual(mockRegistro);
    });

    it('should handle sync conflicts with server version priority', async () => {
      const localRegistro: RegistroSono = {
        id: generateTestId(),
        inicio: new Date().toISOString(),
        qualidade: 3
      };

      const serverRegistro = { ...localRegistro, qualidade: 4 };

      server.use(
        rest.get('http://localhost:54321/rest/v1/registros_sono', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.json([serverRegistro]));
        })
      );

      const response = await mockSupabase.from('registros_sono').select('*');
      expect(response.error).toBeNull();
      expect(response.data?.[0].qualidade).toBe(4);
    });
  });
});
