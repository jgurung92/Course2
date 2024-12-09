// models/book.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    publicationYear: { type: Number, required: true },
    available: { type: Boolean, default: true },  // To track if the book is rented
    isRented: { type: Boolean, default: false },  // New field to track rental status
    rentedBy: { type: String, default: null },   // Optional field to track who rented it
    rentDate: { type: Date, default: null }      // Optional field to track rent date
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
