import React, { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isValid } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogService } from '@/lib/api/blog';
import { SEO } from '@/components/SEO';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User, Clock } from 'lucide-react';

const blogService = new BlogService();

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No date';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getPost(slug!),
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.id],
    queryFn: () => blogService.getRelatedPosts(post!.id),
    enabled: !!post?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/blog')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage,
    "datePublished": post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Yield GT",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yieldgt.com/logo.png"
      }
    }
  };

  return (
    <>
      <SEO 
        title={`${post.title} - Yield GT Blog`}
        description={post.excerpt}
        type="article"
        publishedAt={post.publishedAt}
        image={post.coverImage}
        schema={schema}
      />
      
      <div className="min-h-screen bg-muted/30">
        {/* Header Section */}
        <div className="container py-12">
          <Button 
            variant="outline" 
            size="lg"
            className="mb-8 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Button>

          {post.coverImage && (
            <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Content Section with lighter background */}
        <div className="bg-background/60 py-12">
          <article className="container">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.category && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {post.category.name}
                  </Badge>
                )}
                {post.tags?.map(tag => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-8">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(post.publishedAt)}
                </span>
                {post.readingTime && (
                  <span>{post.readingTime} min read</span>
                )}
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, children, ...props }) => {
                      if (Array.isArray(children) && children.length > 0) {
                        const content = children[0];
                        if (typeof content === 'string' && content === post.title) {
                          return null;
                        }
                      }
                      return <h1 {...props}>{children}</h1>;
                    }
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {relatedPosts?.length ? (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatedPosts.map((relatedPost) => (
                      <BlogPostCard 
                        key={relatedPost.id} 
                        post={relatedPost}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </div>
    </>
  );
} 