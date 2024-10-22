const express = require('express')
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