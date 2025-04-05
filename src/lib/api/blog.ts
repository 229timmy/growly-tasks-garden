import { APIClient } from './client';
import type { BlogPost, BlogCategory, BlogTag } from '@/types/blog';
import { supabase } from '@/lib/supabase';

export class BlogService extends APIClient {
  async listPosts(options?: {
    category?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }): Promise<BlogPost[]> {
    const query = supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id(id, name, avatar, bio),
        category:category_id(id, name, slug),
        blog_posts_tags!inner(
          tag:tag_id(id, name, slug)
        )
      `)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (options?.category) {
      query.eq('category.slug', options.category);
    }

    if (options?.tag) {
      query.contains('tags', [options.tag]);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform the data to match the BlogPost interface
    return (data || []).map(post => ({
      ...post,
      coverImage: post.cover_image,
      tags: post.blog_posts_tags.map((pt: any) => pt.tag)
    }));
  }

  async getPost(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id(id, name, avatar, bio),
        category:category_id(id, name, slug),
        blog_posts_tags!inner(
          tag:tag_id(id, name, slug)
        )
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      ...data,
      coverImage: data.cover_image,
      tags: data.blog_posts_tags.map((pt: any) => pt.tag)
    };
  }

  async listCategories(): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async listTags(): Promise<BlogTag[]> {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getRelatedPosts(postId: string, limit = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id(id, name, avatar, bio),
        category:category_id(id, name, slug),
        blog_posts_tags!inner(
          tag:tag_id(id, name, slug)
        )
      `)
      .neq('id', postId)
      .eq('published', true)
      .limit(limit);

    if (error) throw error;

    return (data || []).map(post => ({
      ...post,
      coverImage: post.cover_image,
      tags: post.blog_posts_tags.map((pt: any) => pt.tag)
    }));
  }
} 