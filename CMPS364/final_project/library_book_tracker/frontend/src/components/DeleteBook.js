
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeleteBook = ({ setSuccessMessage }) => {
    const [searchType, setSearchType] = useState('title'); // 'title' or 'author'
    const [searchQuery, setSearchQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Fetch books based on title or author
    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery) {
            setErrorMessage('Please enter a search query.');
            return;
        }

        try {
            const endpoint =
                searchType === 'title'
                    ? `http://localhost:5000/books/title/${encodeURIComponent(searchQuery)}`
                    : `http://localhost:5000/books/author/${encodeURIComponent(searchQuery)}`;

            const response = await axios.get(endpoint);
            setBooks(response.data); // Populate books array
            setErrorMessage(''); // Clear any previous error messages
        } catch (error) {
            console.error('Error fetching books:', error);
            setErrorMessage(
                error.response?.data?.message || 'No books found for the given query.'
            );
        }
    };

    // Delete a book by title or author
    const handleDelete = async () => {
        try {
            const endpoint =
                searchType === 'title'
                    ? `http://localhost:5000/books/title/${encodeURIComponent(searchQuery)}`
                    : `http://localhost:5000/books/author/${encodeURIComponent(searchQuery)}`;

            const response = await axios.delete(endpoint);
            if (response.data.acknowledged && response.data.deletedCount > 0) {
                setSuccessMessage('Book deleted successfully!');
                setBooks([]); // Clear the books array
                setSearchQuery(''); // Reset search query
                navigate('/'); // Redirect to home page
            } else {
                setErrorMessage('No book found to delete.');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            setErrorMessage(
                error.response?.data?.message || 'An error occurred while deleting the book.'
            );
        }
    };

    return (
        <div className="section">
            <h2>Delete Book</h2>
            <form onSubmit={handleSearch} className="search-form">
                <div>
                    <label htmlFor="searchType">Search By:</label>
                    <select
                        id="searchType"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="searchQuery">Search Query:</label>
                    <input
                        type="text"
                        id="searchQuery"
                        name="searchQuery"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Enter book ${searchType}`}
                        required
                    />
                </div>
                <button type="submit" className="button">
                    Search
                </button>
            </form>

            {errorMessage && <p className="error">{errorMessage}</p>}

            {books.length > 0 && (
                <div className="post-box">
                    <h3>Matching Books</h3>
                    <ul className="post-list">
                        {books.map((book) => (
                            <li key={book._id}>
                                <p>
                                    <strong>{book.title}</strong> by {book.author}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {books.length > 0 && (
                <button onClick={handleDelete} className="button">
                    Delete Book
                </button>
            )}
        </div>
    );
};

export default DeleteBook;
















