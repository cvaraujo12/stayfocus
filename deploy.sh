#!/bin/bash

# Script de deploy para o aplicativo Painel Neurodivergentes

echo "Iniciando deploy do aplicativo..."

# Atualizar o código do repositório
echo "Atualizando código do repositório..."
git pull

# Instalar dependências
echo "Instalando dependências..."
npm install

# Construir o aplicativo
echo "Construindo o aplicativo..."
npm run build

# Iniciar o servidor
echo "Iniciando o servidor em modo de produção..."
npm run start

echo "Deploy concluído! O aplicativo está rodando em modo de produção."
