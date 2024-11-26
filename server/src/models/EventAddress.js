"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const EventAddress = sequelize.define('eventAddress', {
    eventId: {
        type: Sq.INTEGER,
        allowNull: false,
    },
    address: {
        type: Sq.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = EventAddress;