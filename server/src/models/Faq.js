"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const Faq = sequelize.define(
    "faq",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        question: {
            type: Sq.STRING,
        },
        answer: {
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
module.exports = Faq;
