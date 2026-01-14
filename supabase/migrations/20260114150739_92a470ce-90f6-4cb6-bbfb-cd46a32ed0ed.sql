-- Add premium status to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_premium boolean DEFAULT false;

-- Add featured flag to searches for premium boost
ALTER TABLE public.searches 
ADD COLUMN is_featured boolean DEFAULT false;