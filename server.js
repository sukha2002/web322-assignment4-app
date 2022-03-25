/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Sukhmandeep Singh Kahlon Student ID: 155832207 Date: 25-03-2022
*
* Online (Heroku) Link: https://lit-retreat-42279.herokuapp.com
*
* Online (Github) Link: https://github.com/sukha2002/web322-assignment4-app.git
*
********************************************************************************/
const express = require("express");
var path = require("path");
const blogService = require('./blog-service.js');
const app = express();
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
app.use(express.urlencoded({extended: true}));

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
     },
     formatDate: function(dateObj){
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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
  blogService.getCategories().then(function (data) {
    res.render("addPost", {categories: data});
  })
  .catch(function (error) {
    res.render("addPost", {categories: []});      
  });
});

app.get("/categories/add", function(req,res){
  res.render("addCategory");
});

app.get("/categories/delete/:id", function(req,res){
  blogService.deleteCategoryById(req.params.id).then(function () {
    res.redirect("/categories");
  })
  .catch(function (error) {
    res.status(500).send("Unable to Remove Category / Category not found");
  });
});

app.get("/posts/delete/:id", function(req,res){
  blogService.deletePostById(req.params.id).then(function () {
    res.redirect("/posts");
  })
  .catch(function (error) {
    res.status(500).send("Unable to Remove Post / Post not found");
  });
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
      if(result.length > 0) {
        res.render("posts", {posts: result});
      }
      else {
        res.render("posts", {message: "no results"});
      }
    }).catch((err) => {
      res.render("posts", {message: "no results"});
    });
  }
  else if(req.query.minDate) {
    blogService.getPostsByMinDate(req.query.minDate).then((result) => {
      if(result.length > 0) {
        res.render("posts", {posts: result});
      }
      else {
        res.render("posts", {message: "no results"});
      }
    }).catch((err) => {
      res.render("posts", {message: "no results"});
    });
  }
  else {
    blogService.getAllPosts().then((result) => {
      if(result.length > 0) {
        res.render("posts", {posts: result});
      }
      else {
        res.render("posts", {message: "no results"});
      }
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
      if(result.length > 0) {
        res.render("categories", {categories: result});
      }
      else {
        res.render("categories", {message: "no results"});
      }
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

app.post('/categories/add', function (req, res) {
  const formData = req.body;
  blogService.addCategory(formData);
  res.redirect("/categories");
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