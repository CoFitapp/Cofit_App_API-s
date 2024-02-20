"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const EventCategory = sequelize.define(
    "event_categories",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        category: {
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
module.exports = EventCategory;
