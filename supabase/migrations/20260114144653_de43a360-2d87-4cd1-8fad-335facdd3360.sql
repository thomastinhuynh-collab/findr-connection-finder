-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_findr BOOLEAN DEFAULT false,
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create searches table for user posted searches
CREATE TABLE public.searches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    budget_min INTEGER,
    budget_max INTEGER,
    urgency TEXT DEFAULT 'normal',
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

-- Searches policies
CREATE POLICY "Searches are viewable by everyone" 
ON public.searches 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own searches" 
ON public.searches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own searches" 
ON public.searches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches" 
ON public.searches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create evaluations/reviews table
CREATE TABLE public.evaluations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    search_id UUID REFERENCES public.searches(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Evaluations policies
CREATE POLICY "Evaluations are viewable by everyone" 
ON public.evaluations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create evaluations" 
ON public.evaluations 
FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_searches_updated_at
BEFORE UPDATE ON public.searches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();