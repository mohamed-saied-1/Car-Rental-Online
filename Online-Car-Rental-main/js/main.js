const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

ScrollReveal().reveal(".header__image img", {
  ...scrollRevealOption,
  origin: "right",
});
ScrollReveal().reveal(".header__content h2", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".header__content .section__description", {
  ...scrollRevealOption,
  delay: 1500,
});

ScrollReveal().reveal(".header__form form", {
  ...scrollRevealOption,
  delay: 2000,
});

ScrollReveal().reveal(".about__card", {
  ...scrollRevealOption,
  interval: 500,
});

const tabs = document.querySelector(".deals__tabs");

tabs.addEventListener("click", (e) => {
  const tabContents = document.querySelectorAll(
    ".deals__container .tab__content"
  );
  Array.from(tabs.children).forEach((item) => {
    if (item.dataset.id === e.target.dataset.id) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  tabContents.forEach((item) => {
    if (item.id === e.target.dataset.id) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
});

ScrollReveal().reveal(".choose__image img", {
  ...scrollRevealOption,
  origin: "left",
});
ScrollReveal().reveal(".choose__content .section__header", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".choose__content .section__description", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".choose__card", {
  duration: 1000,
  delay: 1500,
  interval: 500,
});

ScrollReveal().reveal(".subscribe__image img", {
  ...scrollRevealOption,
  origin: "right",
});
ScrollReveal().reveal(".subscribe__content .section__header", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".subscribe__content .section__description", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".subscribe__content form", {
  ...scrollRevealOption,
  delay: 1500,
});

const swiper = new Swiper(".swiper", {
  slidesPerView: 3,
  spaceBetween: 20,
  loop: true,
});
// 

// --- DEALS SECTION LINKS (Keep existing) ---
// Function to generate booking URL with current dates
function generateBookingUrl(carId) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];
    
    // Default location 'Cairo' is used for the home page deals section
    return `/html/booking.html?car=${carId}&location=Cairo&start=${startDate}&end=${endDate}`;
}

// Update all Rent Now links when page loads and implement search form handler
document.addEventListener('DOMContentLoaded', function() {
    const rentNowLinks = document.querySelectorAll('.deals__card__footer a[href="#"]');
    
    rentNowLinks.forEach(link => {
        // Find the car card and determine which car it is
        const card = link.closest('.deals__card');
        const carName = card.querySelector('h4').textContent;
        
        // Map car names to IDs based on your database inserts (car_rental_db.sql)
        const carMap = {
            'Tesla Model S': 1,
            'Tesla Model E': 2,
            'Tesla Model Y': 3,
            'Mirage': 4,
            'Xpander': 5,
            'Pajero Sports': 6,
            'Mazda CX5': 7,
            'Mazda CX-30': 8,
            'Mazda CX-9': 9,
            'Corolla': 10,
            'Innova': 11,
            'Fortuner': 12,
            'Amaze': 13,
            'Elevate': 14, 
            'City': 15,
        };
        
        // Get the car ID based on the title. Default to 1 if not found.
        const carId = carMap[carName.trim()] || 1; 

        // Update the link href
        link.href = generateBookingUrl(carId);
    });
    
    // --- NEW LOGIC: Handle search form submission to fix missing query parameters ---
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault(); // end the default form submission (GET request)

            // Get values from the form inputs using the correct IDs from index.html
            const location = document.getElementById('location').value;
            const start = document.getElementById('start').value;
            const end = document.getElementById('end').value;

            // Basic validation: Check if fields are selected
            if (!location || !start || !end) {
                alert("Please select a location, pickup date, and return date.");
                return;
            }

            // Construct the search results URL with query parameters
            const url = `/html/search.html?location=${encodeURIComponent(location)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

            // Redirect the user to the search results page
            window.location.href = url;
        });
    }
    
    // Also, attach logic for the Deals Tabs
    const dealsTabs = document.querySelector(".deals__tabs");
    const tabContents = document.querySelectorAll(".tab__content");

    if (dealsTabs) {
        dealsTabs.addEventListener("click", (e) => {
            const clickedButton = e.target.closest("button");
            
            if (clickedButton) {
                // Remove active class from all buttons and add to the clicked one
                dealsTabs.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
                clickedButton.classList.add("active");

                // Get the ID of the content to display
                const contentId = clickedButton.getAttribute("data-id");

                // Hide all content and show the matching one
                tabContents.forEach(content => {
                    if (content.id === contentId) {
                        content.classList.add("active");
                    } else {
                        content.classList.remove("active");
                    }
                });
            }
        });
    }
});

