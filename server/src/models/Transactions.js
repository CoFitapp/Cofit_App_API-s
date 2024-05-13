"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const Transactions = sequelize.define("transactions", { 
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sq.INTEGER
      },
      stripe_charge_id: {
        type: Sq.STRING,
        allowNull: true
      },
      amount: {
        type: Sq.INTEGER,
        allowNull: true
      },
      currency: {
        type: Sq.STRING,
        allowNull: true
      },
      captured: {
        type: Sq.BOOLEAN,
        allowNull: true
      },
      created: {
        type: Sq.DATE,
        allowNull: true
      },
      payment_intent: {
        type: Sq.STRING
      },
      payment_method: {
        type: Sq.STRING
      },
      customer: {
        type: Sq.STRING
      },
      created: {
        type: Sq.DATE, // Add this field to map to createdAt
        allowNull: false
      },
      description: {
        type: Sq.STRING
      },
      status: {
        type: Sq.STRING,
        allowNull: false
      },
      receipt_url: {
        type: Sq.STRING
      },
      type: {
        type: Sq.STRING,
        validate: {
            isIn: [['payment', 'transfer']]
        },
        allowNull: false
    },
    eventId: {
      type: Sq.INTEGER,
      allowNull: false
    },
    user_id: {
      type: Sq.INTEGER,
    },
    stripeAccountId: {
      type: Sq.STRING
    },
    payoutAmount: {
      type: Sq.INTEGER,
    },
      createdAt:  'created',
      updatedAt: {
        allowNull: false,
        type: Sq.DATE
      }
});

module.exports = Transactions;
