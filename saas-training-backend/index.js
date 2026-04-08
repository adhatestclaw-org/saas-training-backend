require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');

// Routers
const formationsRouter = require('./routes/formations');
const stripeWebhookRouter = require('./routes/stripeWebhook');
const checkoutRouter = require('./routes/checkout');

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


// Healthcheck
app.get('/', (req, res) => res.send('SaaS Training Backend'));

// Checkout session creation (requires authentication)
app.use('/create-checkout-session', express.json(), require('./middleware/auth'), checkoutRouter);

// Formations API (requires authentication)
app.use('/formations', express.json(), require('./middleware/auth'), formationsRouter);

// Admin user management
app.use('/api/admin/users', require('./routes/adminUsers'));

// PayPal integration
app.use('/api/paypal', require('./routes/paypal'));

// Stripe webhook endpoint uses raw body
app.use('/webhooks/stripe', stripeWebhookRouter);

// Serve Frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
