-- Create saved stories table for premium users
CREATE TABLE public.saved_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  difficulty TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  estimated_reading_time INTEGER DEFAULT 0,
  user_preferences JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for saved stories
CREATE POLICY "Users can view their own saved stories" 
ON public.saved_stories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved stories" 
ON public.saved_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved stories" 
ON public.saved_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved stories" 
ON public.saved_stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user preferences table for premium users
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  age INTEGER,
  grade_level TEXT,
  native_language TEXT DEFAULT 'en',
  learning_goal TEXT,
  avatar_type TEXT,
  avatar_skin_tone TEXT,
  favorite_color TEXT,
  favorite_animal TEXT,
  hobbies TEXT,
  favorite_food TEXT,
  reading_preferences JSONB DEFAULT '{}',
  story_preferences JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create story collections table for organizing saved stories
CREATE TABLE public.story_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  story_ids UUID[] DEFAULT ARRAY[]::UUID[],
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.story_collections ENABLE ROW LEVEL SECURITY;

-- Create policies for story collections
CREATE POLICY "Users can manage their own collections" 
ON public.story_collections 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on saved_stories
CREATE TRIGGER update_saved_stories_updated_at
BEFORE UPDATE ON public.saved_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on story_collections
CREATE TRIGGER update_story_collections_updated_at
BEFORE UPDATE ON public.story_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_saved_stories_user_id ON public.saved_stories(user_id);
CREATE INDEX idx_saved_stories_created_at ON public.saved_stories(created_at);
CREATE INDEX idx_saved_stories_difficulty ON public.saved_stories(difficulty);
CREATE INDEX idx_saved_stories_tags ON public.saved_stories USING GIN(tags);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_story_collections_user_id ON public.story_collections(user_id);