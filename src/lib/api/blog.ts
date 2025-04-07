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
        blog_posts_tags(
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
        blog_posts_tags(
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

  async updatePostCoverImage(slug: string, coverImage: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .update({ cover_image: coverImage })
      .eq('slug', slug);

    if (error) throw error;
  }

  async updateBlogImages(): Promise<void> {
    const updates = [
      {
        slug: 'minimalist-grow-setup-that-still-slaps',
        coverImage: 'https://i.postimg.cc/Pr9hp2Kd/minimal-grow.png'
      },
      {
        slug: 'advanced-plant-training-techniques',
        coverImage: 'https://i.postimg.cc/HL8r8Qkq/sustainability.png'
      },
      {
        slug: 'sustainable-growing-practices',
        coverImage: 'https://i.postimg.cc/Fs5DW8FY/recycle-leaf.png'
      },
      {
        slug: 'mastering-hydroponic-systems',
        coverImage: 'https://i.postimg.cc/RCjDrqdV/20250405-0101-Plant-Roots-Close-Up-remix-01jr256vksf5rrmn7wtv6nx3tw.png'
      },
      {
        slug: 'getting-started-with-plant-management',
        coverImage: 'https://i.postimg.cc/m2YV0jh8/20250405-0128-Hemp-Management-Guide-remix-01jr26r000fdrssqj4j2kpaffs.png'
      }
    ];

    for (const update of updates) {
      await this.updatePostCoverImage(update.slug, update.coverImage);
    }
  }
} 