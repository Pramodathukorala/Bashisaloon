import React, { useState, useEffect } from "react"; // Import React hooks: useState for state management and useEffect for lifecycle events
import axios from "axios"; // Import axios for making HTTP requests
import Swal from "sweetalert2"; // Import SweetAlert2 for displaying alerts
import Spinner from "../../components/Spinner"; // Import a custom Spinner component for loading indication
import BackButton from "../../components/BackButton"; // Import a custom BackButton component for navigation

const AllOrders = () => {
    const [orders, setOrders] = useState([]); // Initialize state for orders, initially an empty array
    const [loading, setLoading] = useState(true); // State to track loading status, initially true
    const [expandedOrders, setExpandedOrders] = useState({}); // State for tracking which orders are expanded

    useEffect(() => {
        setLoading(true); // Set loading to true when the component mounts
        axios
            .get("http://localhost:8076/order") // Make a GET request to fetch orders from the server
            .then((response) => {
                const data = response.data; // Extract data from the response
                if (Array.isArray(data)) { // Check if the response data is an array
                    setOrders(data); // Set the orders state with the fetched data
                } else {
                    setOrders([]); // If data is not an array, set orders to an empty array
                }
                setLoading(false); // Set loading to false after data is fetched
            })
            .catch((error) => {
                console.error("Error fetching data:", error); // Log any error during the request
                setOrders([]); // Reset orders to an empty array in case of an error
                setLoading(false); // Set loading to false after the error
            });
    }, []); // Empty dependency array ensures this effect runs only once on mount

    const handleToggleExpand = (orderId) => {
        setExpandedOrders((prevState) => ({
            ...prevState, // Spread the previous state to retain the current expanded orders
            [orderId]: !prevState[orderId], // Toggle the expanded state for the specific orderId
        }));
    };

    // const handleUpdateOrder = (order) => {
    //     Swal.fire("Update Order", `Order ID: ${order._id} updated.`, "success");
    // }; // Commented out function to handle order updates, showing a success message

    const handleDeleteOrder = (orderId) => {
        Swal.fire({
            title: "Are you sure?", // Display a confirmation dialog for deletion
            text: "This action cannot be undone!",
            icon: "warning", // Warning icon for the dialog
            showCancelButton: true, // Show cancel button in the dialog
            confirmButtonColor: "#d33", // Color for the confirm button
            cancelButtonColor: "#3085d6", // Color for the cancel button
            confirmButtonText: "Yes, delete it!", // Text for the confirm button
        }).then((result) => {
            if (result.isConfirmed) { // If the user confirms deletion
                axios
                    .delete(`http://localhost:8076/order/${orderId}`) // Send DELETE request to delete the order
                    .then(() => {
                        Swal.fire("Deleted!", "The order has been deleted.", "success"); // Show success message

                        // Reload the orders from the server after deletion
                        axios
                            .get("http://localhost:8076/order") // Fetch the updated orders list
                            .then((response) => {
                                const data = response.data;
                                if (Array.isArray(data)) {
                                    setOrders(data); // Update the orders list with the new data
                                } else {
                                    setOrders([]); // Reset orders if no data is found
                                }
                            })
                            .catch((error) => {
                                console.error("Error fetching data after deletion:", error); // Log any error during the fetch
                            });
                    })
                    .catch((error) => {
                        Swal.fire("Error", "There was an error deleting the order.", "error"); // Show error message
                        console.error("Error deleting order:", error); // Log the error
                    });
            }
        });
    };

    const handleDownloadBill = (order) => {
        Swal.fire("Download Bill", `Bill for Order ID: ${order._id} downloaded.`, "success"); // Display success message for downloading a bill
    };

    return (
        <div className="min-h-screen p-8 w-full lg:w-3/4 mx-auto"> {/* Main container with padding and responsive width */}
            <BackButton destination={`/store`} /> {/* Back button to navigate to the store page */}

            <h1 className="text-3xl font-bold mb-6">All Orders</h1> {/* Page title */}
            {loading ? ( // Conditional rendering based on loading state
                <Spinner /> // Show spinner when loading is true
            ) : orders.length > 0 ? ( // Check if there are any orders
                orders.map((order) => ( // Iterate over the orders array
                    <div
                        key={order.orderId} // Unique key for each order
                        className="border border-gray-300 p-4 mb-4 rounded-lg shadow-md relative" // Styling for the order card
                    >
                        <h2 className="text-xl font-semibold mb-2">Order ID: {order.orderId}</h2> {/* Display the order ID */}
                        <p className="text-gray-600 mt-2">
                            Order Date: {new Date(order.createdAt).toLocaleDateString()} {/* Format and display order date */}
                        </p>
                        <div className="flex space-x-4 mt-4"> {/* Flexbox for displaying ordered items */}
                            {order.items.map((item) => ( // Iterate over the items in each order
                                <div key={item.ItemNo} className="text-center flex flex-col items-center"> {/* Flexbox for individual items */}
                                    <img
                                        src={item.image} // Display item image
                                        alt={item.ItemName} // Alt text for the image
                                        className="w-20 h-20 object-cover rounded-lg shadow-md" // Image styling
                                    />
                                    <p className="text-gray-700 font-medium mt-2">{item.ItemName}</p> {/* Display item name */}
                                </div>
                            ))}
                        </div>

                        {expandedOrders[order._id] && ( // Conditional rendering for expanded order details
                            <div className="mt-4">
                                <div className="flex flex-row items-start justify-between gap-8 border-t pt-4"> {/* Flexbox layout for order details */}
                                    <div className="flex-1 pr-4 border-r border-gray-300"> {/* Section for item details */}
                                        <h3 className="text-lg font-semibold mb-2">Items:</h3>
                                        <ul className="list-disc pl-5 mb-2">
                                            {order.items.map((item) => ( // List each item
                                                <li key={item.ItemNo} className="text-gray-700">
                                                   Price: Rs.{(item.SPrice).toFixed(2)} {/* Display item price */}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex-1 px-4 border-r border-gray-300"> {/* Section for customer information */}
                                        <h3 className="text-lg font-semibold mb-2">
                                            Customer Information:
                                        </h3>
                                        <p>Name: {order.customerInfo.FirstName}</p> {/* Display customer name */}
                                        <p>Email: {order.customerInfo.Email}</p> {/* Display customer email */}
                                        <p>Mobile: {order.customerInfo.ContactNo}</p> {/* Display customer contact number */}
                                    </div>

                                    <div className="flex-1 pl-4"> {/* Section for delivery or dine-in information */}
                                        {order.deliveryInfo?.address ? ( // Check if delivery info is available
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">
                                                    Delivery Information:
                                                </h3>
                                                <p>Address: {order.deliveryInfo.address}</p> {/* Display delivery address */}
                                                <p>City: {order.deliveryInfo.city}</p> {/* Display city */}
                                                <p>Postal Code: {order.deliveryInfo.postalCode}</p> {/* Display postal code */}
                                                <p>Delivery Method: Delivery</p> {/* Delivery method */}
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">
                                                    Dine-in Information:
                                                </h3>
                                                <p>Dine-in Method: Dine-In</p> {/* Display dine-in info */}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 mt-2">
                                    Payment Method: {order.paymentMethod} {/* Display payment method */}
                                </p>
                                <div className="flex space-x-2 mt-4"> {/* Buttons for actions */}
                                    {/* <button
                                        onClick={() => handleUpdateOrder(order)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                    >
                                        Update
                                    </button> */} {/* Commented out Update button */}
                                    <button
                                        onClick={() => handleDeleteOrder(order.orderId)} // Delete button with click handler
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                    {/* <button
                                        onClick={() => handleDownloadBill(order)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        Download Bill
                                    </button> */} {/* Commented out Download Bill button */}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => handleToggleExpand(order._id)} // Button to expand or collapse order details
                            className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        >
                            {expandedOrders[order.orderId] ? "Show Less" : "Show More"} {/* Toggle text based on expanded state */}
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-center">No orders found</p> // Display message if no orders are available
            )}
        </div>
    );
};

export default AllOrders; // Export the AllOrders component for use in other parts of the app
