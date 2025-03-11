-- Script para criar todas as tabelas faltantes no banco de dados Supabase

-- Tabela de prioridades
CREATE TABLE IF NOT EXISTS "public"."prioridades" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "status" VARCHAR(50) DEFAULT 'pendente',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS "idx_prioridades_user_id" ON "public"."prioridades" ("user_id");

-- RLS para prioridades
ALTER TABLE "public"."prioridades" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias prioridades" 
    ON "public"."prioridades" 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias prioridades" 
    ON "public"."prioridades" 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias prioridades" 
    ON "public"."prioridades" 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias prioridades" 
    ON "public"."prioridades" 
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela para notas de autoconhecimento
CREATE TABLE IF NOT EXISTS "public"."self_knowledge_notes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "titulo" VARCHAR(255) NOT NULL,
    "conteudo" TEXT NOT NULL,
    "data_criacao" DATE NOT NULL DEFAULT CURRENT_DATE,
    "tags" TEXT[] DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS "idx_self_knowledge_notes_user_id" ON "public"."self_knowledge_notes" ("user_id");

-- RLS para notas de autoconhecimento
ALTER TABLE "public"."self_knowledge_notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias notas" 
    ON "public"."self_knowledge_notes" 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias notas" 
    ON "public"."self_knowledge_notes" 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notas" 
    ON "public"."self_knowledge_notes" 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias notas" 
    ON "public"."self_knowledge_notes" 
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela para sessões de estudo
CREATE TABLE IF NOT EXISTS "public"."study_sessions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "titulo" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(100),
    "duracao_minutos" INTEGER NOT NULL,
    "data_sessao" DATE NOT NULL,
    "hora_inicio" VARCHAR(5),
    "observacoes" TEXT,
    "concluida" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS "idx_study_sessions_user_id" ON "public"."study_sessions" ("user_id");

-- RLS para sessões de estudo
ALTER TABLE "public"."study_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias sessões de estudo" 
    ON "public"."study_sessions" 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias sessões de estudo" 
    ON "public"."study_sessions" 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias sessões de estudo" 
    ON "public"."study_sessions" 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias sessões de estudo" 
    ON "public"."study_sessions" 
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela para registros de sono
CREATE TABLE IF NOT EXISTS "public"."sleep_records" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "data_registro" DATE NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fim" VARCHAR(5) NOT NULL,
    "duracao_minutos" INTEGER NOT NULL,
    "qualidade" INTEGER CHECK (qualidade BETWEEN 1 AND 5),
    "observacoes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS "idx_sleep_records_user_id" ON "public"."sleep_records" ("user_id");

-- RLS para registros de sono
ALTER TABLE "public"."sleep_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios registros de sono" 
    ON "public"."sleep_records" 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de sono" 
    ON "public"."sleep_records" 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de sono" 
    ON "public"."sleep_records" 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de sono" 
    ON "public"."sleep_records" 
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela para registros de medicamentos
CREATE TABLE IF NOT EXISTS "public"."registros_medicamentos" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "medicamento_id" UUID NOT NULL,
    "data_hora" TIMESTAMP WITH TIME ZONE NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS "idx_registros_medicamentos_user_id" ON "public"."registros_medicamentos" ("user_id");

-- RLS para registros de medicamentos
ALTER TABLE "public"."registros_medicamentos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios registros de medicamentos" 
    ON "public"."registros_medicamentos" 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de medicamentos" 
    ON "public"."registros_medicamentos" 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de medicamentos" 
    ON "public"."registros_medicamentos" 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de medicamentos" 
    ON "public"."registros_medicamentos" 
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela para registros de medicamentos (nome alternativo usado em algumas partes do código)
CREATE TABLE IF NOT EXISTS "public"."medication_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "nome_medicamento" VARCHAR(255) NOT NULL,
    "dosagem" VARCHAR(100) NOT NULL,
    "data_hora" TIMESTAMP WITH TIME ZONE NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS "idx_medication_logs_user_id" ON "public"."medication_logs" ("user_id");

-- RLS para registros de medicamentos
ALTER TABLE "public"."medication_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios registros de medicamentos" 
    ON "public"."medication_logs" 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de medicamentos" 
    ON "public"."medication_logs" 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de medicamentos" 
    ON "public"."medication_logs" 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de medicamentos" 
    ON "public"."medication_logs" 
    FOR DELETE USING (auth.uid() = user_id); 