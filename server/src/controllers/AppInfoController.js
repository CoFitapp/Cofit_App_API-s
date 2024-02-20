const {
    AppInfo
} = require("../models");
const sequelize = require("sequelize");

module.exports.getInfo = async(req,res,next)=>{
    try {
        const about = await AppInfo.findOne();
        
        return res.send({
            status: true,
            message: "About fetched successfully",
            data: about
        })
    } catch (error) {
        console.log("error......",error);
        return res.send({
            status: false,
            error
        })
    }
}

module.exports.updateAbout = async (req, res, next) => {
    try {
        const data  = req.body;

        if (!data) {
            return res.send({
                status: false,
                error: "Please enter about"
            })
        }
        await AppInfo.update(data, { where: { id: 1 } });
        
        return res.send({
            status: true,
            message: `${Object.keys(data)} updated successfully`
        })
    } catch (error) {
        console.log("error.......", error);
        return res.send({
            status: false,
            error
        })
    }
}