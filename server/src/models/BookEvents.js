"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const BookEvents = sequelize.define("book_events", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sq.INTEGER
    },
    userId: {
        type: Sq.INTEGER,
        allowNull: false
    },
    eventId: {
        type: Sq.INTEGER,
        allowNull: false
    },
    planId: {
        type: Sq.STRING,
        allowNull: false
    },
    amount: {
        type: Sq.FLOAT,
        allowNull: false
    },
    firstName: {
        type: Sq.STRING,
        allowNull: false
    },
    lastName: {
        type: Sq.STRING,
        allowNull: false
    },
    email: {
        type: Sq.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: Sq.STRING,
        allowNull: false
    },
    quantity: {
        type: Sq.INTEGER,
        allowNull: false,
    },
    bookingId: {
        type: Sq.STRING,
        allowNull: false
    },
    transactionId: {
        type: Sq.STRING
    },
    ticketNumber: {
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

module.exports = BookEvents;
