const express = require('express');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {google} = require('googleapis');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('SaaS Training Backend'));

// More routes and webhook handlers to be added

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
