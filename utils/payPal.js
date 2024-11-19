const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', // or 'live' for production
  'client_id': process.env.CLIENT_ID,
  'client_secret': process.env.CLIENT_SECRET
});

module.exports = paypal;