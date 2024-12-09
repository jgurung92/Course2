// models/book.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    publicationYear: { type: Number, required: true },
    available: { type: Boolean, default: true },  
    isRented: { type: Boolean, default: false },  
    rentedBy: { type: String, default: null },   
    rentDate: { type: Date, default: null }      
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
