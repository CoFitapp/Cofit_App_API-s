const {
    EventCategory
  } = require("../models");
  const sequelize = require("sequelize");
  const axios = require('axios');

  module.exports.getEventCategory = async (req, res, next) => {
    try {
        const category = await EventCategory.findAll()
        return res.status(200).send({
            status: true,
            message: "Event category fetched",
            data: category
        })
    } catch (error) {
        console.log("error", error);
        return res.send({
            status: false,
            error
        })
    }
}



module.exports.createEventCategory = async (req, res, next) => {
    try {
        // return console.log(req.body)
        const { category} = req.body
        if (!category) {
            return res.status(200).send({
                status: false,
                error: "All fields are mendatory"
            })
        }
        const existingRecord = await EventCategory.findOne({
            where:{category}
        })

        if (existingRecord) {
            return res.send({
                status: false,
                error: "Category already exists!"
            });
        }
        
        const event_category = await EventCategory.create({
            category
        })
        return res.status(200).send({
            status: true,
            message: "Category added successfully",
            data: event_category
        })
    } catch (error) {
        console.log("error", error);
        return res.status(200).send({
            status: false,
            error
        })
    }
}

module.exports.updateEventCategory = async (req, res, next) => {
    try {
        let updateData = req.body;
        // Fetch the current data from the database
        const existingRecord = await EventCategory.findByPk(updateData.id);

        if (!existingRecord) {
            return res.status(404).json({ status: false, message: 'Record not found' });
        }


        // Compare the user's input with the current data
        for (const key in updateData) {
            if (existingRecord[key] !== updateData[key]) {
                existingRecord[key] = updateData[key];
            }
        }

        // Save the updated record
        await existingRecord.save();

        res.json({ status: true, message: 'Category updated successfully' });

    } catch (error) {
        console.log("error", error);
        return res.status(200).send({
            status: false,
            error
        })
    }
}

module.exports.deleteEventCategory = async (req, res, next) => {
    try {
        const { id } = req.body;
        // Fetch the current data from the database
        const existingRecord = await EventCategory.findByPk(id);

        if (!existingRecord) {
            return res.status(404).json({ status: false, message: 'Record not found' });
        }

        // Delete record
        await existingRecord.destroy();

        res.json({ status: true, message: 'Record deleted successfully' });

    } catch (error) {
        console.log("error", error);
        return res.status(200).send({
            status: false,
            error
        })
    }
}