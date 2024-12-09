import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all books from the backend
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/books');
                setBooks(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching books');
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="post-box">
            {books.map((book) => (
                <div key={book._id} className="post-list">
                    <h3>{book.title}</h3>
                    <p>Author: {book.author}</p>
                    <p>Genre: {book.genre}</p>
                    <p>Published: {book.publicationYear}</p>
                    <p>Status:{' '}{book.isRented ? `Rented by ${book.rentedBy}` : 'Available'}</p> 
                </div>
            ))}
        </div>
    );
};

export default BookList;
