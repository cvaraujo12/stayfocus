-- Permitir leitura anônima para tabelas específicas
CREATE POLICY "Permitir leitura anônima de profiles"
    ON public.profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir leitura anônima de daily_routines"
    ON public.daily_routines
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir leitura anônima de medications"
    ON public.medications
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir leitura anônima de routine_completions"
    ON public.routine_completions
    FOR SELECT
    USING (true);

CREATE POLICY "Permitir leitura anônima de medication_logs"
    ON public.medication_logs
    FOR SELECT
    USING (true); 