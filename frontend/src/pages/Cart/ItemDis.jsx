import React, { useState, useEffect } from 'react'; // Import React and hooks for state and lifecycle management
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks for accessing URL parameters and navigation
import Swal from 'sweetalert2'; // Import SweetAlert2 for displaying popup alerts
import axios from 'axios'; // Import Axios for making HTTP requests
import Hcard from '../HomeCard/Hcard'; // Import the Hcard component to display recommended items
import BackButton from '../../components/BackButton'; // Import a BackButton component for navigation

const ItemDis = () => {
    const { ItemNo, CusID } = useParams();  // Extract ItemNo and CusID from the URL parameters
    const navigate = useNavigate();  // Initialize the navigation function from React Router
    const [store, setStore] = useState([]);  // Declare a state variable to hold store items
    const [quantity, setQuantity] = useState(1);  // Declare a state variable to track the selected quantity of the item
    const [loading, setLoading] = useState(true);  // Declare a state variable to handle loading state

    useEffect(() => {
        // Fetch store data from the API when the component loads
        axios.get('http://localhost:8076/store')
            .then((response) => {
                const data = response.data;
                if (Array.isArray(data)) {
                    setStore(data); // If the data is an array, set it in the store state
                } else {
                    console.warn('Data is not an array:', data); // Warn if the data fetched is not an array
                    setStore([]); // Set the store to an empty array if the data is invalid
                }
                setLoading(false); // Disable loading state once data is fetched
            })
            .catch((error) => {
                console.error('Error fetching store data:', error); // Log any errors while fetching the data
                setStore([]); // Set the store to an empty array on error
                setLoading(false); // Disable loading state after error handling
            });
    }, []); // The effect runs only once when the component is mounted

    const itemdis = store.find((item) => item.ItemNo.toString() === ItemNo);  // Find the item with matching ItemNo from the store array

    const handleIncrease = () => setQuantity(quantity + 1);  // Function to increase the quantity of the item
    const handleDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);  // Function to decrease the quantity but never below 1
    };

    const handleAddToCart = () => {
        try {
            if (!itemdis) {
                // Display an error alert if the item is not found
                Swal.fire({
                    title: 'Error!',
                    text: 'Item details are not available.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                return; // Exit the function if item details are not available
            }
    
            // Create an object representing the item to add to the cart
            const cartItem = {
                userId: CusID,  // Include the CusID from the URL
                ItemNo: itemdis.ItemNo,  // Item number
                ItemName: itemdis.ItemName,  // Item name
                image: itemdis.image,  // Item image URL
                SPrice: itemdis.SPrice,  // Item price
                quantity,  // Quantity selected by the user
            };
    
            // Retrieve the current cart from localStorage or create an empty array if it doesn't exist
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push(cartItem);  // Add the new item to the cart
            localStorage.setItem('cart', JSON.stringify(cart));  // Save the updated cart to localStorage
    
            // Show a success message with an option to go to the cart or continue shopping
            Swal.fire({
                title: 'Item added to cart successfully!',
                text: 'Would you like to view your cart or add more items?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Go to Cart',
                cancelButtonText: 'Add More',
            }).then((result) => {
                if (result.isConfirmed) {
                    // If the user clicks 'Go to Cart', navigate to the cart page with CusID in the URL
                    window.location.href = `/cart/${CusID}`;
                }
            });
        } catch (error) {
            // Show an error message if something goes wrong while adding the item to the cart
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while adding the item to the cart. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };
    


    if (loading) {
        return <div>Loading...</div>;  // Display a loading message while data is being fetched
    }

    if (!itemdis) {
        return <div>Item not found</div>;  // Display an error if no item matches the ItemNo in the store
    }

    // Filter recommended items by excluding the currently displayed item
    const recommendedItems = store.filter((item) => item.ItemNo !== parseInt(ItemNo, 10));

    return (
        <div>
            <BackButton destination={`/ReadOneHome/${CusID}`} />  {/* Render the back button to go to the previous page */}

            <div className="min-h-screen p-8 flex flex-col items-center">
                <div className="w-2/3 flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-10">
                    <div className="w-full lg:w-1/2">
                        <img
                            className="rounded-xl w-full transition-transform duration-300 transform hover:scale-105"
                            src={itemdis?.image}  // Display the image of the current item
                            alt={itemdis?.ItemName}  // Set the alt text to the item name
                        />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h1 className="text-4xl font-semibold">{itemdis?.ItemName}</h1>  {/* Display the item name */}
                        <p className="text-lg text-gray-600">{itemdis?.Description}</p>  {/* Display the item description */}
                        <h2 className="text-2xl font-semibold">Rs.{itemdis?.SPrice}</h2>  {/* Display the item price */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleDecrease}  // Decrease the quantity
                                className="px-4 py-2 bg-gray-200 rounded-full"
                            >
                                -
                            </button>
                            <span className="text-xl">{quantity}</span>  {/* Display the current quantity */}
                            <button
                                onClick={handleIncrease}  // Increase the quantity
                                className="px-4 py-2 bg-gray-200 rounded-full"
                            >
                                +
                            </button>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddToCart}  // Add the item to the cart
                                className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-2/3 mt-16">
                    <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>  {/* Heading for recommended items */}
                    <Hcard CusID={CusID} />  {/* Render recommended items using Hcard component */}
                </div>
            </div>
        </div>
    );
};

export default ItemDis;  // Export the ItemDis component for use in other parts of the application
