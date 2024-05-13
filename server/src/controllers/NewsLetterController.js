
const {
    Newsletter
} = require("../models");
const sequelize = require("sequelize");
const { Op } = sequelize;


module.exports.subscribe_newsLetter = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.send({
                status: false,
                error: "Email is required"
            })
        }
        const existingRecord = await Newsletter.findOne({
            where:{email}
        })

        if (existingRecord) {
            return res.send({
                status: false,
                error: "Already subscribed"
            });
        }

        await Newsletter.create({
            email
        });


        return res.send({
            status: true,
            message: "Subscribed successfully"
        })

    } catch (error) {
        console.log("error......", error);
        return res.send({
            status: false,
            error
        })
    }
}

module.exports.unsubscribe_newsLetter = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.send({
                status: false,
                error: "Email is required"
            })
        }
        const existingRecord = await Newsletter.findOne({
            where: {
                email
            }
        })
        
        if (!existingRecord) {
            return res.send({
                status: false,
                error: "Record not found"
            });
        }

        await existingRecord.destroy();
        return res.send({
            status: true,
            message: "Newsletter unsubscribed successfully"
        })
    } catch (error) {
        console.log("error.....", error);
        return res.send({
            status: false,
            error
        })
    }
}

