"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const PromoCode = sequelize.define('PromoCode', {
    code: {
        type: Sq.STRING,
        allowNull: false
    },
    type: {
        type: Sq.ENUM('flat', 'discount'), // Updated type options
        allowNull: false
    },
    value: {
        type: Sq.STRING, // Changed type to STRING
        allowNull: false
    },
    status: {
        type: Sq.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PromoCode;
