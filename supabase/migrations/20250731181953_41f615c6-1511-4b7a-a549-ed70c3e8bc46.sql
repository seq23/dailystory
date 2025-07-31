-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  display_name TEXT,
  date_of_birth DATE,
  grade_level TEXT,
  reading_level TEXT DEFAULT 'beginner',
  native_language TEXT DEFAULT 'en',
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reading_level TEXT NOT NULL,
  age_group TEXT NOT NULL,
  author_style TEXT,
  theme TEXT,
  word_count INTEGER,
  page_count INTEGER DEFAULT 1,
  image_urls TEXT[],
  vocabulary_words TEXT[],
  comprehension_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Stories are viewable by everyone (public content)
CREATE POLICY "Stories are viewable by everyone" 
ON public.stories 
FOR SELECT 
USING (true);

-- Create reading sessions table
CREATE TABLE public.reading_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  story_id UUID REFERENCES public.stories NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- in seconds
  words_read INTEGER,
  comprehension_score INTEGER, -- 0-100
  difficulty_rating INTEGER, -- 1-5 how hard was it
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reading sessions
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- Reading sessions policies
CREATE POLICY "Users can view their own reading sessions" 
ON public.reading_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading sessions" 
ON public.reading_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading sessions" 
ON public.reading_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create vocabulary progress table
CREATE TABLE public.vocabulary_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  word TEXT NOT NULL,
  definition TEXT,
  first_encountered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  times_encountered INTEGER DEFAULT 1,
  mastery_level INTEGER DEFAULT 1, -- 1-5 scale
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, word)
);

-- Enable RLS for vocabulary progress
ALTER TABLE public.vocabulary_progress ENABLE ROW LEVEL SECURITY;

-- Vocabulary progress policies
CREATE POLICY "Users can view their own vocabulary progress" 
ON public.vocabulary_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own vocabulary progress" 
ON public.vocabulary_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, grade_level)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Reader'),
    COALESCE(NEW.raw_user_meta_data ->> 'grade_level', 'K')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();