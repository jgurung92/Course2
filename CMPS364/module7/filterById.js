const express = require('express')
const { ObjectId } = require('mongodb');
const {connectToDb, getDb } = require ('./db')

const app = express()

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

// routes
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
