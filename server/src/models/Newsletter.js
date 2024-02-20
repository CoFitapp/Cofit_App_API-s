"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const NewsLetter = sequelize.define(
    "newsletter_subscribers",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: Sq.STRING,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
module.exports = NewsLetter;
