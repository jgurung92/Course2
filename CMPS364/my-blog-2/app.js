
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const flash = require('connect-flash');
const session = require('express-session');
// const socketIO = require('socket.io');

const http = require("http");
const { Server } = require("socket.io");

const Post = require("./models/post");
const Category = require("./models/category");
const Comment = require("./models/comment");
const Search = require("./models/search");

// Middleware Setup
const app =  express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));


app.use(flash());
// To handle the session cookie (required by connect-flash)
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true
}));


// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error(err));

    // 1. Routes For Post
    app.get("/", async (req, res) => {
        const posts = await Post.find().sort({ createdAt: -1 });
        // Defining variable message
        const message = {
            success: req.flash('success'),
            error: req.flash('error')
        };
    
        // Get the latest search to personalize recommendations.
        const recentSearches = await Search.find().sort({ searchedAt: -1 }).limit(5); // Get the latest 5 searches
        
        const recentTags = recentSearches.flatMap(search => search.tags); // Extract tags from recent searches
        
        try {
            // using recent searches to recommend related posts
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
    
            // Render the index page with posts, session message and personalized recommendations
            res.render("index", { posts, message, recommendedPosts });
    
        } catch (error) {
            console.error("Error fetching recommended posts:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    // get post new route
    app.get("/posts/new", async (req, res) => {
        // Fetch all categories for the dropdown in the post form
        const categories = await Category.find();
        res.render("newPost", { categories });  // Pass categories to the form
    });

    // New Post Route
    app.post("/posts", async (req, res) => {
        const { title, author, content, tags, category } = req.body;
    
        try {
            // Check if category ID is valid
            if (!mongoose.Types.ObjectId.isValid(category)) {
                req.flash('error', 'Invalid category ID');
                return res.redirect('/');
            }
    
            // Find the category by ID
            const categoryDoc = await Category.findById(category);
    
            if (!categoryDoc) {
                // Changes Made
                req.flash('error', 'Category not found');
                return res.redirect('/');
            }
    
            // Create the new post with categoryName 
            const post = await Post.create({
                title,
                author,
                content,
                category: categoryDoc.categoryName, // Save the categoryName
                tags: tags.split(",").map(tag => tag.trim()) // Split tags into an array
            });
    
            // update the category document with the new post reference
            await Category.findByIdAndUpdate(category, { $push: { posts: post._id } });

             // Flash a success message
            req.flash('success', 'Post created successfully');
            res.redirect("/"); //redirect to home page
        } catch (error) {
            // console.error("Error creating post:", error);
             // Flash a Error message
            req.flash('error', 'Error creating post');
            res.redirect("/"); 
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


    // 2. ROUTES FOR CATEGORIES
    // Create a new category (Form submission)
    app.post("/categories", async (req, res) => {
        const { categoryName, description } = req.body;
        try {
            await Category.create({ categoryName, description });
            // Changes made:
            req.flash('success', 'Category created successfully!'); // Set success message
            res.redirect("/categories"); // Redirect to the categories list
        } catch (error) {
            // console.error("Error creating category:", error);
            req.flash('error', 'Error creating category.'); // Set error message
            res.redirect("/categories"); // Redirect to the categories list 
        }
    });

    // Get all categories (Categories list page)
    app.get("/categories", async (req, res) => {
        const categories = await Category.find(); // Fetch all categories
        const message = {
            success: req.flash('success'),
            error: req.flash('error')
        };
        res.render("categories", { categories, message }); // Pass messages to the view
    });

    // Display the Add Category form (New page for adding categories)
    app.get("/categories/add", (req, res) => {
        res.render("addCategory"); // Render the form for adding a new category
    });

    // View posts by category
    app.get("/categories/:id", async (req, res) => {
        try {
            // Fetch the category by ID and populate its posts
            const category = await Category.findById(req.params.id).populate("posts");
            
            // Render the categoryPosts view with the category and its posts
            res.render("categoryPosts", { category });
        } catch (error) {
            console.error("Error fetching category posts:", error);
            res.status(500).send("Internal Server Error");
        }
    });


    // 3. ROUTES FOR COMMENT
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

    // 4. ROUTES FOR SEARCH
    // Search Route 
    app.get("/search", async (req, res) => {
        const query = req.query.q; // Get the search query from the URL 
        // Session message     
        const message = {
            success: req.flash('success'),
            error: req.flash('error')
        };   
        
        if (!query) {
        return res.redirect("/");  // Redirect to home if query is empty
        }

        try {
            // Search by tags.
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

            // Get the latest search to personalize recommendations 
            const recentSearches = await Search.find().sort({ searchedAt: -1 }).limit(10); // Get the latest 5 searches
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
            res.render("index", { posts, recommendedPosts, message });
        } catch (error) {
            console.error("Error performing search:", error);
            // res.status(500).send("Internal Server Error");
        }
    });


    // 5. Socket.IO Connection for live comments.
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

    // . Port Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,() => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

