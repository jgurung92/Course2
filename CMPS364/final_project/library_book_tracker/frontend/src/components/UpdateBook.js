// src/components/UpdateBook.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UpdateBook = () => {
    const [bookId, setBookId] = useState('');
    const [bookDetails, setBookDetails] = useState({
        title: '',
        author: '',
        genre: '',
        publicationYear: '',
        isRented: false,
        rentedBy: '', // Default to empty string for rentedBy
        isReturned: false // Add isReturned to track return status
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle the search for the book by ID
    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!bookId) {
        setError('Please enter a book ID.');
        return;
        }

        try {
        const response = await axios.get(`http://localhost:5000/books/${bookId}`);
        const data = response.data;

        if (data) {
            setBookDetails({
            title: data.title,
            author: data.author,
            genre: data.genre,
            publicationYear: data.publicationYear,
            isRented: data.isRented,
            rentedBy: data.rentedBy || '', // If rentedBy is null, set it to an empty string
            isReturned: data.isReturned || false // Initialize isReturned field
            });
        } else {
            setError('Book not found.');
        }
        } catch (err) {
        setError('Error fetching book details.');
        }
    };

    // Handle the form submission to update the book
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
        // Prepare the updated book data
        const updatedBook = {
            title: bookDetails.title,
            author: bookDetails.author,
            genre: bookDetails.genre,
            publicationYear: bookDetails.publicationYear,
            isRented: bookDetails.isRented,
            rentedBy: bookDetails.isRented ? bookDetails.rentedBy : '', // Only set rentedBy if isRented is true
            isReturned: bookDetails.isReturned
        };

        // Update the book details in the database
        await axios.put(`http://localhost:5000/books/${bookId}`, updatedBook);

        // If the book is rented, update the rental status
        if (bookDetails.isRented) {
            await axios.put(`http://localhost:5000/books/rent/${bookId}`, {
            rentedBy: bookDetails.rentedBy
            });
        } else {
            await axios.put(`http://localhost:5000/books/return/${bookId}`);
        }

        // Redirect to the home page after update
        navigate('/');
        // Display success message on the home page
        alert('Book updated successfully.');
        } catch (err) {
        setError('Error updating book details.');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBookDetails((prevDetails) => ({
        ...prevDetails,
        [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="section">
        <h2>Update Book</h2>

        {/* Search by Book ID */}
        <form onSubmit={handleSearch} className='search-form'>
            <div>
            <label htmlFor="bookId">Enter Book ID: </label>
            <input type="text" id="bookId" value={bookId} onChange={(e) => setBookId(e.target.value)} required/>
            </div>
            <button type="submit" className="button">Search</button>
        </form> 

        {/* Display error message if any */}
        {error && <p className="error">{error}</p>} <br></br><br></br>

        {/* Update Book Form */}
        {bookId && !error && (
            <form onSubmit={handleSubmit} className='search-form'><br></br>
            <div>
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" name="title" value={bookDetails.title} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="author">Author:</label>
                <input type="text" id="author" name="author" value={bookDetails.author} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="genre">Genre:</label>
                <input type="text" id="genre" name="genre" value={bookDetails.genre} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="publicationYear">Publication Year:</label>
                <input type="number" id="publicationYear" name="publicationYear" value={bookDetails.publicationYear} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="isRented">Is Rented:</label>
                <input type="checkbox" id="isRented" name="isRented" checked={bookDetails.isRented} onChange={handleChange}/>
            </div>
            {bookDetails.isRented && (
                <div>
                <label htmlFor="rentedBy">Rented By:</label>
                <input type="text" id="rentedBy" name="rentedBy" value={bookDetails.rentedBy} onChange={handleChange} placeholder="Name" required/>
                </div>
            )}
            <div>
                <label htmlFor="isReturned">Is Returned:</label>
                <input type="checkbox" id="isReturned" name="isReturned" checked={bookDetails.isReturned} onChange={handleChange}/>
            </div>
            <button type="submit" className="button">Update Book</button>
            </form>
        )}
        </div>
    );
};

export default UpdateBook;







