import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowDown,
  Bell,
  BarChart,
  Smartphone,
  Calendar,
  Droplets,
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    title: "Smart Feeding Scheduler",
    description: "Automated nutrient tracking and feeding reminders based on your plant's growth stage. Get precise measurements and custom feeding schedules for optimal growth.",
    icon: Droplets,
    highlights: ["Custom feeding schedules", "Nutrient ratio calculator", "pH tracking", "EC/PPM monitoring"]
  },
  {
    title: "Growth Analytics",
    description: "Comprehensive growth tracking with visual timelines and data-driven insights. Monitor plant health, identify trends, and optimize your growing conditions.",
    icon: LineChart,
    highlights: ["Visual growth charts", "Environmental data logs", "Yield predictions", "Performance metrics"]
  },
  {
    title: "Smart Notifications",
    description: "Never miss critical tasks with intelligent alerts. Get notified about feeding times, environmental changes, and maintenance tasks right when they matter.",
    icon: Bell,
    highlights: ["Custom alert thresholds", "Priority notifications", "Task reminders", "Environmental warnings"]
  },
  {
    title: "Mobile Optimization",
    description: "Full-featured mobile experience for managing your grows on the go. Track, update, and monitor your plants from anywhere with real-time synchronization.",
    icon: Smartphone,
    highlights: ["Real-time updates", "Offline capability", "Photo documentation", "Quick actions"]
  },
  {
    title: "Environmental Control",
    description: "Monitor and optimize your growing environment with detailed tracking of temperature, humidity, light cycles, and air quality.",
    icon: BarChart,
    highlights: ["Climate tracking", "Light cycle automation", "VPD calculations", "Historical trends"]
  },
  {
    title: "Task Management",
    description: "Streamlined task management system for organizing all your growing activities. Keep track of maintenance, feeding, and care routines.",
    icon: Calendar,
    highlights: ["Task scheduling", "Recurring tasks", "Progress tracking", "Team coordination"]
  }
];

const plans = [
  {
    name: "Free",
    description: "Perfect for hobbyist growers",
    features: ["3 plants", "Basic tracking"],
    price: "0"
  },
  {
    name: "Grower",
    description: "Most Popular for enthusiasts",
    features: ["6 plants", "Analytics"],
    price: "9",
    popular: true
  },
  {
    name: "Pro Cultivator",
    description: "For serious growers",
    features: ["12+ plants", "AI features"],
    price: "19"
  }
];

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

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
    <div className="relative bg-[#0A0F1C]">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-30 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-white text-xl font-bold">YIELD GT</div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-[#2563EB]/20">
              <Link to="/login">Login</Link>
            </Button>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src="/assets/background.png" 
            alt="Night garden background" 
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1C] opacity-100"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 80%, #0A0F1C 100%)' }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 min-h-screen">
          <div className="flex flex-col md:flex-row items-center justify-center relative h-full pt-20 pb-32">
            {/* Left Side - Icons and Mascot */}
            <div className="relative hidden md:block w-1/2 h-[600px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="seed-character-container absolute top-[10px] left-[-100px] z-50"
              >
                <img 
                  src="/assets/seed-character.png" 
                  alt="Growly Mascot" 
                  className="seed-character-image w-[600px] h-auto"
                />
              </motion.div>
            </div>

            {/* Right Side - Text and CTA */}
            <div className="relative w-full md:w-1/2 text-white md:pl-8 text-center md:text-left px-4 md:px-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Grow Smarter, Not Harder</h1>
                <p className="text-lg md:text-xl mb-8 text-gray-300">Track your plants' growth, automate feeding schedules, and monitor environmental conditions all in one place.</p>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center md:justify-start">
                  <Button size="lg" className="w-full md:w-auto bg-[#2563EB] hover:bg-[#1D4ED8]">
                    <Link to="/signup">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full md:w-auto border-white text-white hover:bg-white/10">
                    <a href="#features">Learn More</a>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-[269px] top-[-200px] z-10 hidden md:block"
              >
                <img 
                  src="/assets/chart.png" 
                  alt="Chart" 
                  className="analytics-chart-image w-[300px] h-auto"
                />
              </motion.div>
            </div>

            {/* Mobile Seed Character */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:hidden w-64 mx-auto mt-12 mb-16"
            >
              <img 
                src="assets/seed-character-2.png" 
                alt="Growly Mascot" 
                className="w-full h-auto"
              />
            </motion.div>
          </div>

          {/* Sprout Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-20 right-20 z-50 hidden md:block"
          >
            <img 
              src="/assets/sprout.png" 
              alt="Sprout Icon" 
              className="w-32 h-32"
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          >
            <ArrowDown className="w-8 h-8" />
          </motion.div>
        )}
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0A0F1C] relative z-20 mt-[-1px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Feature Breakdown</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Advanced tools and features designed to optimize your growing experience and maximize results.</p>
          </div>
          
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1A1F2E] p-6 rounded-xl border border-gray-800 flex flex-col h-full"
              >
                <div className="flex items-start mb-4">
                  <feature.icon className="w-8 h-8 text-[#2563EB] mt-1" />
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="border-t border-gray-800 pt-4">
                    <ul className="grid grid-cols-2 gap-2">
                      {feature.highlights.map((highlight, i) => (
                        <li key={i} className="text-gray-400 text-sm flex items-center">
                          <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full mr-2"></span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0A0F1C] relative z-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-400">Select the perfect plan for your growing needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-[#1A1F2E] p-8 rounded-xl border ${
                  plan.popular ? 'border-[#2563EB]' : 'border-gray-800'
                } relative`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#2563EB]">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="text-3xl font-bold text-white mb-6">
                  ${plan.price}
                  <span className="text-lg text-gray-400">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <span className="mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.popular ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <Link to={`/signup?plan=${plan.name.toLowerCase()}`}>Choose {plan.name}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1F2E] py-12 border-t border-gray-800 relative z-20">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="text-2xl font-bold text-white">YIELD GT</div>
              <p className="text-sm text-gray-400">
                Empowering growers with smart technology for better results.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com/yieldgt" className="text-gray-400 hover:text-white">
                  Twitter
                </a>
                <a href="https://linkedin.com/company/yieldgt" className="text-gray-400 hover:text-white">
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Navigation</h3>
              <div className="flex flex-col space-y-2">
                <Link to="/login" className="text-gray-400 hover:text-white">Login</Link>
                <Link to="/signup" className="text-gray-400 hover:text-white">Sign Up</Link>
                <a href="#features" className="text-gray-400 hover:text-white">Features</a>
                <a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Legal</h3>
              <div className="flex flex-col space-y-2">
                <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link>
                <Link to="/disclaimer" className="text-gray-400 hover:text-white">Disclaimers</Link>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Support</h3>
              <div className="flex flex-col space-y-2">
                <a href="mailto:support@yieldgt.com" className="text-gray-400 hover:text-white">Contact Us</a>
                <Link to="/tax-info" className="text-gray-400 hover:text-white">Tax Information</Link>
              </div>
            </div>
          </div>

          {/* Legal Disclaimers and Tax Info */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Disclaimers */}
              <div className="text-xs text-gray-500">
                <p className="mb-2">
                  Disclaimer: YIELD GT is a plant management tool. Users are responsible for complying with all applicable laws and regulations in their jurisdiction. We do not promote or endorse any illegal activities.
                </p>
                <p className="mb-2">
                  Tax Notice: Prices shown exclude applicable taxes. Sales tax will be calculated and added at checkout based on your location and local tax regulations.
                </p>
                <p>
                  Payment Processing: Secure payments processed by Stripe. Your financial information is never stored on our servers.
                </p>
              </div>

              {/* Certifications and Compliance */}
              <div className="text-xs text-gray-500">
                <p className="mb-2">
                  YIELD GT complies with GDPR, CCPA, and applicable data protection regulations. We use industry-standard security measures to protect your data.
                </p>
                <p>
                  © {new Date().getFullYear()} YIELD GT. All rights reserved. YIELD GT is a registered trademark.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 