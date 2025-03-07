require('@testing-library/jest-dom');
const { setupServer } = require('msw/node');

// Configuração do Mock Service Worker para simular respostas da API
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

module.exports = { server };
