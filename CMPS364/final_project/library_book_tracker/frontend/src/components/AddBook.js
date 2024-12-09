import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../App.css';

function AddBook({ setSuccessMessage }) {
    const [bookDetails, setBookDetails] = useState({
        title: "",
        author: "",
        genre: "",
        publicationYear: "",
        available: true, // Default value
    });

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookDetails({ ...bookDetails, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await axios.post("http://localhost:5000/books", bookDetails);
        if (response.data.message) {
            setSuccessMessage("Book added successfully");
            navigate("/"); // Redirect to home page
        }
        } catch (error) {
        console.error("Error adding book:", error);
        }
    };

    return (
        <div className="section">
        
            <form onSubmit={handleSubmit} className="search-form">
            <h2>Add New Book</h2>
                <label>
                Title:
                <input type="text" name="title" value={bookDetails.title} onChange={handleInputChange} required/>
                </label>
                <label>
                Author:
                <input type="text" name="author" value={bookDetails.author} onChange={handleInputChange} required/>
                </label>
                <label>
                Genre:
                <input type="text" name="genre" value={bookDetails.genre} onChange={handleInputChange} required/>
                </label>
                <label>
                Publication Year:
                <input type="number" name="publicationYear" value={bookDetails.publicationYear} onChange={handleInputChange} required/>
                </label>
                <label>
                Available:
                <select
                    name="available" value={bookDetails.available} onChange={(e) => setBookDetails({ ...bookDetails, available: e.target.value === "true" })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
                </label>
                <button type="submit" className="button">Submit</button>
            </form>
        </div>
    );
    }

export default AddBook;
