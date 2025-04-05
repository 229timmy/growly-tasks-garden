import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { SEO } from '@/components/SEO';
import { BlogService } from '@/lib/api/blog';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogService = new BlogService();

export default function BlogPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => blogService.listPosts(),
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Yield GT Blog",
    "description": "Expert insights, tips, and strategies for optimizing your growing operations.",
    "url": "https://yieldgt.com/blog",
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
        title="Blog - Yield GT"
        description="Expert insights, tips, and strategies for optimizing your growing operations."
        schema={schema}
      />
      <div className="min-h-screen bg-muted/30">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-muted/30">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.34] pt-24">
            <img
              src="/assets/yield-depth-logo.png"
              alt="Yield GT Logo"
              className="w-[370px] object-contain"
            />
          </div>
          <div className="container relative py-20">
            <div className="text-left mb-12">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Growing Knowledge
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Dive into expert insights, practical tips, and proven strategies to optimize 
                your growing operations. Stay informed with the latest trends and best practices 
                from experienced growers.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section with lighter background */}
        <div className="bg-background/60 py-12">
          <div className="container">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !posts?.length ? (
              <div className="text-center py-16 bg-background rounded-lg border">
                <p className="text-muted-foreground">No blog posts found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 