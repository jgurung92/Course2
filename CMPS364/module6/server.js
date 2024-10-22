const express = require('express')
const {connectToDb, getDb } = require ('./db')

const app = express()

// connecting to db.js
let db;

// Connect to the database
connectToDb((err) => {
    if (!err) {
        db = getDb(); //assign connected database to db variable

        // Start the Server
    app.listen(4000, () => {
        console.log('app is listening to port 4000')
    })
    }else {
    console.log('Failed to connect to the database:', err)
    }
})

// routes
app.get('/books', (req, res) => {
    let books = []

    if (!db) {
        return res.status(500).json({error:'Database connection not established'})
    }

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