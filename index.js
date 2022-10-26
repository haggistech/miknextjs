require('dotenv').config()
const path = require('path');
const { engine } = require('express-edge');
const express = require('express');
const edge = require("edge.js");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Post = require('./database/models/Post');
const fileUpload = require("express-fileupload");

const createPostController = require('./controllers/createPost')
const homePageController = require('./controllers/homePage')
const storePostController = require('./controllers/storePost')
const getPostController = require('./controllers/getPost')
const createUserController = require("./controllers/createUser");
const storeUserController = require('./controllers/storeUser');
const loginController = require("./controllers/login");
const loginUserController = require('./controllers/loginUser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const connectFlash = require("connect-flash");
const logoutController = require("./controllers/logout");

const app = new express();

app.use(expressSession({
    secret: process.env.HASHSecret,
        store: MongoStore.create({ mongoUrl: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_TABLE}?retryWrites=true&w=majority`
    })
}));


mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_TABLE}?retryWrites=true&w=majority`, { useNewUrlParser: true })
    .then(() => 'You are now connected to Mongo!')
    .catch(err => console.error('Something went wrong', err))
    
app.use(connectFlash());
app.use(fileUpload());
app.use(express.static('public'));
app.use(engine);
app.set('views', __dirname + '/views');

app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userId)
    next()
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

const auth = require("./middleware/auth");
const storePost = require('./middleware/storePost')
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated')

app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", auth, createPostController);
app.post("/posts/store", auth, storePost, storePostController);
app.get("/auth/login", redirectIfAuthenticated, loginController);
app.post("/users/login", redirectIfAuthenticated, loginUserController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get("/auth/logout", logoutController);

app.listen(4000, () => {
  console.log("App listening on port 4000");
});
 
 
