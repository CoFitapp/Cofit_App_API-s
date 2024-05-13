// EventTickets.js

'use strict';

const Sq  = require('sequelize');
const sequelize = require('../dbconfig');

const EventTickets = sequelize.define('EventTickets', {
  id: {
    type: Sq.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  eventId: {
    type: Sq.INTEGER,
    allowNull: false,
    references: {
      model: 'events', 
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  planName: {
    type: Sq.STRING,
    allowNull: false
  },
  price: {
    type: Sq.FLOAT,
    allowNull: false
  },
  number_available: {
    type: Sq.INTEGER,
    allowNull: false
  },
  total_number: {
    type: Sq.INTEGER,
    allowNull: false
  },
  description: {
    type: Sq.TEXT,
    allowNull: true
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



module.exports = EventTickets;
