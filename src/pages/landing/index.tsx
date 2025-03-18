import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowDown, 
  Leaf, 
  Cloud, 
  Sun, 
  Droplets, 
  Check, 
  X, 
  BarChart, 
  Bell, 
  Zap, 
  Users, 
  Code, 
  HeartHandshake,
  Github,
  Twitter,
  Instagram,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  // Hide scroll indicator when scrolling starts
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-background">
      {/* Hero Section with Parallax */}
      <div className="h-screen relative overflow-hidden flex items-center justify-center">
        {/* Background Image with Gradient Fade */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-no-repeat bg-cover bg-center"
            style={{ 
              backgroundImage: 'url("/hero.jpg")',
            }}
          />
          {/* Gradient overlay to fade the bottom of the image and improve text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        
        {/* Background Elements with Parallax */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <Cloud className="w-32 h-32 text-primary/40" />
          </div>
          <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
            <Sun className="w-24 h-24 text-primary/50" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2">
            <Droplets className="w-20 h-20 text-primary/45" />
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ y: y2, scale }}
          className="relative z-20 text-center space-y-6 max-w-4xl mx-auto px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="px-4 py-1 text-sm mb-6 bg-background/80 text-foreground border-primary">
              <span className="mr-1 bg-green-500 rounded-full w-2 h-2 inline-block"></span> 
              Now with advanced analytics
            </Badge>
            
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-500 leading-tight">
              Grow Manager
            </h1>
            <p className="text-xl mt-4 text-foreground max-w-2xl mx-auto font-medium drop-shadow-sm bg-background/30 p-2 rounded-lg">
              Your intelligent companion for plant growth management. Track, analyze, and optimize your growing operation with ease.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Button asChild size="lg" className="text-lg px-8 rounded-full font-medium">
              <Link to="/signup">Start for free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 rounded-full bg-background/80 text-foreground font-medium border-primary">
              <Link to="/login">Log in</Link>
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-12"
          >
            <div className="relative mx-auto w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden">
              <video 
                src="/dashboard.mp4" 
                className="w-full h-auto object-contain rounded-xl"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                preload="auto"
                style={{ 
                  maxHeight: "600px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                onError={(e) => {
                  // Fallback to image if video fails to load
                  const target = e.currentTarget;
                  const img = document.createElement('img');
                  img.src = "https://placehold.co/1200x800/1a1a1a/31c48d?text=Dashboard+Preview";
                  img.className = "w-full h-auto object-cover rounded-xl";
                  img.alt = "Dashboard Preview";
                  if (target.parentNode) {
                    target.parentNode.replaceChild(img, target);
                  }
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-primary"
          >
            <ArrowDown className="w-8 h-8" />
          </motion.div>
        )}
      </div>

      {/* Features Section */}
      <motion.section
        style={{ y: y3 }}
        className="py-24 bg-gradient-to-b from-background to-primary/5 relative z-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">
              Grow Smarter, Not Harder
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need to manage your plants efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Choose Your Growth Plan
            </h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Flexible plans designed to meet your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card p-8 rounded-xl border ${tier.featured ? 'border-primary shadow-lg relative' : 'border-border shadow-md'}`}
              >
                {tier.featured && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-primary text-white font-medium">Most Popular</Badge>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 text-foreground">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">${tier.price}</span>
                  {tier.price > 0 && <span className="text-foreground/80">/month</span>}
                </div>
                <p className="text-foreground/90 mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full font-medium ${tier.featured ? '' : 'bg-muted-foreground/10 text-foreground hover:bg-muted-foreground/20'}`}
                  variant={tier.featured ? "default" : "outline"}
                  asChild
                >
                  <Link to={tier.price === 0 ? "/signup" : "/signup?plan=" + tier.name.toLowerCase()}>
                    {tier.price === 0 ? "Get Started" : "Choose Plan"}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Start Growing?</h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Join thousands of growers who are already optimizing their plants with Grow Manager
            </p>
            <Button asChild size="lg" className="text-lg px-8 rounded-full font-medium mt-8">
              <Link to="/signup">Start Your Free Trial</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Grow Manager</h3>
              <p className="text-foreground/90 mb-4">
                Your intelligent companion for plant growth management.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-foreground/80 hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-foreground/80 hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-foreground/80 hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-foreground/90 hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-foreground/90 hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/roadmap" className="text-foreground/90 hover:text-primary transition-colors">Roadmap</Link></li>
                <li><Link to="/changelog" className="text-foreground/90 hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-foreground/90 hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/guides" className="text-foreground/90 hover:text-primary transition-colors">Guides</Link></li>
                <li><Link to="/api" className="text-foreground/90 hover:text-primary transition-colors">API</Link></li>
                <li><Link to="/community" className="text-foreground/90 hover:text-primary transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-foreground/90 hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/blog" className="text-foreground/90 hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-foreground/90 hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-foreground/90 hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground/80">
              © {new Date().getFullYear()} Grow Manager. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Smart Tracking',
    description: "Monitor your plants' growth with intelligent tracking and analytics.",
    icon: Leaf,
  },
  {
    title: 'Environmental Control',
    description: 'Maintain optimal growing conditions with environmental monitoring.',
    icon: Sun,
  },
  {
    title: 'Task Management',
    description: 'Stay organized with automated task scheduling and reminders.',
    icon: Droplets,
  },
  {
    title: 'Advanced Analytics',
    description: 'Gain insights from comprehensive data analysis and visualization.',
    icon: BarChart,
  },
  {
    title: 'Smart Alerts',
    description: 'Receive timely notifications about important events and changes.',
    icon: Bell,
  },
  {
    title: 'Performance Optimization',
    description: 'Optimize your growing conditions based on data-driven recommendations.',
    icon: Zap,
  },
];

const pricingTiers = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for hobbyists and beginners',
    features: [
      '3 active grows',
      'Basic tracking',
      'Limited task management',
      'Standard measurements',
    ],
    featured: false
  },
  {
    name: 'Pro',
    price: 9,
    description: 'For serious home growers',
    features: [
      '6 grows',
      'Advanced tracking',
      'Full task management',
      'Batch measurements',
      'Batch care activities',
      'Basic analytics',
    ],
    featured: true
  },
  {
    name: 'Master',
    price: 19,
    description: 'For dedicated enthusiasts',
    features: [
      '10 grows',
      'Advanced analytics',
      'Environmental alerts',
      'Priority support',
      'All premium features',
    ],
    featured: false
  },
  {
    name: 'Commercial',
    price: 39,
    description: 'For professional operations',
    features: [
      'Unlimited grows',
      'Custom features',
      'White labeling',
      'API access',
      'Dedicated support',
    ],
    featured: false
  }
]; 