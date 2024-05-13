// Model file (Payment.js)
"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Payment = sequelize.define('payment_intent', {
  id: {
    type: Sq.STRING,
    primaryKey: true
  },
  amount: {
    type: Sq.INTEGER
  },
  currency: {
    type: Sq.STRING
  },
  payment_method: {
    type: Sq.STRING
  },
  status: {
    type: Sq.STRING
  },
  client_secret: {
    type: Sq.STRING
  },
  createdAt: {
    allowNull: false,
    type: Sq.DATE
  },
  updatedAt: {
    allowNull: false,
    type: Sq.DATE
  }
}, {
  tableName: 'payment_intents' 
});

module.exports = Payment;
