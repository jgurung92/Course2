import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // Ensure CSS is applied globally or scoped correctly

const SearchYear = () => {
  const [year, setYear] = useState('');
  const [filterType, setFilterType] = useState('before'); // 'before' or 'after'
  const [books, setBooks] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!year) {
      alert('Please enter a year!');
      return;
    }
  
    try {
      const response = await axios.get(
        `http://localhost:5000/books/published/${filterType}/${year}`
      );
      console.log('API Response:', response.data); // Debugging log
  
      // Set the books state with only the "books" array
      setBooks(response.data.books);
      console.log('Books State:', response.data.books); // Confirm state update
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('Failed to fetch books. Please try again.');
    }
  };

  return (
    <div className='section'>
      <h3>Filter Books by Year</h3>



      <form className='search-form'  onSubmit={handleSearch}>
        <label>
          Filter:
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} >
            <option value="before">Before</option>
            <option value="after">After</option>
          </select>
        </label><br></br>

        <input 
          type="number"
          placeholder="Enter year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        /><br></br>

        <button type="submit" className='button' >Search</button>
      </form>



        <div className="post-box">
            {books.length > 0 ? (           
                books.map((book) => (
                    <ul className='post-list result-box'  key={book._id} >
                            <h3>{book.title}</h3>
                            <p><strong>Author:</strong> {book.author}</p>
                            <p><strong>Genre:</strong> {book.genre}</p>
                            <p><strong>Published:</strong> {book.publicationYear}</p>
                            <p><strong>Status:</strong> {' '}{book.isRented ? `Rented by ${book.rentedBy}` : 'Available'}</p>  
                    </ul>
                ))
            ) : (
            <p>No books found for the selected year filter.</p>
            )}
        </div>
    </div>
  );
};

export default SearchYear;
