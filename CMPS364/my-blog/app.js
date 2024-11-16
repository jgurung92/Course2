
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Post = require("./models/post");

const app =  express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));


// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})   
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error(err));

    // Routes
    app.get("/", async(req, res) => {
        const posts = await Post.find().sort({createdAt: -1});
        res.render("index", {posts});        
    });

    app.get("/posts/new", (req, res) => {
        res.render("newPost");
    });

    app.post("/posts", async(req, res) => {
        const {title, content} = req.body;
        await Post.create({title, content});
        res.redirect("/");
    })

    app.get("/posts/:id", async(req, res) => {
        const post = await Post.findById(req.params.id);
        res.render("post", {post});
    })

    const PORT = process.env.PORT || 3000;
    app.listen(PORT,() => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

