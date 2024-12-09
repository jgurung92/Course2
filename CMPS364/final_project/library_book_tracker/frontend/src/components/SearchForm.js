import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const SearchForm = () => {
  const [searchType, setSearchType] = useState('id');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);

    try {
      let url = '';
      switch (searchType) {
        case 'id':
          url = `http://localhost:5000/books/${searchQuery}`;
          break;
        case 'title':
          url = `http://localhost:5000/books/title/${searchQuery}`;
          break;
        case 'author':
          url = `http://localhost:5000/books/author/${searchQuery}`;
          break;
        default:
          throw new Error('Invalid search type');
      }

      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setResults(data);
    } catch (err) {
      setError('No results found or an error occurred. Please try again.');
    }
  };

  return (
    <div className="section search-form">
      <h3>Search Books</h3>
      <form onSubmit={handleSearch}>
        <div className="">
          <label htmlFor="searchType">Search By:</label>
          <select
            id="searchType"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="id">ID</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="searchQuery">Enter: </label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Enter ${searchType}`}
            required
          />
        </div><br></br>

        <button type="submit" className='button'>Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="post-box">
        {results.length > 0 && (
          <ul className='post-list result-box'>
            {results.map((book) => (
              <li key={book._id}>
                <h3>{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Genre:</strong> {book.genre}</p>
                <p><strong>Published:</strong> {book.publicationYear}</p>
                <p><strong>Status:</strong>{' '}{book.isRented ? `Rented by ${book.rentedBy}` : 'Available'}</p> 
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
