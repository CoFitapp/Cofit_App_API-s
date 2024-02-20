"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");
const Op = Sq.Op;

const Event = sequelize.define(
    "events",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        city_id: {
            type: Sq.INTEGER,
        },
        events: {
            type: Sq.JSON,
        },
        link: {
            type: Sq.STRING,
        },
        user_id: {
            type: Sq.INTEGER,
        },
        event_category: {
            type: Sq.INTEGER,
        },
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
module.exports = Event;
