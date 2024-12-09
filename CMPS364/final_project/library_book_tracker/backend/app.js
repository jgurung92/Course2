
require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Book = require('./models/book');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDB', err));

// API ROUTES
// Route to Get all books
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).send('Error retrieving books');
    }
});

// Route to filter (GET) book by mongodb object ID 
app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id); // Access the `_id` from the route parameter
        if (!book) {
            return res.status(404).send('Book not found');
        }
        res.json(book);
    } catch (error) {
        res.status(500).send('Error retrieving the book');
    }
});

// Route to filter (GET) books by title
app.get('/books/title/:title', async (req, res) => {
    const titleName = req.params.title; // Get the title from the URL
    
    try {
        // Use a case-insensitive regular expression to search for books with the given title
        const books = await Book.find({ title: new RegExp(titleName, 'i') }); // 'i' makes it case-insensitive
        
        if (books.length === 0) {
            return res.status(404).send('No books found with that title');
        }
        res.status(200).json(books);
    } catch (error) {
        res.status(500).send('Error retrieving books');
    }
});

// Route to filter (GET) books by author 
app.get('/books/author/:author', async (req, res) => {
    const authorName = req.params.author; // Get the author from the URL
    
    try {
        const books = await Book.find({ author: new RegExp(authorName, 'i') }); // 'i' makes it case-insensitive
        if (books.length === 0) {
            return res.status(404).send('No books found by that author');
        }
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch books' });
    }
});

// Route to filter books by genre
app.get('/books/genre/:genre', async (req, res) => {
    const genre = req.params.genre; // Get the genre from the URL
    
    try {
        const books = await Book.find({ genre: genre }); // Query for books by genre

        if (books.length === 0) {
            return res.status(404).send('No books found for the given genre');
        }

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving books by genre' });
    }
});

// Route to Get all books with rental status
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books.map(book => ({
            ...book.toObject(),
            status: book.isRented ? `Rented by ${book.rentedBy}` : 'Available'
        })));
    } catch (error) {
        res.status(500).send('Error retrieving books');
    }
});

// Route to Get book by ID with rental status
app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        res.json({
            ...book.toObject(),
            status: book.isRented ? `Rented by ${book.rentedBy}` : 'Available'
        });
    } catch (error) {
        res.status(500).send('Error retrieving the book');
    }
});

// Route to search for books published before a certain year
app.get('/books/published/before/:year', async (req, res) => {
    const year = parseInt(req.params.year, 10); // Extract and parse the year from the URL

    if (isNaN(year)) {
        return res.status(400).json({ error: 'Invalid year parameter. Please provide a numeric value.' });
    }

    try {
        // Query for books published before the given year
        const books = await Book.find({ publicationYear: { $lt: year } });

        if (books.length === 0) {
            return res.status(404).json({ message: `No books found published before the year ${year}.` });
        }

        res.status(200).json({
            message: `Books published before the year ${year}:`,
            books,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error searching for books published before the given year',
            details: error.message,
        });
    }
});

// Route to search for books published after a certain year
app.get('/books/published/after/:year', async (req, res) => {
    const year = parseInt(req.params.year, 10); // Extract and parse the year from the URL

    if (isNaN(year)) {
        return res.status(400).json({ error: 'Invalid year parameter. Please provide a numeric value.' });
    }

    try {
        // Query for books published after the given year
        const books = await Book.find({ publicationYear: { $gt: year } });

        if (books.length === 0) {
            return res.status(404).json({ message: `No books found published after the year ${year}.` });
        }

        res.status(200).json({
            message: `Books published after the year ${year}:`,
            books,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error searching for books published after the given year',
            details: error.message,
        });
    }
});

// POST REQUEST
// POST route to insert a new book
app.post('/books', async (req, res) => {
    const { title, author, genre, publicationYear, available } = req.body;

    try {
        // Create a new book instance
        const newBook = new Book({
            title,
            author,
            genre,
            publicationYear,
            available
        });

        // Save the new book to the database
        await newBook.save();

        // Return a success response
        res.status(201).json({
            message: 'New book added successfully',
            book: newBook
        });
    } catch (error) {
        res.status(400).json({
            error: 'Error adding the new book',
            details: error.message
        });
    }
});

// PUT REQUEST
// PUT route to update an existing book
app.put('/books/:id', async (req, res) => {
    const bookId = req.params.id; // Get the book ID from the URL
    const { title, author, genre, publicationYear, available } = req.body; // Get the updated book data from the body

    try {
        // Use updateOne to get the counts (matchedCount, modifiedCount)
        const result = await Book.updateOne(
            { _id: bookId }, // Find the book by its MongoDB ObjectId
            { title, author, genre, publicationYear, available }, // Fields to update
            { runValidators: true } // Option to run validation before updating
        );

        // If no document was matched, return a 404 error
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Return the expected response format
        res.status(200).json({
            acknowledged: true,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        // Return a 400 error if there's a validation error or other issues
        res.status(400).json({
            error: 'Error updating the book',
            details: error.message
        });
    }
});

// Route to rent a book
app.put('/books/rent/:id', async (req, res) => {
    const bookId = req.params.id;
    const { rentedBy } = req.body;  // Expecting the user's name or ID who is renting the book
    
    try {
        const book = await Book.findById(bookId);
        
        if (!book) {
            return res.status(404).send('Book not found');
        }
        
        if (book.isRented) {
            return res.status(400).send('This book is already rented out');
        }

        // Update the book's rental status
        book.isRented = true;
        book.rentedBy = rentedBy;
        book.rentDate = new Date();
        book.available = false;  // Set available to false when the book is rented

        await book.save();

        res.status(200).json({
            message: `Book has been rented to ${rentedBy}`,
            book
        });
    } catch (error) {
        res.status(500).send('Error renting the book');
    }
});

// Route to return a book
app.put('/books/return/:id', async (req, res) => {
    const bookId = req.params.id;
    
    try {
        const book = await Book.findById(bookId);
        
        if (!book) {
            return res.status(404).send('Book not found');
        }
        
        if (!book.isRented) {
            return res.status(400).send('This book is not rented out');
        }

        // Update the book's status to reflect that it's returned
        book.isRented = false;
        book.rentedBy = null;
        book.rentDate = null;
        book.available = true;  // Set available to true when the book is returned

        await book.save();

        res.status(200).json({
            message: 'Book has been returned and is now available for rent',
            book
        });
    } catch (error) {
        res.status(500).send('Error returning the book');
    }
});

// DELETE/PURGE REQUEST
// Route to delete a book by title (using path parameters)
app.delete('/books/title/:title', async (req, res) => {
    const title = decodeURIComponent(req.params.title); // This decodes any URL-encoded characters (e.g., '%20' for spaces)

    try {
        const deletedBook = await Book.findOneAndDelete({ title: title });

        if (!deletedBook) {
            return res.status(404).send('Book not found');
        }

        res.status(200).json({
            acknowledged: true,
            deletedCount: 1
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting the book',
            details: error.message
        });
    }
});

// Route to delete a book by author (using path parameters)
app.delete('/books/author/:author', async (req, res) => {
    const author = decodeURIComponent(req.params.author); // This decodes any URL-encoded characters (e.g., '%20' for spaces)
    try {
        const deletedBook = await Book.findOneAndDelete({author: author });

        if (!deletedBook) {
            return res.status(404).send('Book not found');
        }

        res.status(200).json({
            acknowledged: true,
            deletedCount: 1
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error deleting the book',
            details: error.message
        });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
