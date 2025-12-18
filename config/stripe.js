// config/stripe.js
const Stripe = require("stripe");
const dotenv = require("dotenv");

// Load environment variables from .env
dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
