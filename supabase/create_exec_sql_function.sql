-- Função para executar comandos SQL arbitrários
-- Esta função requer privilégios elevados e deve ser usada com cautela
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com os privilégios do criador da função
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Executa o comando SQL
  EXECUTE sql;
  
  -- Retorna um objeto JSON vazio como resultado
  result := '{}'::jsonb;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Captura qualquer erro e o retorna como JSON
    result := jsonb_build_object(
      'error', SQLERRM,
      'state', SQLSTATE,
      'context', 'Erro ao executar SQL: ' || sql
    );
    
    RETURN result;
END;
$$;

-- Comentário para documentação
COMMENT ON FUNCTION exec_sql(text) IS 'Execute SQL commands with elevated privileges. USE WITH CAUTION.';

-- Garante que apenas os administradores podem executar esta função
REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO postgres; 