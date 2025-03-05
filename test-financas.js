// Este script executa algumas operações na store de finanças para pré-carregar dados de exemplo
// Pode ser executado no console do navegador após abrir a página de Finanças

// Adicionar algumas transações de exemplo
const { adicionarTransacao } = window.useFinancasStore.getState();

// Algumas datas recentes
const hoje = new Date().toISOString().split('T')[0];
const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const doisDiasAtras = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const tresDiasAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const quatroDiasAtras = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

// Adicionar despesas
adicionarTransacao(hoje, 125.50, 'Supermercado', '2', 'despesa');
adicionarTransacao(ontem, 45.00, 'Farmácia', '4', 'despesa');
adicionarTransacao(ontem, 350.00, 'Aluguel', '1', 'despesa');
adicionarTransacao(doisDiasAtras, 32.00, 'Uber', '3', 'despesa');
adicionarTransacao(tresDiasAtras, 80.00, 'Cinema', '5', 'despesa');
adicionarTransacao(tresDiasAtras, 60.00, 'Restaurante', '2', 'despesa');
adicionarTransacao(quatroDiasAtras, 120.00, 'Conta de luz', '1', 'despesa');
adicionarTransacao(umaSemanaAtras, 200.00, 'Manutenção do carro', '3', 'despesa');

console.log('Dados de exemplo adicionados com sucesso!');
