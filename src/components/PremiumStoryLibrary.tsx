// Premium Story Library Component
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, Trash2, Play, BookOpen, Clock, Tag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel from 'embla-carousel-react';

import { toast } from '@/hooks/use-toast';
import { PremiumStoryManager, SavedStory } from '@/services/premiumStoryManager';
import { DifficultyLevel, Story } from '@/types/index';
import { BatchImageService } from '@/services/BatchImageService';

interface PremiumStoryLibraryProps {
  onLoadStory: (story: Story) => void;
  onStartNewStory: () => void;
  currentStory?: Story;
}

export const PremiumStoryLibrary: React.FC<PremiumStoryLibraryProps> = ({
  onLoadStory,
  onStartNewStory,
  currentStory
}) => {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const { isMobile, isTablet } = useIsMobile();
  const isDeck = isMobile || isTablet;
  const pageSize = isMobile ? 6 : isTablet ? 8 : 12;
  const [page, setPage] = useState(1);
  const [emblaRef] = useEmblaCarousel({ align: 'start', dragFree: false, loop: false });
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSavedStories();
  }, []);

  const loadSavedStories = async () => {
    try {
      setLoading(true);
      const stories = await PremiumStoryManager.getSavedStories('created_at');
      setSavedStories(stories);
      setPage(1);
    } catch (error) {
      console.error('Error loading saved stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your saved stories.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && selectedDifficulty === 'all' && !showFavoritesOnly) {
      loadSavedStories();
      return;
    }

    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedDifficulty !== 'all') {
        filters.difficulty = selectedDifficulty;
      }
      
      if (showFavoritesOnly) {
        filters.isFavorite = true;
      }

      const stories = await PremiumStoryManager.searchStories(searchQuery, filters);
      setSavedStories(stories);
      setPage(1);
    } catch (error) {
      console.error('Error searching stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to search stories.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (storyId: string) => {
    try {
      await PremiumStoryManager.toggleFavorite(storyId);
      setSavedStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, isFavorite: !story.isFavorite }
            : story
        )
      );
      toast({
        title: 'Success',
        description: 'Story favorite status updated.',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await PremiumStoryManager.deleteSavedStory(storyId);
      setSavedStories(prev => prev.filter(story => story.id !== storyId));
      setDeleteDialogOpen(null);
      toast({
        title: 'Success',
        description: 'Story deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete story.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveCurrentStory = async () => {
    if (!currentStory) {
      toast({
        title: 'No Story',
        description: 'No current story to save.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const userInfo = {
        name: 'Premium User',
        age: 8,
        grade: '2nd' as any,
        nativeLanguage: 'en' as any,
        learningGoal: 'improve-english-reading' as any,
        avatar: { type: 'boy' as any, skinTone: 'medium' as any },
        favoriteColor: 'blue',
        favoriteAnimal: 'dog',
        hobbies: 'reading',
        favoriteFood: 'cookies',
        specialRequest: ''
      };

      // CRITICAL FIX: Use pageImages state, not non-existent cachedImages property
      const storyToSave = {
        ...currentStory,
        imageCacheMetadata: {} // Will be updated to use pageImages when prop is available
      };

      await PremiumStoryManager.saveStory(storyToSave, userInfo, ['recent'], false);
      
      toast({
        title: 'Success',
        description: 'Story saved to your library!',
      });
      
      loadSavedStories();
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: 'Error',
        description: 'Failed to save story.',
        variant: 'destructive'
      });
    }
  };

  // Phase 3: Library error recovery helper functions
  const hasPartialImages = (story: SavedStory): boolean => {
    // Check if story has content to potentially generate images for
    const storyArray = Array.isArray(story.content) ? story.content : [];
    return storyArray.length > 0; // Show button for all stories with content
  };

  const handleGenerateMissingImages = async (story: SavedStory) => {
    if (generatingImages[story.id]) return;
    
    setGeneratingImages(prev => ({ ...prev, [story.id]: true }));
    
    try {
      const userInfo = {
        name: 'Premium User',
        age: 8,
        grade: '2nd' as any,
        nativeLanguage: 'en' as any,
        learningGoal: 'improve-english-reading' as any,
        avatar: { type: 'boy' as any, skinTone: 'medium' as any },
        favoriteColor: 'blue',
        favoriteAnimal: 'dog',
        hobbies: 'reading',
        favoriteFood: 'cookies',
        specialRequest: ''
      };

      const existingImages: Record<number, string> = {};
      // For now, assume no existing images since we don't have that data structure
      
      const storyArray = Array.isArray(story.content) ? story.content : [];
      if (!storyArray.length) return;

      const updatedImages = await BatchImageService.generateMissingImages(
        storyArray,
        existingImages,
        userInfo,
        {
          onProgress: (completed, total) => {
            console.log(`Generating images: ${completed}/${total}`);
          }
        }
      );

      console.log('Generated images for library story:', updatedImages);

      toast({
        title: 'Success',
        description: 'Images generated successfully!',
      });

      loadSavedStories();
    } catch (error) {
      console.error('Error generating missing images:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate images.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingImages(prev => ({ ...prev, [story.id]: false }));
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading your story library...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Story Library</h1>
          <p className="text-muted-foreground">Manage and read your saved stories</p>
        </div>
        <div className="flex gap-2">
          {currentStory && (
            <Button onClick={handleSaveCurrentStory} variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Save Current Story
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">Find Your Stories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-end">
            <div className="flex-1">
              <Input
                placeholder="Search stories by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as DifficultyLevel | 'all')}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="w-full lg:w-auto"
            >
              <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </Button>
            <Button onClick={handleSearch} className="w-full lg:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stories Grid */}
      {savedStories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start creating amazing stories to build your personal library!
            </p>
            <Button onClick={onStartNewStory}>
              Create Your First Story
            </Button>
          </CardContent>
        </Card>
) : isDeck ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {savedStories.map((story) => (
                <div key={story.id} className="basis-[88%] md:basis-[70%] shrink-0">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base sm:text-lg line-clamp-2">{story.title}</CardTitle>
                          <CardDescription className="mt-1 text-xs sm:text-sm">
                            {formatDate(story.createdAt)}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(story.id)}
                          aria-label={story.isFavorite ? 'Unfavorite' : 'Favorite'}
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              story.isFavorite 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-muted-foreground hover:text-red-500'
                            }`} 
                          />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={getDifficultyColor(story.difficulty)}>
                            {story.difficulty}
                          </Badge>
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {story.estimatedReadingTime}m
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {story.wordCount} words
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center gap-2">
                      <Button 
                        onClick={() => onLoadStory(story.content)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Read Story
                      </Button>
                      
                      {hasPartialImages(story) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateMissingImages(story)}
                          disabled={generatingImages[story.id]}
                          className="text-xs"
                        >
                          {generatingImages[story.id] ? 'Generating...' : 'Fix Images'}
                        </Button>
                      )}

                      <Dialog open={deleteDialogOpen === story.id} onOpenChange={(open) => setDeleteDialogOpen(open ? story.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Delete story">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Story</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{story.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setDeleteDialogOpen(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDeleteStory(story.id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {(() => {
              const totalPages = Math.max(1, Math.ceil(savedStories.length / pageSize));
              const start = (page - 1) * pageSize;
              const end = start + pageSize;
              const displayedStories = savedStories.slice(start, end);
              return (
                <>
                  {displayedStories.map((story) => (
                    <Card key={story.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg line-clamp-2">{story.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                              {formatDate(story.createdAt)}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(story.id)}
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                story.isFavorite 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-muted-foreground hover:text-red-500'
                              }`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getDifficultyColor(story.difficulty)}>
                              {story.difficulty}
                            </Badge>
                            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {story.estimatedReadingTime}m
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {story.wordCount} words
                            </div>
                          </div>
                          
                          {story.tags.length > 0 && (
                            <div className="hidden sm:flex flex-wrap gap-1">
                              {story.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {story.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{story.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
          
                      <CardFooter className="flex justify-between">
                        <Button 
                          onClick={() => onLoadStory(story.content)}
                          className="flex-1 mr-2"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Read Story
                        </Button>
                        
                        <Dialog open={deleteDialogOpen === story.id} onOpenChange={(open) => setDeleteDialogOpen(open ? story.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Story</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{story.title}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setDeleteDialogOpen(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => handleDeleteStory(story.id)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))}
                  {/* Pagination Controls */}
                  <div className="col-span-full flex items-center justify-center gap-2 mt-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(savedStories.length / pageSize))}</span>
                    <Button variant="outline" size="sm" disabled={page >= Math.ceil(savedStories.length / pageSize)} onClick={() => setPage((p) => Math.min(Math.ceil(savedStories.length / pageSize), p + 1))}>
                      Next
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
      )}
    </div>
  );
};

export default PremiumStoryLibrary;