const express = require('express')
// const { ObjectId } = require('mongodb');
const {connectToDb, getDb } = require ('./db')

const app = express()
app.use(express.json()) //updated

// connecting to db.js
let db;

// Connect to the database
connectToDb((err) => {
    if (!err) {
        app.listen(4000, () => {
        console.log('app is listening to port 4000')
        })
        db = getDb();
    }
})

// routes to get all the data
app.get('/books', (req, res) => {
    let books = []
    // Querry the collection
    db.collection('books')
    .find()
    .sort({auther: 1})
    .forEach((book) => books.push(book))
    .then(() => {
        res.status(200).json(books)
    })
    .catch(() => {
        res.status(500).json({error: 'Could not fetch documents'})
    })

    // res.json({mssg: "welcome to my MongoDB API"})
})

// // Route to get a book by _id
app.get('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id); // Parse the id as an integer

    db.collection('books')
        .findOne({ _id: bookId }) // Query using integer _id
        .then((book) => {
            if (book) {
                res.status(200).json(book);
            } else {
                res.status(404).json({ error: 'Book not found' });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not fetch the book' });
        });
});

// Route to filter books by author
app.get('/books/author/:author', (req, res) => {
    const authorName = req.params.author; // Get the author from the URL
    
    db.collection('books')
        .find({ author: authorName }) // Query for books by author
        .toArray()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not fetch documents' });
        });
});

// Route to filter books by title
app.get('/books/title/:title', (req, res) => {
    const title = req.params.title;
    
    db.collection('books')
        .find({ title: title })
        .toArray()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not fetch documents' });
        });
});

// POST route to insert a new book
app.post('/books', (req, res) => {
    const newBook = req.body;  // Get the new book data from the request body

    // Validate the incoming data (you can expand this as needed)
    if (!newBook._id || !newBook.title || !newBook.categories || !newBook.author || !newBook.year) {
        return res.status(400).json({ error: 'ID, Title, categories, author, and year are required' });
    }

    // Insert the new book into the database
    db.collection('books')
        .insertOne(newBook)
        .then((result) => {
            res.status(201).json({ message: 'Book added successfully', bookId: result.insertedId });
        })
        .catch((err) => {
            console.error('Error inserting book:', err);
            res.status(500).json({ error: 'Could not insert the book' });
        });
});


// PUT route to update an existing book
app.put('/books/:id', (req, res) => {
    const bookId = req.params.id;  // Get the book ID from the URL parameter
    const updatedBook = req.body;   // Get the updated book data from the request body

    // Validate the incoming data 
    if (!updatedBook.title || !updatedBook.categories || !updatedBook.author || !updatedBook.year) {
        return res.status(400).json({ error: 'Title, categories, author, and year are required' });
    }

    // Update the book in the database
    db.collection('books')
        .updateOne({ _id: parseInt(bookId) }, { $set: updatedBook }) // Convert string ID to an integer
        .then((result) => {
            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.status(200).json({ message: 'Book updated successfully' });
        })
        .catch((err) => {
            console.error('Error updating book:', err);
            res.status(500).json({ error: 'Could not update the book' });
        });
});
 







