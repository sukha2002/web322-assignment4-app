const posts = require("./data/posts.json");
const categories = require("./data/categories.json");
const fs = require("fs"); // required at the top of your module

let postsArray = [];
let categoriesArray = [];

const initialize = () => {
    return new Promise(function(resolve, reject){ // place our code inside a "Promise" function
        fs.readFile("./data/posts.json", 'utf8', (err, data) => {
            if (err) reject("unable to read file");
            postsArray = JSON.parse(data);
        });
        fs.readFile("./data/categories.json", 'utf8', (err, data) => {
            if (err) reject("unable to read file");
            categoriesArray = JSON.parse(data);
        });
        resolve("Success!");
    });   
}

const getAllPosts = () => {
    return new Promise(function(resolve, reject){
        if(postsArray.length == 0) {
            reject("no results returned");
        }
        resolve(postsArray);
    });   
}

const getPublishedPosts = () => {
    return new Promise(function(resolve, reject){
        if(postsArray.length == 0) {
            reject("no results returned");
        }
        let published = [];
        for(let i = 0; i < postsArray.length; i++) {
            if(postsArray[i].published == true) {
                published.push(postsArray[i]);
            }
        }
        resolve(published);
    });   
}

const getCategories = () => {
    return new Promise(function(resolve, reject){
        if(categoriesArray.length == 0) {
            reject("no results returned");
        }
        resolve(categoriesArray);
    });   
}

const addPost = (postData) => {
    return new Promise(function(resolve, reject){
        if(postData.published == undefined) {
            postData.published = false;
        }
        else {
            postData.published = true;
        }
        postData.id = postsArray.length + 1;
        postData.postDate = new Date().toISOString().slice(0, 10);
        postsArray.push(postData);
        resolve(postData);
    });  
}

const getPostsByCategory = (category) => {
    return new Promise(function(resolve, reject){
        let postCategoryArray = [];
        for(let i = 0; i < postsArray.length; i++) {
            if(postsArray[i].category == category) {
                postCategoryArray.push(postsArray[i]);
            }
        }
        if(postCategoryArray.length == 0) {
            reject("no results returned");
        }
        resolve(postCategoryArray);
    });   
}

const getPostsByMinDate = (minDateStr) => {
    return new Promise(function(resolve, reject){
        let postMinDateArray = [];
        for(let i = 0; i < postsArray.length; i++) {
            if(new Date(postsArray[i].postDate) >= new Date(minDateStr)) {
                postMinDateArray.push(postsArray[i]);
            }
        }
        if(postMinDateArray.length == 0) {
            reject("no results returned");
        }
        resolve(postMinDateArray);
    });   
}

const getPostById = (id) => {
    return new Promise(function(resolve, reject){
        let postById;
        for(let i = 0; i < postsArray.length; i++) {
            if(postsArray[i].id == id) {
                postById = postsArray[i];
            }
        }
        if(postById == undefined) {
            reject("no result returned");
        }
        resolve(postById);
    });   
}

const getPublishedPostsByCategory = (category) => {
    return new Promise(function(resolve, reject){
        if(postsArray.length == 0) {
            reject("no results returned");
        }
        let published = [];
        for(let i = 0; i < postsArray.length; i++) {
            if(postsArray[i].published == true && postsArray[i].category == category) {
                published.push(postsArray[i]);  
            }
        }
        resolve(published);
    });   
}

module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById, getPublishedPostsByCategory};