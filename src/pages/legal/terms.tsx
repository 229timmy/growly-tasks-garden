import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-4xl"
      >
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using Grow Manager, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use License</h2>
            <p className="mb-4">
              We grant you a limited, non-exclusive, non-transferable, and revocable license to use Grow Manager
              for personal or business use, subject to these Terms and your subscription plan.
            </p>
            <p className="mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your use complies with all applicable laws</li>
              <li>Maintaining accurate and up-to-date account information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Subscription and Payments</h2>
            <p className="mb-4">
              Certain features of Grow Manager require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay all applicable fees for your chosen subscription plan</li>
              <li>Provide accurate billing information</li>
              <li>Authorize us to charge your payment method</li>
              <li>Accept our refund and cancellation policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Responsibilities</h2>
            <p className="mb-4">As a user of Grow Manager, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal purposes</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon others' intellectual property rights</li>
              <li>Share account access with unauthorized users</li>
              <li>Attempt to circumvent any service limitations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Content and Data</h2>
            <p className="mb-4">
              You retain all rights to the content and data you input into Grow Manager. However, you grant us
              a license to use this data to provide and improve our services. We may anonymize and aggregate
              data for analytical purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Disclaimers</h2>
            <p className="mb-4">
              Grow Manager is provided "as is" without any warranties. We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The service will be error-free or uninterrupted</li>
              <li>Any specific results will be achieved using our service</li>
              <li>The service will meet all user requirements</li>
            </ul>
            <p className="mt-4">
              Users are responsible for complying with all applicable laws and regulations regarding plant cultivation
              in their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, Grow Manager and its affiliates shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from your use of
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material
              changes via email or through the service. Continued use of the service after such modifications
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:legal@growmanager.com" className="text-primary hover:underline">
                legal@growmanager.com
              </a>
            </p>
            <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
} 