CREATE OR REPLACE FUNCTION public.__set_service_role_vault_secret(p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE existing uuid;
BEGIN
  SELECT id INTO existing FROM vault.secrets WHERE name = 'service_role_key';
  IF existing IS NULL THEN
    PERFORM vault.create_secret(p_value, 'service_role_key', 'Service role key used by pg_cron to authenticate to edge functions');
  ELSE
    PERFORM vault.update_secret(existing, p_value);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.__set_service_role_vault_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.__set_service_role_vault_secret(text) TO service_role;