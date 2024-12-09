import React from 'react';
import BookList from './components/BookList'; // Import the BookList component
import SearchForm from './components/SearchForm';
import SearchYear from './components/SearchYear';

import './App.css';


const App = () => {
  return (
    <div className="App">
      <h1>Library Books Management</h1>
        <div className='container'>
          <SearchForm /> {/* Render the Search Form */}
          <SearchYear /> {/* Render the Search Year */}
        </div>
      <BookList /> {/* Render the BookList component */}
    </div>
  );
};

export default App;


















