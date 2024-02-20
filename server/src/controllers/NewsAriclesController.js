const {
    NewsArticles,
    ArticleCategory
} = require("../models");
const sequelize = require("sequelize");
const axios = require('axios');
const { Op } = sequelize;
const db = require("../dbconfig")

// News article category
module.exports.createArticleCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.send({
                status: false,
                error: "Please enter category name"
            })
        }
        const category = await ArticleCategory.findOne({
            where: {
                name
            }
        });

        if (category) {
            return res.send({
                status: false,
                error: "Category already exist!"
            })
        }

        await ArticleCategory.create({
            name
        });

        return res.send({
            status: true,
            message: "Category added successfully"
        })


    } catch (error) {
        console.log("error", error);
        return res.send({
            status: false,
            error
        })
    }
}
module.exports.updateArticleCategory = async (req, res, next) => {
    try {
        const updateData = req.body;

        // Fetch the current data from the database
        const existingRecord = await ArticleCategory.findByPk(updateData.id);

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


        return res.send({
            status: true,
            message: "Category updated successfully"
        })


    } catch (error) {
        console.log("error", error);
        return res.send({
            status: false,
            error
        })
    }
}
module.exports.deleteArticleCategory = async (req, res, next) => {
    try {
        const updateData = req.body;

        // Fetch the current data from the database
        const existingRecord = await ArticleCategory.findByPk(updateData.id);

        if (!existingRecord) {
            return res.status(404).json({ status: false, message: 'Record not found' });
        }



        // Save the updated record
        await existingRecord.destroy();


        return res.send({
            status: true,
            message: "Category deleted successfully"
        })


    } catch (error) {
        console.log("error", error);
        return res.send({
            status: false,
            error
        })
    }
}


module.exports.getArticleCategory = async (req, res, next) => {
    try {
        const category = await ArticleCategory.findAll();


        return res.send({
            status: true,
            message: "Categories found",
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


// news article blogs
module.exports.getNews = async (req, res, next) => {
    try {
        const page = req.body.page || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const count = await NewsArticles.count()

        const totalPages = Math.ceil(count / limit);

        const articles = await NewsArticles.findAll({
            order: [
                ['id', 'DESC'],
            ],
            limit,
            offset,
            where: {
                category_id: category_id ? category_id : ''
            }
        })
        return res.status(200).send({
            status: true,
            message: "News Articles found successfully",
            data: { articles, currentPage: page, totalRecords: count, totalPages }
        })
    } catch (error) {
        console.log("error", error);
        return res.send({
            status: false,
            error
        })
    }
}


module.exports.getArticleByCategory = async (req, res, next) => {
    try {
        const page = req.body.page || 1;
        const category_id = req.body.category_id;
        const limit = 5;
        const offset = (page - 1) * limit;

        const existingrecord = await ArticleCategory.findByPk(category_id)
        if (!existingrecord) {
            return res.send({
                status: false,
                error: "Category not found"
            })
        }
        const count = await NewsArticles.count({
            where: {
                category_id
            }
        })
        const totalPages = Math.ceil(count / limit);

        const articles = await NewsArticles.findAll({
            where: {
                category_id
            },
            order: [
                ['id', 'DESC'],
            ],
            limit,
            offset,
        })
        return res.status(200).send({
            status: true,
            message: "News articles found successfully",
            data: { articles, currentPage: page, totalRecords: count, totalPages }
        })


    } catch (error) {
        console.log("error....", error);
        return res.send({
            status: false,
            error
        })
    }
}


module.exports.viewNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const news = await NewsArticles.findByPk(id, {
            attributes: {
                // subquery used to get category name and total counts of articles
                include: [
                    [
                        sequelize.literal(`(SELECT COUNT(*) FROM news_articles AS articles WHERE articles.category_id= news_articles.category_id)`),
                        'total_articles_inCategory'
                    ],
                    [
                        sequelize.literal(`(SELECT articles_category.name FROM articles_category Join news_articles on articles_category.id = news_articles.category_id WHERE news_articles.id = ${id})`),
                        'category'
                    ]
                ],
            },
        });
        const category_id = news.category_id;
        const otherNews = await NewsArticles.findAll({
            where: {
                id: { [Op.ne]: id },
                category_id
            },
            // subquery used to get category name
            attributes: {
                include: [
                    [
                        sequelize.literal(`(SELECT articles_category.name FROM articles_category where id = ${category_id})`),
                        'category'
                    ]
                ],
            },

            order: db.random(),
            limit: 5
        })

        return res.status(200).send({
            status: true,
            message: "News found successfully",
            data: { news, otherNews }
        })
    } catch (error) {
        console.log("error", error);
        return res.send({
            status: false,
            error
        })
    }
}


module.exports.createNewsArticle = async (req, res, next) => {
    try {
        const { title, description, user_id, category_id } = req.body
        // Validations
        if (!title || !description || !user_id || !category_id || !req.file) {
            return res.status(200).send({
                status: false,
                error: "All fields are mendatory"
            })
        }
        const existingRecord = await ArticleCategory.findByPk(category_id);
        if (!existingRecord) {
            return res.send({
                status: false,
                error: "Category not found"
            })
        }
        const image = req.file.filename;
        const news = await NewsArticles.create({
            user_id,
            title,
            description,
            image,
            category_id
        })
        return res.status(200).send({
            status: true,
            message: "News article uploaded successfully",
            data: news
        })
    } catch (error) {
        console.log("error", error);
        return res.status(200).send({
            status: false,
            error
        })
    }
}

module.exports.updateNewsArticle = async (req, res, next) => {
    try {
        let updateData = req.body;
        // Fetch the current data from the database
        const existingRecord = await NewsArticles.findByPk(updateData.id);

        if (!existingRecord) {
            return res.status(404).json({ status: false, message: 'Record not found' });
        }

        // fetcj category data from database when user want to change category of existingRecord
        if (req.body.category_id) {
            const existingCategory = await ArticleCategory.findByPk(updateData.category_id);
            if (!existingCategory) {
                return res.send({
                    status: false,
                    error: "Category not found"
                })
            }
        }

        if (req.file) {
            existingRecord['image'] = req.file.filename
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

module.exports.deleteNewsArticle = async (req, res, next) => {
    try {
        const { id } = req.body;
        // Fetch the current data from the database
        const existingRecord = await NewsArticles.findByPk(id);

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

