
const {
    Faq
} = require("../models");
const sequelize = require("sequelize");
const { Op } = sequelize;


module.exports.getfaq = async (req, res, next) => {
    try {
        const faq = await Faq.findAll()
        return res.status(200).send({
            status: true,
            message: "Faq found successfully",
            data: faq
        })
    } catch (error) {
        console.log("error", error);
        return res.send({
            status: false,
            error
        })
    }
}



module.exports.createfaq = async (req, res, next) => {
    try {
        // return console.log(req.body)
        const { question,answer} = req.body
        if (!question || !answer) {
            return res.status(200).send({
                status: false,
                error: "All fields are mendatory"
            })
        }
        
        const faq = await Faq.create({
            question,answer
        })
        return res.status(200).send({
            status: true,
            message: "Faq added successfully",
            data: faq
        })
    } catch (error) {
        console.log("error", error);
        return res.status(200).send({
            status: false,
            error
        })
    }
}

module.exports.updateFaq = async (req, res, next) => {
    try {
        let updateData = req.body;
        // Fetch the current data from the database
        const existingRecord = await Faq.findByPk(updateData.id);

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

        res.json({ status: true, message: 'Record updated successfully' });

    } catch (error) {
        console.log("error", error);
        return res.status(200).send({
            status: false,
            error
        })
    }
}

module.exports.deletefaq = async (req, res, next) => {
    try {
        const { id } = req.body;
        // Fetch the current data from the database
        const existingRecord = await Faq.findByPk(id);

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



