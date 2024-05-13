"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const NewsArticles = sequelize.define(
    "news_articles",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sq.INTEGER,
        },
        category_id: {
            type: Sq.INTEGER,
        },
        title: {
            type: Sq.STRING,
        },
        description: {
            type: Sq.STRING,
        },
        image: {
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



module.exports = NewsArticles;
