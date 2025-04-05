-- Reset blog data
TRUNCATE blog_posts_tags CASCADE;
TRUNCATE blog_posts CASCADE;
TRUNCATE blog_authors CASCADE;
TRUNCATE blog_categories CASCADE;
TRUNCATE blog_tags CASCADE;

/* First make sure we have the cover_image column */
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'cover_image'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN cover_image TEXT;
    END IF;
END $$;

-- Insert authors
INSERT INTO blog_authors (id, name, bio)
VALUES 
  ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'William Alexander', 'Plant cultivation expert with over 10 years of experience in both commercial and personal growing operations. Specializes in sustainable growing practices and plant optimization techniques.'),
  ('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Brandon Williams', 'Hydroponic specialist and indoor growing expert with a background in agricultural engineering. Passionate about teaching efficient growing methods and maximizing yields.'),
  ('12eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Dawn Terris', 'Environmental scientist and organic growing advocate. Focuses on sustainable practices and natural pest management techniques. Author of several books on organic cultivation.'),
  ('13eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Kat Chambers', 'Master gardener specializing in rare plant varieties and experimental growing techniques. Known for innovative approaches to plant breeding and optimization.');

-- Insert categories
INSERT INTO blog_categories (id, name, slug, description)
VALUES 
  ('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Growing Tips', 'growing-tips', 'Expert advice for better plant growth'),
  ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Plant Care', 'plant-care', 'Best practices for plant maintenance'),
  ('21eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Advanced Techniques', 'advanced-techniques', 'Advanced growing methods and strategies'),
  ('22eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Sustainability', 'sustainability', 'Sustainable and eco-friendly growing practices');

-- Insert tags
INSERT INTO blog_tags (id, name, slug)
VALUES 
  ('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Beginners', 'beginners'),
  ('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Advanced', 'advanced'),
  ('60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tips & Tricks', 'tips-tricks'),
  ('61eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hydroponics', 'hydroponics'),
  ('62eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Organic', 'organic'),
  ('63eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Innovation', 'innovation'),
  ('64eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Sustainability', 'sustainability');

-- Insert blog posts
INSERT INTO blog_posts (id, title, slug, excerpt, content, author_id, category_id, published, published_at, reading_time, cover_image)
VALUES 
  -- John Smith's post
  ('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Getting Started with Plant Management: A Comprehensive Guide',
   'getting-started-with-plant-management',
   'Master the fundamentals of effective plant management with our comprehensive guide. Learn essential techniques, best practices, and proven strategies to ensure your plants thrive.',
   E'Plant management is both an art and a science. Whether you''re a hobbyist or planning to scale up your growing operation, understanding the fundamentals is crucial for success. This comprehensive guide will walk you through everything you need to know to get started.

## Understanding Plant Basics

### Plant Life Cycles
Every plant goes through distinct growth stages:
- **Germination**: The awakening of dormant seeds
- **Seedling**: Early growth and development
- **Vegetative**: Primary growth and leaf development
- **Flowering**: Reproductive stage
- **Fruiting**: Seed and fruit production
- **Senescence**: Natural aging process',
   '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   true,
   (NOW() AT TIME ZONE 'UTC')::timestamp - interval '3 days',
   15,
   'https://i.postimg.cc/L8bqsy2k/plant-management.png'),

  -- Brandon Williams' post
  ('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
   'Mastering Hydroponic Systems: A Deep Dive into Soilless Growing',
   'mastering-hydroponic-systems',
   'Explore the world of hydroponic growing with our comprehensive guide. Learn about different systems, nutrient management, and how to maximize yields in soilless environments.',
   E'Hydroponic growing represents the cutting edge of modern cultivation technology. By removing soil from the equation, we can achieve unprecedented control over our plants'' growing conditions and potentially realize extraordinary yields. This guide will walk you through everything you need to know about hydroponic growing.

## Understanding Hydroponic Systems

### Types of Hydroponic Systems
There are several main types of hydroponic systems, each with its own advantages:
- **Deep Water Culture (DWC)**: Plants suspended in nutrient solution
- **Nutrient Film Technique (NFT)**: Continuous flow of nutrients
- **Ebb and Flow**: Periodic flooding with nutrients
- **Drip Systems**: Targeted nutrient delivery
- **Aeroponics**: Nutrient misting systems
- **Wick Systems**: Passive nutrient delivery',
   '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
   '21eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
   true,
   (NOW() AT TIME ZONE 'UTC')::timestamp - interval '2 days',
   20,
   'https://i.postimg.cc/vHXgJYKN/hydroponics.png'),

  -- Dawn Terris' post
  ('72eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
   'Sustainable Growing Practices: Building an Eco-Friendly Garden',
   'sustainable-growing-practices',
   'Learn how to create and maintain an environmentally conscious growing operation. Discover natural pest control methods, water conservation techniques, and sustainable nutrient management.',
   E'Creating a sustainable growing operation isn''t just good for the environment - it''s also a smart long-term strategy for any serious grower. This guide explores how to build and maintain an eco-friendly garden that produces excellent results while minimizing environmental impact.

## Foundations of Sustainable Growing

### Core Principles
Building a sustainable operation requires:
- **Resource Conservation**: Minimizing waste and maximizing efficiency
- **Ecological Balance**: Working with nature, not against it
- **Long-term Viability**: Creating systems that improve over time
- **Closed-loop Systems**: Recycling and reusing whenever possible
- **Biodiversity**: Encouraging healthy ecosystem development',
   '12eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
   '22eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
   true,
   (NOW() AT TIME ZONE 'UTC')::timestamp - interval '1 day',
   18,
   'https://i.postimg.cc/HL8r8Qkq/sustainability.png'),

  -- Kat Chambers' post
  ('73eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
   'Advanced Plant Training Techniques: Maximizing Your Garden''s Potential',
   'advanced-plant-training-techniques',
   'Discover cutting-edge methods for training and manipulating plant growth. Learn advanced techniques to increase yields and optimize space usage in any growing environment.',
   E'Plant training is an art form that combines scientific understanding with hands-on technique. By mastering advanced training methods, you can dramatically improve yields, optimize space usage, and create more efficient growing operations. This guide explores cutting-edge techniques for maximizing your plants'' potential.

## Understanding Plant Growth

### Growth Mechanics
Key concepts in plant training:
- **Apical Dominance**: Controlling vertical growth
- **Auxin Distribution**: Hormonal responses
- **Phototropism**: Light-seeking behavior
- **Thigmomorphogenesis**: Response to physical stress
- **Recovery Processes**: Healing and adaptation',
   '13eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
   '21eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
   true,
   NOW() AT TIME ZONE 'UTC',
   25,
   'https://i.postimg.cc/JznDMwV4/lst.png');

-- Link posts with tags
INSERT INTO blog_posts_tags (post_id, tag_id)
VALUES 
  -- John Smith's post tags
  ('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  
  -- Brandon Williams' post tags
  ('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '61eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '63eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  
  -- Dawn Terris' post tags
  ('72eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '62eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
  ('72eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '64eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
  ('72eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  
  -- Kat Chambers' post tags
  ('73eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('73eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '63eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
  ('73eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '60eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Update author name
UPDATE blog_authors 
SET name = 'William Alexander'
WHERE id = '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Verify the blog_posts_tags table exists and has the correct connections
SELECT * FROM blog_posts_tags; 