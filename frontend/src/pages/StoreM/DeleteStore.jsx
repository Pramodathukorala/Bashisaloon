import React, { useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';

const DeleteStore = () => {
  // State to manage loading status while deletion is being processed
  const [loading, setLoading] = useState(false);
  
  // `useNavigate` hook to programmatically navigate to another route after deletion
  const navigate = useNavigate();
  
  // `useParams` hook to retrieve the dynamic `id` from the URL params
  const { id } = useParams();

  // Function to handle the deletion of the item
  const handleDeleteStore = async () => {
    try {
      setLoading(true); // Set loading to true while the deletion is in process
      
      // Perform a DELETE request to the backend using the provided item `id`
      await axios.delete(`http://localhost:8076/store/${id}`);
      
      setLoading(false); // Set loading to false once the deletion is complete
      
      // Navigate to the store listing page after successful deletion
      navigate('/store');
    } catch (error) {
      setLoading(false); // Ensure loading is set to false even if an error occurs
      
      // Log the error to the console for debugging purposes
      console.error(error);
      
      // Show an alert if the deletion process fails
      alert('An error occurred while deleting the item. Please check the console.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1f2937' }}>
      <div style={{ padding: '2rem', maxWidth: '600px', backgroundColor: '#2d3748', borderRadius: '10px', color: '#fff' }}>
        {/* Title for the delete confirmation page */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Delete Item</h1>
        
        {/* Warning message to confirm the deletion action */}
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Are you sure you want to delete this item?</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Button to trigger the deletion of the item */}
          <button
            onClick={handleDeleteStore}
            style={{ backgroundColor: '#dc3545', color: 'white', padding: '0.8rem 2rem', borderRadius: '5px', cursor: 'pointer', border: 'none', marginRight: '1rem' }}>
            {/* Display "Deleting..." text while the deletion is in process */}
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          
          {/* Cancel button that links back to the store page without deleting */}
          <Link
            to={'/store'}
            style={{ backgroundColor: '#007bff', color: 'white', padding: '0.8rem 2rem', borderRadius: '5px', textDecoration: 'none' }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeleteStore;
