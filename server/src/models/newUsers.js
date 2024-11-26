"use strict";

const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../dbconfig");

const NewUser = sequelize.define(
  "newUsers", // This is the table name, it will be pluralized automatically unless you specify otherwise
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,  // Allow null values for social logins
      defaultValue: null  // or set a default value if necessary
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.DATE,
    },
    gender: {
      type: DataTypes.STRING,
    },
    phoneNo: {
      type: DataTypes.STRING,
    },
    profilePhoto: {
      type: DataTypes.STRING,
    },
    interests: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // validate: {
      //   isValidInterest(value) {
      //     if (value !== null && !Array.isArray(value)) {
      //       throw new Error('Interests must be an array');
      //     }
      //     // Additional validation logic if needed
      //   }
      // }
    },
    homeLocation: {
      type: DataTypes.STRING,
    },
    searchLocation: {
      type: DataTypes.STRING,
    },
    googleuser: {
      type: DataTypes.STRING,
    },
    facebookuser: {
      type: DataTypes.STRING,
    },
    appleuser: {
      type: DataTypes.STRING,
    },
    newUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Assuming new users should have this flag initially set to true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
  },
  {
    timestamps: false, // Set to true if you want Sequelize to manage createdAt and updatedAt
    freezeTableName: true, // Prevent Sequelize from pluralizing the table name
    tableName: "newUsers", // Explicitly set the table name
  }
);

// Sync the model with the database (create the table if it doesn't exist)
NewUser.sync({ force: false })
  .then(() => {
    console.log("Table 'newUsers' created (or already exists if it was already defined)");
  })
  .catch(err => {
    console.error("Error creating table:", err);
  });

module.exports = NewUser;
