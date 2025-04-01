import React from 'react';
import { motion } from 'framer-motion';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-4xl"
      >
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are stored on your computer or mobile device when you visit
              our website. They help us make your experience better by remembering your preferences and
              how you use our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authentication and security</li>
              <li>Preferences and settings</li>
              <li>Analytics and performance</li>
              <li>Personalization</li>
              <li>Payment processing (via Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                <p>Required for the website to function properly. These cannot be disabled.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                <p>Remember your preferences and settings.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                <p>Help us understand how visitors use our website.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Marketing Cookies</h3>
                <p>Used to track visitors across websites to display relevant advertisements.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              Some cookies are placed by third-party services that appear on our pages:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe (payment processing)</li>
              <li>Google Analytics (website analytics)</li>
              <li>Intercom (customer support)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Managing Cookies</h2>
            <p className="mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies that are
              already on your computer and you can set most browsers to prevent them from being placed.
              However, if you do this, you may have to manually adjust some preferences every time you
              visit a site and some services and functionalities may not work.
            </p>
            <p className="mb-4">
              To manage cookies in your browser:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
              <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Cookies and website data</li>
              <li>Edge: Settings → Cookies and site permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Updates to This Policy</h2>
            <p className="mb-4">
              We may update this Cookie Policy from time to time. We will notify you of any changes by
              posting the new Cookie Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="mb-4">
              If you have questions about our Cookie Policy, please contact us at:{' '}
              <a href="mailto:privacy@growmanager.com" className="text-primary hover:underline">
                privacy@growmanager.com
              </a>
            </p>
            <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
} 