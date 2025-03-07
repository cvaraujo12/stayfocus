#!/bin/bash

# Verifica se o TypeScript está instalado
if ! command -v tsc &> /dev/null; then
    echo "TypeScript não está instalado. Instalando..."
    npm install -g typescript
fi

# Verifica se o ts-node está instalado
if ! command -v ts-node &> /dev/null; then
    echo "ts-node não está instalado. Instalando..."
    npm install -g ts-node
fi

# Executa o teste CRUD
echo "Executando teste CRUD..."
npx ts-node supabase/test-crud.ts

echo "Teste concluído!" 