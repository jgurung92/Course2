
import React, { useState } from "react"; // Import useState
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import BookList from './components/BookList'; // Import the BookList component
import SearchForm from './components/SearchForm'; // Import the SearchForm component
import SearchYear from './components/SearchYear'; // Import the SearchYear component
import AddBook from "./components/AddBook";
import UpdateBook from "./components/UpdateBook"; // Import UpdateBook component
import DeleteBook from './components/DeleteBook';

import './App.css';

const App = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [showSearchYear, setShowSearchYear] = useState(false); // Toggle Search Year

  return (
    <Router>
      <div className="App">
        <h1>Library Books Management</h1>

        <nav class="navigation-buttons">
          <Link to="/">Home</Link> 
          <Link to="/add-book">Add Book</Link>
          <Link to="/update-book">Update Book</Link>
          <Link to="/delete-book">Delete Book</Link>
          <button
            className="nav-button"
            onClick={() => setShowSearchYear(!showSearchYear)} // Toggle Filter Books by Year
          >
            {showSearchYear ? "Hide Filter by Year" : "Filter by Year"}
          </button>
        </nav>

        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}

        {/* Toggleable Filter Books by Year Form */}
        {showSearchYear && (<SearchYear /> )}

        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <>
                <div > 
                  <SearchForm /> {/* Render the Search Form */}
                </div> 
                <BookList /> {/* Render the BookList component */}
              </>
            }
          />
          {/* Add Book Route */}
          <Route
            path="/add-book"
            element={<AddBook setSuccessMessage={setSuccessMessage} />}
          />
          <Route
            path="/update-book"
            element={<UpdateBook />} // Add Update Book Route
          />
          <Route
            path="/delete-book"
            element={<DeleteBook setSuccessMessage={setSuccessMessage} />}
          />
        </Routes>
      </div>
    </Router>
  );

};

export default App;


















