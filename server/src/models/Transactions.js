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
        allowNull: false,
        unique: true
      },
      amount: {
        type: Sq.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sq.STRING,
        allowNull: false
      },
      captured: {
        type: Sq.BOOLEAN,
        allowNull: false
      },
      created: {
        type: Sq.DATE,
        allowNull: false
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
      createdAt: {
        allowNull: false,
        type: Sq.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sq.DATE
      }
});

module.exports = Transactions;
