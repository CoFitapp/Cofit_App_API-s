const Sequelize = require("sequelize");
require('dotenv').config();

console.log('process',process.env.DB_DATABASE)
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    pool:{
        acquire: 1200000,
    }
});

try {
    sequelize
        .authenticate()
        .then(() => {
            console.log("Connection has been established successfully.");
        })
        .catch((err) => {
            console.log("Unable to connect to the database:", err);
        });
} catch (err) {
    console.log("an error occured", err);
}

module.exports = sequelize;