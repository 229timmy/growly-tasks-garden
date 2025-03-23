import type { VercelRequest, VercelResponse } from '@vercel/node';
import { POST as stripeWebhookHandler } from '../../src/api/stripe-webhook';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  // Pass the request to our existing handler
  return stripeWebhookHandler(req, res);
}

// Tell Vercel to handle the request body as raw data
export const config = {
  api: {
    bodyParser: false,
  },
}; 