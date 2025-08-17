import React from 'react';
import { Home, BookOpen, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

interface StorySessionBreadcrumbProps {
  storyTitle?: string;
  currentPage?: number;
  totalPages?: number;
  onNavigateHome?: () => void;
  className?: string;
  variant?: 'default' | 'minimal';
}

/**
 * Context-aware breadcrumb for story sessions
 * Shows navigation path: Home → Story Title → Page Progress
 */
export const StorySessionBreadcrumb: React.FC<StorySessionBreadcrumbProps> = ({
  storyTitle,
  currentPage,
  totalPages,
  onNavigateHome,
  className,
  variant = 'default'
}) => {
  const { t } = useTranslation();

  // Truncate story title for mobile display
  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  const isMinimal = variant === 'minimal';

  return (
    <Breadcrumb className={cn("hidden sm:block", className)}>
      <BreadcrumbList className="text-xs sm:text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={onNavigateHome}
            className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigateHome?.();
              }
            }}
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4" />
            {!isMinimal && <span className="hidden md:inline">{t('navigation.home', 'Home')}</span>}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {storyTitle && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="max-w-[120px] sm:max-w-[200px] truncate">
                  {isMinimal ? truncateTitle(storyTitle, 20) : truncateTitle(storyTitle)}
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {currentPage && totalPages && totalPages > 1 && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs sm:text-sm font-medium">
                  {t('navigation.pageProgress', 'Page {{current}} of {{total}}', {
                    current: currentPage,
                    total: totalPages
                  })}
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default StorySessionBreadcrumb;