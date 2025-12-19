// confirmation.js

// Function to format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString); 
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Function to calculate the number of rental days
function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const timeDiff = endDate.getTime() - startDate.getTime(); 
    // Add 1 to include the last day
    const days = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;
    
    return days > 0 ? days : 1; 
}

// --- CORE FUNCTION: Fetch and Display Booking Details ---
async function displayConfirmationDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking'); 
    
    if (!bookingId) {
        console.error("No booking ID found in the URL.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/booking-details/${bookingId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.bookingDetails) {
            const details = data.bookingDetails;
            
            // Update UI elements
            document.getElementById('bookingIdDisplay').textContent = `#${details.booking_id}`;
            document.getElementById('carName').textContent = `${details.car_model} (${details.car_year})`;
            document.getElementById('pickupDate').textContent = formatDate(details.start_date);
            document.getElementById('returnDate').textContent = formatDate(details.end_date);
            document.getElementById('location').textContent = details.location || 'N/A'; 
            document.getElementById('customerName').textContent = `${details.customer_first_name} ${details.customer_last_name}`;
            document.getElementById('totalAmount').textContent = `$${parseFloat(details.total_price).toFixed(2)}`;

            console.log("Successfully loaded and displayed booking details.");
        } else {
            console.error("Failed to load booking details:", data.message);
        }

    } catch (error) {
        console.error("Network or Fetch Error:", error);
    }
}

// ----- Initialize page -----
document.addEventListener('DOMContentLoaded', displayConfirmationDetails);