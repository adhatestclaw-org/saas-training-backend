require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');

// Routers
const formationsRouter = require('./routes/formations');
// Stripe and checkout routers will be conditionally loaded based on configuration


// Connect to MongoDB
mongoose.connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

// Body parsing
app.use(express.json());

// Authentication routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);


// Healthcheck endpoint for API
app.get('/api/health', (req, res) => res.send('OK'));

// Checkout session creation (requires authentication) - only if Stripe configured
if (config.stripeSecretKey && config.stripeWebhookSecret) {
  const checkoutRouter = require('./routes/checkout');
  app.use('/create-checkout-session', express.json(), require('./middleware/auth'), checkoutRouter);
} else {
  console.warn('Skipping Stripe checkout route: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
}

// Formations API (requires authentication)
app.use('/formations', express.json(), require('./middleware/auth'), formationsRouter);

// Admin user management
app.use('/api/admin/users', require('./routes/adminUsers'));

// PayPal integration - only if credentials provided
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  app.use('/api/paypal', require('./routes/paypal'));
} else {
  console.warn('Skipping PayPal routes: missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET');
}

// Stripe webhook endpoint - only if Stripe configured
if (config.stripeSecretKey && config.stripeWebhookSecret) {
  const stripeWebhookRouter = require('./routes/stripeWebhook');
  app.use('/webhooks/stripe', stripeWebhookRouter);
} else {
  console.warn('Skipping Stripe webhook route: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
}

// Serve Frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
// Fallback to index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
