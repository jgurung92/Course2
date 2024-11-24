const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    createdAt: { type: Date, default: Date.now}
});

module.exports = mongoose.model("Category", categorySchema);
