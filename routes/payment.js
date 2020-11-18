const express = require('express');
const formidable = require('express-formidable');
const Router = express.Router();
const stripe = require('stripe')(
  'sk_test_51HoVKPD5Cg0Rg5MbHUiFkyi1UXw66d1Wus0unhQ25ulapDZm7I5gGMcFT3TX7IwJlq1EdzSe4kePXFU59GACeEiS00zzC4E7To'
);

Router.post('/payment', async (req, res) => {
  const body = req.fields;
  console.log(body);

  try {
    const response = await stripe.charges.create({
      amount: body.details.price * 100,
      currency: 'eur',
      description: body.details.name,
      source: body.stripeToken,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.response });
  }
});

module.exports = Router;
