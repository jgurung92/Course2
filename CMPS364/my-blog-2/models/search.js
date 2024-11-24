const mongoose = require("mongoose");

// Define the schema for the search logs
const searchSchema = new mongoose.Schema({
    query: { 
        type: String, 
        required: true, 
        trim: true 
    },
    tags: { 
        type: [String], // Array of tags related to the search query
        default: [] 
    },
    searchedAt: { 
        type: Date, 
        default: Date.now // Automatically sets the current timestamp
    }
});

// Create and export the Search model
module.exports = mongoose.model("Search", searchSchema);
