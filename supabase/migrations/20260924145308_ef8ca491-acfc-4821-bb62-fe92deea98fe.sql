REVOKE EXECUTE ON FUNCTION public.award_xp_on_evaluation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_xp_on_proposal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_xp_on_proposal_completed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_xp_on_search() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_keyword_alert_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_keyword_alerts() FROM PUBLIC, anon, authenticated;