# Yield GT 🌱

A professional plant management and grow tracking SaaS platform built with modern technology.

## Features

- 🌿 **Grow Management**: Track and manage multiple grows with detailed progress tracking
- 📊 **Plant Monitoring**: Record measurements, photos, and care activities for each plant
- ✅ **Task Management**: Organize growing activities with a powerful task system
- 📱 **Mobile Friendly**: Fully responsive design for managing your grows on the go
- 📈 **Analytics**: Track growth patterns and optimize your growing process (Premium)
- 🤝 **Team Collaboration**: Work together with other growers (Enterprise)

## Subscription Tiers

- **Free**: Basic grow tracking and plant management
- **Premium**: Advanced analytics and batch operations
- **Enterprise**: Team collaboration and priority support

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Supabase (Database & Auth)
- **Hosting**: Vercel
- **Payments**: Stripe
- **Storage**: Supabase Storage

## Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Environment Setup

1. Set up your development environment:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
# Supabase Configuration (Public)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Configuration (Private)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (Public)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Stripe Configuration (Private)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Local Development

1. Start the development server:
```bash
npm run dev
```

2. Start the backend server (in a separate terminal):
```bash
node src/server.js
```

The application will be available at `http://localhost:8080`

### Production Deployment

1. Configure environment variables in Vercel
2. Deploy through Vercel's platform
3. Set up Supabase and Stripe for production

## Documentation

- [API Reference](docs/api-reference.md) - Complete API documentation
- [Maintenance Procedures](docs/maintenance-procedures.md) - System maintenance guide

## Project Structure

```
yield-gt/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utilities and services
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React contexts
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run typecheck` - Run TypeScript checks

## Security

- All sensitive environment variables are stored securely
- Authentication is handled by Supabase
- API endpoints are protected with proper authorization
- File uploads are validated and secured
- Regular security audits are performed

## Support

For customer support, please contact:
- Email: support@yieldgt.com
- Website: https://yieldgt.com/support

## Legal

© 2024 Yield GT. All rights reserved. This is proprietary software.
This codebase and its contents are confidential and protected by intellectual property laws.
Unauthorized copying, modification, distribution, or use of any portion of this software is strictly prohibited.

## Acknowledgments

- [Supabase](https://supabase.io/) for backend services
- [Vercel](https://vercel.com/) for hosting
- [Stripe](https://stripe.com/) for payment processing
- [TailwindCSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
