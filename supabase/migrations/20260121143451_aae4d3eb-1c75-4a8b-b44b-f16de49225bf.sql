-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  findr_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  proposed_price NUMERIC NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  product_link TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Policies for proposals
CREATE POLICY "Users can view proposals for their searches or their own proposals"
ON public.proposals FOR SELECT
USING (
  auth.uid() = findr_id OR 
  auth.uid() IN (SELECT user_id FROM public.searches WHERE id = search_id)
);

CREATE POLICY "Findrs can create proposals"
ON public.proposals FOR INSERT
WITH CHECK (auth.uid() = findr_id);

CREATE POLICY "Findrs can update their own proposals"
ON public.proposals FOR UPDATE
USING (auth.uid() = findr_id);

CREATE POLICY "Search owners can update proposal status"
ON public.proposals FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM public.searches WHERE id = search_id));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Trigger for proposals updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();