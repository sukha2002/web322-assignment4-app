const Sequelize = require('sequelize');
var sequelize = new Sequelize('d536jsncpl7oa0', 'qbsgoutywcfamj', 'e994bba610cafc448306e3c699e839d84c3929e890bc97f3266d455ab68a3d17', {
 host: 'ec2-34-224-226-38.compute-1.amazonaws.com',
 dialect: 'postgres',
 port: 5432,
 dialectOptions: {
 ssl: { rejectUnauthorized: false }
 },
 query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

const initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            resolve("Operation was a success.");
        }).catch(function (error){
            reject("unable to sync the database");
        });
    });
}

const getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
}

const getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
}

const getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
}

const addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (const prop in postData) {
            if(postData[prop] === "") {
                postData[prop] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData).then(function () {
            resolve("Operation was a sucess.");
        }).catch(function (error){
            reject("unable to create post");
        });
    });
}

const addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (const prop in categoryData) {
            if(categoryData[prop] === "") {
                categoryData[prop] = null;
            }
        }
        Category.create(categoryData).then(function () {
            resolve("Operation was a sucess.");
        }).catch(function (error){
            reject("unable to create category");
        });
    });
}

const getPostsByCategory = (_category) => {
    return new Promise((resolve, reject) => {
        alert("fda")
        Post.findAll({
            where: {
                category: _category
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
}

const deleteCategoryById = (_id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { 
                id: _id 
            }
        }).then(function () { 
            resolve("destroyed");
        }).catch(function (error) {
            reject("was rejected");
        });
    });
}

const deletePostById = (_id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: { 
                id: _id 
            }
        }).then(function () { 
            resolve("destroyed");
        }).catch(function (error) {
            reject("was rejected");
        });
    });
}


const getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            postDate: {
                [gte]: new Date(minDateStr)
            }               
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
}

const getPostById = (_id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: _id
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
}

const getPublishedPostsByCategory = (_category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: _category
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
}

module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById, getPublishedPostsByCategory, deleteCategoryById, addCategory, deletePostById};