import React from 'react';
import { motion } from 'framer-motion';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-4xl"
      >
        <h1 className="text-4xl font-bold mb-8">Legal Disclaimers</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">General Disclaimer</h2>
            <p className="mb-4">
              Grow Manager is a plant management software tool designed to help users track and manage their plant growth. 
              The information and tools provided are for general informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Professional Advice</h2>
            <p className="mb-4">
              The content available through Grow Manager does not constitute professional, legal, or regulatory advice. 
              Users should consult with appropriate professionals for specific advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibility</h2>
            <p className="mb-4">
              Users are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Complying with all applicable laws and regulations in their jurisdiction</li>
              <li>Ensuring their use of the service is legal in their location</li>
              <li>The accuracy and legality of their data and activities</li>
              <li>Maintaining appropriate licenses and permits if required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="mb-4">
              Grow Manager and its affiliates shall not be liable for any damages arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use or inability to use the service</li>
              <li>Any outcomes or results from using the service</li>
              <li>Decisions made based on information provided by the service</li>
              <li>Technical issues or service interruptions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
            <p className="mb-4">
              We are not responsible for any third-party services, websites, or content linked to or integrated with our service. 
              Use of third-party services is subject to their respective terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Disclaimers</h2>
            <p className="mb-4">
              We reserve the right to modify these disclaimers at any time. Changes will be effective immediately upon posting 
              to the website. Your continued use of the service constitutes acceptance of any modifications.
            </p>
            <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
} 