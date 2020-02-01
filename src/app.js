require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const {NODE_ENV, STRIPE_SECRET_KEY} = require('./config');
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const bodyParser = express.json();

const app = express();

const morganOption = (NODE_ENV === 'development' ? 'common' : 'tiny');

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.post('/payment', bodyParser, (req,res) => {
  const body = {
    source: req.body.token.id,
    amount: req.body.amount,
    currency: 'usd'
  };

  stripe.charges.create(body, (stripeError, stripeRes) => {
    if (stripeError) {
      res.status(500).send({error: stripeError});
    }
    else {
      res.status(200).send({success: stripeRes});
    }
  });
});

app.use(() => (error,req,res,next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = {error: {message: 'server error'}}
  }
  else {
    console.error(error);
    response = {error: {message: `${error} - error`}};
  }
  res.status(500).json(response);
});

module.exports = app;