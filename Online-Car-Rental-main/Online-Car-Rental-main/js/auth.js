// auth.js

// 1. Function to handle the logout process
function handleLogout(event) {
    event.preventDefault();
    
    // Clear all stored authentication data, using the correct keys
    localStorage.removeItem('userId');
    // CORRECTED: Clearing first and last name instead of 'userName'
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');

    // Update UI and redirect
    updateAuthUI(); // Re-render the UI to show "Login / Sign Up"

}

// 2. Function to toggle the dropdown visibility
function toggleDropdown(event) {
    event.stopPropagation(); // Prevents click from immediately closing dropdown
    const dropdown = document.getElementById('profile-dropdown-content');
    dropdown.classList.toggle('show');
}

// 3. Function to update the navigation bar UI based on login status
function updateAuthUI() {
    // Get the container element in the navigation bar
    const authContainer = document.getElementById('nav-auth-container');
    if (!authContainer) return; // Safely exit if the element isn't present

    const userId = localStorage.getItem('userId');
    
    // CORRECTED: Fetch and combine the correct name keys
    const userFirstName = localStorage.getItem('userFirstName');
    const userLastName = localStorage.getItem('userLastName');
    
    // Determine the name to display in the UI (handle cases where one or both names might be missing)
    const displayUserName = (userFirstName && userLastName) 
                            ? `${userFirstName} ${userLastName}` 
                            : userFirstName || userLastName || 'User';

    if (userId) {
        // --- LOGGED IN STATE ---
        authContainer.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-btn" onclick="toggleDropdown(event)" title="Hi, ${displayUserName}" aria-label="Profile menu">
                    <i class="ri-user-line"></i>
                </button>
                <div class="dropdown-content" id="profile-dropdown-content">
                    <a href="/html/user-profile.html"><i class="ri-user-line"></i> Profile</a>
                    <a href="/html/user-bookings.html"><i class="ri-car-line"></i> My Bookings</a>
                    <a href="#" onclick="handleLogout(event)"><i class="ri-logout-box-r-line"></i> Logout</a>
                </div>
            </div>
        `;
    } else {
        // --- LOGGED OUT STATE ---
        authContainer.innerHTML = `
            <button class="btn" onclick="window.location.href='/html/login.html'">Login / Sign Up</button>
        `;
    }
}

// 4. Global initialization and click handler
document.addEventListener('DOMContentLoaded', updateAuthUI);

// Close dropdown if user clicks anywhere else on the page
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('profile-dropdown-content');
    const button = document.querySelector('.profile-btn');
    
    // Check if the click occurred outside both the button and the dropdown
    if (dropdown && button && !button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});