import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'; // Axios is used to make API requests
import Swal from 'sweetalert2'; // SweetAlert2 for showing alerts
//import ItemCard from "./ItemCard"; // You might import this if needed for future usage
import Spinner from "../../components/Spinner"; // Spinner component to show loading state
import Hcard from "../HomeCard/Hcard"; // Hcard component to display recommended items
import BackButton from "../../components/BackButton"; // BackButton component to navigate back to the previous page

const Cart = () => {
  const { CusID } = useParams(); // Extracts the 'CusID' from the route parameters
  const [cartItems, setCartItems] = useState([]); // State to hold cart items
  const [store, setStore] = useState([]); // State to hold the store items
  const [total, setTotal] = useState(0); // State to hold the total price of cart items
  const [promoCode, setPromoCode] = useState(""); // State to hold the entered promo code
  const [discount, setDiscount] = useState(0); // State to hold the discount amount
  const [loading, setLoading] = useState(true); // State to handle loading status

  const navigate = useNavigate(); // Hook for navigation

  // useEffect to fetch store data and cart items when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8076/store') // Fetch store data from API
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setStore(data); // Store the data if it's an array
        } else {
          console.warn('Data is not an array:', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching store data:', error); // Log error if any
      })
      .finally(() => setLoading(false)); // Set loading to false after request completes

    const cartData = JSON.parse(localStorage.getItem("cart")) || []; // Get cart items from local storage
    setCartItems(cartData); // Set cart items state
    calculateTotal(cartData); // Calculate total price of items in the cart
  }, []);

  // Function to calculate the total price of items in the cart
  const calculateTotal = (items) => {
    const totalAmount = items.reduce((acc, item) => acc + item.SPrice * item.quantity, 0); // Calculate total price
    setTotal(totalAmount); // Update total state
  };

  // Function to increase the quantity of an item in the cart
  const handleIncreaseQuantity = (ItemNo) => {
    const updatedCart = cartItems.map((item) =>
      item.ItemNo === ItemNo ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart); // Update cart state with increased quantity
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save updated cart to local storage
    calculateTotal(updatedCart); // Recalculate total
  };

  // Function to decrease the quantity of an item in the cart
  const handleDecreaseQuantity = (ItemNo) => {
    const updatedCart = cartItems.map((item) =>
      item.ItemNo === ItemNo && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updatedCart); // Update cart state with decreased quantity
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save updated cart to local storage
    calculateTotal(updatedCart); // Recalculate total
  };

  // Function to apply promo code and calculate discount
  const handleApplyPromo = () => {
    if (promoCode === "SAVE10") {
      setDiscount(total * 0.1); // Apply 10% discount if promo code is valid
    } else {
      setDiscount(0); // Set discount to 0 if promo code is invalid
      Swal.fire({
        title: 'Invalid promo code!', // Alert for invalid promo code
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // Function to handle the checkout process
  const handleCheckout = () => {
    const checkoutData = {
      userId: CusID, // Send user ID to checkout
      items: cartItems, // Send cart items
      total: total - discount, // Ensure total includes discount
    };
    navigate(`/checkout/${CusID}`, { state: checkoutData }); // Navigate to the checkout page
  };

  // Function to remove an item from the cart
  const handleRemoveItem = (ItemNo) => {
    const updatedCart = cartItems.filter(item => item.ItemNo !== ItemNo); // Filter out the item by ItemNo
    setCartItems(updatedCart); // Update cart state
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save updated cart to local storage
    calculateTotal(updatedCart); // Recalculate total
  };

  // Get recommended items that are not in the cart
  const recommendedItems = store.filter(
    (item) => !cartItems.some((cartItem) => cartItem.ItemNo === item.ItemNo)
  );

  // Show spinner while data is loading
  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <BackButton destination={`/ReadOneHome/${CusID}`} /> {/* Render the back button to go to the previous page */}
      <div className="min-h-screen p-8 flex flex-col items-center">
      
        <div className="w-full lg:w-3/4 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-10">
          <div className="w-full lg:w-2/3 space-y-6">
            <h1 className="text-3xl font-semibold mb-4">Your Cart</h1>
            {/* Render the cart items if available */}
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.ItemNo} className="flex items-center justify-between p-4 border-b">
                  <img src={item.image} alt={item.ItemName} className="w-16 rounded" />
                  <div className="flex-1 px-4">
                    <h3 className="text-xl font-semibold">{item.ItemName}</h3>
                    <p className="text-gray-600">Price: Rs.{item.SPrice}</p>
                    <div className="flex items-center space-x-4">
                      {/* Buttons to increase or decrease quantity */}
                      <button
                        onClick={() => handleDecreaseQuantity(item.ItemNo)}
                        className="text-gray-500 border px-2 rounded hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span>Quantity: {item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.ItemNo)}
                        className="text-gray-500 border px-2 rounded hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-gray-800 font-semibold">
                      Total: Rs.{(item.SPrice * item.quantity).toFixed(2)} {/* Total for the item */}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.ItemNo)} // Remove item from cart
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p> // Display message if the cart is empty
            )}
          </div>

          {/* Order summary and promo code section */}
          <div className="w-full lg:w-1/3 p-6 bg-gray-100 rounded-lg space-y-4">
            <h2 className="text-2xl font-semibold">Order Summary</h2>
            {/* If there's a discount, show the discount amount */}
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>Rs.{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Total:</span>
              <span>Rs.{(total).toFixed(2)}</span> {/* Display total amount */}
            </div>
            <input
              type="text"
              placeholder="Promo Code"
              className="w-full p-2 border rounded"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)} // Set promo code
            />
            <button
              onClick={handleApplyPromo} // Apply the promo code
              className="w-full bg-green-500 text-white py-2 rounded-full hover:bg-green-600 transition duration-300"
            >
              Apply Promo Code
            </button>
            <button
              className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition duration-300"
              onClick={handleCheckout} // Handle the checkout process
            >
              Checkout
            </button>
          </div>
        </div>

        {/* Section to display recommended items */}
        <div className="w-full lg:w-2/3 mt-16">
          <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
          <Hcard CusID={CusID} /> {/* Render recommended items using Hcard component */}
        </div>
      </div>
    </div>
  );
};

export default Cart;