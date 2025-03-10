-- Função para verificar se uma política existe
CREATE OR REPLACE FUNCTION check_policy_exists(policy_name TEXT, table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = table_name
      AND policyname = policy_name
  ) INTO policy_exists;
  
  RETURN policy_exists;
END;
$$; 