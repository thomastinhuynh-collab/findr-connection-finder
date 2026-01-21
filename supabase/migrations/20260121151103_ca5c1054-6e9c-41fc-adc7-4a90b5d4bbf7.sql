-- Fix overly permissive INSERT policy
DROP POLICY "Users can insert notifications" ON public.notifications;

-- Only authenticated users can create notifications
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);