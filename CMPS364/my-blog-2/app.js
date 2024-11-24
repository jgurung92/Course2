
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const http = require("http");
const { Server } = require("socket.io");

const Post = require("./models/post");
const Category = require("./models/category");
const Comment = require("./models/comment");
const Search = require("./models/search"); 

const app =  express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error(err));

    // 1. Routes For Post
    app.get("/", async (req, res) => {
        const posts = await Post.find().sort({ createdAt: -1 });
    
        // Get the latest search to personalize recommendations.
        const recentSearches = await Search.find().sort({ searchedAt: -1 }).limit(5); // Get the latest 5 searches
        
        const recentTags = recentSearches.flatMap(search => search.tags); // Extract tags from recent searches
        
        try {
            // If we have recent searches, use them to recommend related posts
            let recommendedPosts = [];
    
            if (recentTags.length > 0) {
                // Use aggregation to find related posts with the tags from recent searches
                recommendedPosts = await Post.aggregate([
                    { 
                        $match: { 
                            tags: { $in: recentTags } 
                        }
                    },
                    { 
                        $sample: { size: 5 }  // Randomly sample 5 related posts
                    }
                ]);
            }
    
            // Render the index page with posts and personalized recommendations
            res.render("index", { posts, recommendedPosts });
    
        } catch (error) {
            console.error("Error fetching recommended posts:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get("/posts/new", (req, res) => {
        res.render("newPost");
    });

    app.post("/posts", async (req, res) => {
        const { title, author, content, tags } = req.body;
    
        try {
            await Post.create({
                title,
                author,
                content,
                tags: tags.split(",").map(tag => tag.trim()) // Split tags into an array
            });
            res.redirect("/");
        } catch (error) {
            console.error("Error creating post:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    // Fetch comments associated with specific post and pass it to post.ejs
    app.get("/posts/:id", async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: 1 }); // Get comments for the post
            res.render("post", { post, comments });
        } catch (error) {
            console.error("Error fetching post or comments:", error);
            res.status(500).send("Internal Server Error");
        }
    });
    


    // 2. Routes For Categories
    // Create a new category (Form submission)
    app.post("/categories", async (req, res) => {
        const { categoryName, description } = req.body;
        try {
            await Category.create({ categoryName, description });
            res.redirect("/categories"); // Redirect to the categories list after creation
        } catch (error) {
            console.error("Error creating category:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    // Get all categories (Categories list page)
    app.get("/categories", async (req, res) => {
        const categories = await Category.find(); // Fetch all categories
        res.render("categories", { categories }); // Render categories page
    });

    // Display the Add Category form (New page for adding categories)
    app.get("/categories/add", (req, res) => {
        res.render("addCategory"); // Render the form for adding a new category
    });

    // View posts by category
    app.get("/categories/:id", async (req, res) => {
        try {
            const category = await Category.findById(req.params.id).populate("posts");
            res.render("categoryPosts", { category });
        } catch (error) {
            console.error("Error fetching category posts:", error);
            res.status(500).send("Internal Server Error");
        }
    });


    // 3. Routes For Comment
    // Add a comment to a post
    app.post("/posts/:id/comments", async (req, res) => {
        const { author, content } = req.body;
        const postId = req.params.id;
        const comment = await Comment.create({ postId, author, content });
        
        // Optionally, you can link the comment to the post by adding it to the post's comments array
        await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
        
        res.redirect(`/posts/${postId}`);
    });

    // View comments for a post
    app.get("/posts/:id/comments", async (req, res) => {
        const comments = await Comment.find({ postId: req.params.id });
        res.render("postComments", { comments, query });
    });

    // 4. Routes For Search
    // Search Route 
    app.get("/search", async (req, res) => {
        const query = req.query.q; // Get the search query from the URL
        
        if (!query) {
            return res.redirect("/");  // Redirect to home if query is empty
        }

        try {
            // Create tags array from query (optional, depends on your tagging logic)
            const tags = query.split(",").map(tag => tag.trim());

            // Store the search query into the "searches" collection
            const searchEntry = new Search({
                query: query,
                tags: tags,
                searchedAt: Date.now()
            });
            await searchEntry.save(); // Save search entry

            // Perform the actual search functionality across title, content, and tags
            const posts = await Post.find({
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { content: { $regex: query, $options: "i" } },
                    { tags: { $in: tags } },
                ]
            }).sort({ createdAt: -1 });


            // Get the latest search to personalize recommendations (Optional: you can limit this to the latest few searches)
        const recentSearches = await Search.find().sort({ searchedAt: -1 }).limit(5); // Get the latest 5 searches
        const recentTags = recentSearches.flatMap(search => search.tags); // Extract tags from recent searches
        
        let recommendedPosts = [];

        if (recentTags.length > 0) {
            // Use aggregation to find related posts with the tags from recent searches
            recommendedPosts = await Post.aggregate([
                { 
                    $match: { 
                        tags: { $in: recentTags } 
                    }
                },
                { 
                    $sample: { size: 5 }  // Randomly sample 5 related posts
                }
            ]);
        }
        // Render the index page with search results and personalized recommendations
        res.render("index", { posts, recommendedPosts });
        } catch (error) {
            console.error("Error performing search:", error);
            res.status(500).send("Internal Server Error");
        }
    });


    // 5. Socket.IO Connection for live comments.
    // Create HTTP server and attach Socket.IO
    const server = http.createServer(app);
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("A user connected");

        // Listen for new comments from the client
        socket.on("newComment", async (data) => {
            const { postId, author, content } = data;

            try {
                // Save the comment to the database
                const newComment = await Comment.create({
                    postId,
                    author,
                    content,
                    createdAt: new Date()
                });

                // Broadcast the new comment to all clients
                io.emit("commentAdded", newComment);
            } catch (error) {
                console.error("Error saving new comment:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });

    // 6. Port Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,() => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

