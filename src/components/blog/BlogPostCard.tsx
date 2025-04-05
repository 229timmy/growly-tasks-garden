import React from 'react';
import { Link } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';
import { Clock, User, Image as ImageIcon } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
  className?: string;
  compact?: boolean;
}

export function BlogPostCard({ post, className, compact = false }: BlogPostCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
  };

  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "bg-background border-border/40 hover:border-border/80",
        className
      )}
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <div className="relative h-48 bg-muted overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/50">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          {post.category && (
            <Badge 
              variant="secondary" 
              className="absolute top-4 left-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {post.category.name}
            </Badge>
          )}
        </div>
        <CardHeader className={cn(
          "relative z-10",
          compact ? "p-4" : "p-6",
          "group-hover:bg-muted/30 transition-colors duration-300"
        )}>
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags?.slice(0, 2).map(tag => (
              <Badge key={tag.id} variant="outline" className="hover:bg-muted">
                {tag.name}
              </Badge>
            ))}
          </div>
          <CardTitle className={cn(
            "line-clamp-2 group-hover:text-primary transition-colors duration-300",
            compact ? "text-lg" : "text-2xl"
          )}>
            {post.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </span>
          </CardDescription>
        </CardHeader>
        {!compact && (
          <CardContent className="group-hover:bg-muted/30 transition-colors duration-300">
            <p className="text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          </CardContent>
        )}
      </Link>
    </Card>
  );
} 