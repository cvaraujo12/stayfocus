'use client';

import { DebugProviders } from '../providers.debug';

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Debug</h1>
      <p className="mb-4">Verificando configuração de provedores. Por favor, verifique o console.</p>
      <DebugProviders />
    </div>
  );
} 