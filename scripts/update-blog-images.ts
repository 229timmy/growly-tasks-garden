import { BlogService } from '../src/lib/api/blog';

async function main() {
  try {
    const blogService = new BlogService();
    await blogService.updateBlogImages();
    console.log('Successfully updated blog post cover images');
  } catch (error) {
    console.error('Error updating blog post cover images:', error);
    process.exit(1);
  }
}

main(); 