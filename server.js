/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part
* Of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Sukhmandeep Singh Kahlon Student ID: 155832207 Date: 18-02-2022
*
* Online (Heroku) Link: https://obscure-crag-90394.herokuapp.com/
*
* Online (Github) Link: https://github.com/sukha2002/web322-app.git
*
********************************************************************************/
const express = require("express");
var path = require("path");
const posts = require("./data/posts.json");
const blogService = require('./blog-service.js');
const categories = require("./data/categories.json");
const app = express();
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: 'dos8fvnk4',
  api_key: '242752834521126',
  api_secret: 'jPRo6pmznygCgC0qWBms5DiQ_XQ',
  secure: true
});

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { 
    navLink: function(url, options){
      return '<li' +
      ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
      '><a href="' + url + '">' + options.fn(this) + '</a></li>';
     },
     equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
      return options.inverse(this);
      } else {
      return options.fn(this);
      }
     },
     safeHTML: function(context){
      return stripJs(context);
     }     
  }
}));
app.set("view engine", ".hbs");

const upload = multer();

const HTTP_PORT = process.env.PORT || 8080;

app.use(function(req,res,next){ 

  let route = req.path.substring(1); 

  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, "")); 

  app.locals.viewingCategory = req.query.category; 

  next(); 

}); 


app.use(express.static('public'));

app.get("/", (req, res) => {
  res.redirect("/blog");  
});


app.get("/about", function(req,res){
    res.render("about");
});

app.get("/posts/add", function(req,res){
   res.render("addPost");
});

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

app.get("/posts", function(req,res){
  if(req.query.category) {
    blogService.getPostsByCategory(req.query.category).then((result) => {
      res.render("posts", {posts: result});
    }).catch((err) => {
      res.render("posts", {message: "no results"});
    });
  }
  else if(req.query.minDate) {
    blogService.getPostsByMinDate(req.query.minDate).then((result) => {
      res.render("posts", {posts: result})
    }).catch((err) => {
      res.render("posts", {message: "no results"});
    });
  }
  else {
    blogService.getAllPosts().then((result) => {
      res.render("posts", {posts: result})
    }).catch((err) => {
      res.render("posts", {message: "no results"});
    });
  }
});

app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
        // Obtain the published "posts" by category
        posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
        // Obtain the published "posts"
        posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogService.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

app.get("/categories", function(req,res){
    blogService.getCategories().then((result) => {
      res.render("categories", {categories: result});
  }).catch((err) => {
    res.render("categories", {message: "no results"});
  });
});

app.post('/posts/add', upload.single('featureImage'), function (req, res, next) {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
    (error, result) => {
    if (result) {
    resolve(result)
    } else {
    reject(error)
    }}
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
   };
   async function upload(req) {
    let result = await streamUpload(req);
    console.log(result)
    return result
   }
   upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url
    const formData = req.body;
    blogService.addPost(formData);
    res.redirect("/posts");   
  });
});

app.use((req, res) => {
  res.render("404");
});

blogService.initialize().then(() => {
  app.listen(HTTP_PORT);
})
.catch((err) => {
  console.log(err);
});