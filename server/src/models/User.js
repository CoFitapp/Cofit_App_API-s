"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const User = sequelize.define(
    "users",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        google_id: {
            type: Sq.STRING,
        },
        full_name: {
            type: Sq.STRING,
        },
        first_name: {
            type: Sq.STRING,
        },
        last_name: {
            type: Sq.STRING,
        },
        email: {
            type: Sq.STRING,
        },
        phone_no: {
            type: Sq.STRING,
        },
        profile_image: {
            type: Sq.STRING,
        },
        location: {
            type: Sq.STRING,
        },
        stripeCustomerId: {
            type: Sq.STRING,
        }
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
module.exports = User;
