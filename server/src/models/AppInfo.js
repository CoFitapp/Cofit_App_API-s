"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const About = sequelize.define(
    "app_info",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        about: {
            type: Sq.STRING,
        },
        terms: {
            type: Sq.STRING,
        },
        cookies: {
            type: Sq.STRING,
        },
        privacy: {
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
module.exports = About;
