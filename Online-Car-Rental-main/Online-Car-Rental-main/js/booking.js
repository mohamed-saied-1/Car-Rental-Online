// Global variable to hold fetched car data
let currentCar = null;
let isSubmitting = false;

// ----- HELPER FUNCTIONS -----

// Function to calculate the number of rental days
function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    // Calculate difference in milliseconds
    const timeDiff = endDate.getTime() - startDate.getTime(); 
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return days > 0 ? days : 1; 
}

// Function to format the date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return dateString; 
}

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        carId: urlParams.get('car'),
        location: urlParams.get('location'),
        start: urlParams.get('start'),
        end: urlParams.get('end')
    };
}

// Function to calculate the base rental subtotal
function calculateBaseRentalSubtotal(pricePerDay, start, end) {
    const days = calculateDays(start, end);
    return pricePerDay * days;
}

// Function to get car data from the backend API
async function fetchCarDetails(carId) {
    try {
        const url = `http://localhost:3000/car/${carId}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        
        if (data.success && data.car) {
            currentCar = data.car;
            return data.car;
        } else {
            console.error("Failed to fetch car details:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Network error while fetching car details:", error);
        return null;
    }
}

// ----- CORE DISPLAY FUNCTION -----

async function displayBookingSummary() {
    const params = getUrlParams();
    const carId = params.carId;
    const location = params.location || 'N/A';
    
    const car = await fetchCarDetails(carId);
    const bookingSummary = document.getElementById('bookingSummary');

    if (!car) {
        bookingSummary.innerHTML = '<p class="error-message">Error: Car details could not be loaded.</p>';
        return;
    }
    
    // Calculations
    const days = calculateDays(params.start, params.end);
    const pricePerDay = parseFloat(car.price);
    const rentalSubtotal = calculateBaseRentalSubtotal(pricePerDay, params.start, params.end);
    
    // Fixed fee breakdown
    const insuranceFee = 50.00;
    const taxFee = 25.00;
    const fixedFee = insuranceFee + taxFee;
    const grandTotal = rentalSubtotal + fixedFee;

    // Render Summary
    bookingSummary.innerHTML = `
        <div class="booking-card">
            <div class="booking-card__image">
                <img src="${car.image}" alt="${car.name}" />
            </div>
            <div class="booking-card__details">
                <h3>${car.name}</h3>
                <div class="booking-info">
                    <div class="info-item">
                        <span class="info-label">Location:</span>
                        <span class="info-value">${location}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Pick-up:</span>
                        <span class="info-value">${formatDate(params.start)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Return:</span>
                        <span class="info-value">${formatDate(params.end)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Duration:</span>
                        <span class="info-value">${days} days</span>
                    </div>
                </div>
                <div class="price-summary">
                    <div class="price-item">
                        <span>$${pricePerDay.toFixed(2)} &times; ${days} days</span>
                        <span>$${rentalSubtotal.toFixed(2)}</span>
                    </div>
                    <div class="price-item">
                        <span>Insurance</span>
                        <span>$${insuranceFee.toFixed(2)}</span>
                    </div>
                    <div class="price-item">
                        <span>Tax & Fees</span>
                        <span>$${taxFee.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div class="price-total">
                        <span>Grand Total</span>
                        <span>$${grandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const totalPriceInput = document.getElementById('totalPrice');
    if (totalPriceInput) {
        totalPriceInput.value = grandTotal.toFixed(2);
    }
}

// ----- FORM SUBMISSION LOGIC -----

function autoFillUserData() {
    const fullNameField = document.getElementById('fullName');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    
    const userFirstName = localStorage.getItem('userFirstName');
    const userLastName = localStorage.getItem('userLastName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');

    if (fullNameField && userFirstName && userLastName) {
        fullNameField.value = `${userFirstName} ${userLastName}`;
    }
    if (emailField && userEmail) emailField.value = userEmail;
    if (phoneField && userPhone) phoneField.value = userPhone;
}

async function submitBooking(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const submitButton = document.getElementById('completeBookingBtn');
    const originalText = submitButton.innerHTML;
    
    // UI Loading State
    submitButton.innerHTML = '<i class="ri-loader-4-line spin"></i> Processing...';
    submitButton.disabled = true;
    isSubmitting = true;

    if (!currentCar) {
        alert("Car details not loaded.");
        isSubmitting = false;
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        return;
    }

    const userId = localStorage.getItem('userId');
    const params = getUrlParams();

    // Data Extraction
    const formData = {
        userId: userId,
        car_id: params.carId,
        start: params.start,
        end: params.end,
        location: params.location,
        totalPrice: parseFloat(document.getElementById('totalPrice').value),
        
        // Contact (From auto-filled fields)
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        nationalId: document.getElementById('nationalId').value,
        
        // Identity
        driverLicense: document.getElementById('driverLicense').value,
        licenseExpiry: document.getElementById('licenseExpiry').value,
        licenseCountry: document.getElementById('licenseCountry').value,
        
        // Payment (NEWLY ADDED)
        paymentMethod: document.getElementById('paymentMethod').value,
        
        // Agreements
        terms: document.getElementById('terms').checked,
        insurance: document.getElementById('insurance').checked,
        drivingRecord: document.getElementById('drivingRecord').checked
    };

    // Final Validation
    if (!formData.paymentMethod) {
        alert("Please select a payment method.");
        isSubmitting = false;
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('currentBookingId', data.bookingId);
            window.location.href = '/html/booking-confirmation.html?booking=' + data.bookingId;
        } else {
            alert("Booking failed: " + data.message);
        }
    } catch (err) {
        console.error("Booking error:", err);
        alert("Network error. Please ensure the server is running.");
    } finally {
        isSubmitting = false;
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// ----- Initialize page -----
document.addEventListener('DOMContentLoaded', () => {
    // Ensure hidden total price input exists
    if (!document.getElementById('totalPrice')) {
        const hiddenPriceInput = document.createElement('input');
        hiddenPriceInput.type = 'hidden';
        hiddenPriceInput.id = 'totalPrice';
        hiddenPriceInput.name = 'totalPrice';
        document.body.appendChild(hiddenPriceInput);
    }

    displayBookingSummary();
    autoFillUserData();

    // Set min date for license expiry
    const today = new Date().toISOString().split('T')[0];
    const licenseExpiryInput = document.getElementById('licenseExpiry');
    if (licenseExpiryInput) licenseExpiryInput.setAttribute('min', today);
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) bookingForm.addEventListener('submit', submitBooking);
});