function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    carId: urlParams.get('car'), 
    location: urlParams.get('location'),
    start: urlParams.get('start'),
    end: urlParams.get('end')
  };
}

// Function to generate star rating HTML
function generateStarRating(rating) {
  let stars = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '<i class="ri-star-fill"></i>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<i class="ri-star-half-fill"></i>';
    } else {
      stars += '<i class="ri-star-line"></i>';
    }
  }
  return stars;
}

function getFeatureIcon(feature) {
  // Normalize feature text to help with matching
  const lowerFeature = feature.toLowerCase();
  
  if (lowerFeature.includes('people') || lowerFeature.includes('seats')) {
    return 'ri-group-line'; // For passenger count
  }
  if (lowerFeature.includes('manual') || lowerFeature.includes('auto')) {
    return 'ri-steering-2-line'; // For transmission type (Autopilot/Manual)
  }
  if (lowerFeature.includes('km') || lowerFeature.includes('l') || lowerFeature.includes('mile')) {
    return 'ri-speed-up-line'; // For mileage/range/fuel efficiency
  }
  if (lowerFeature.includes('electric') || lowerFeature.includes('ev')) {
    return 'ri-flashlight-line'; // For electric cars
  }
  if (lowerFeature.includes('diesel') || lowerFeature.includes('gas') || lowerFeature.includes('petrol')) {
    return 'ri-gas-station-line'; // For fuel type
  }
  return 'ri-car-line'; // Default car icon for unmapped features
}

// Helper function to fetch cars from the backend
async function fetchCars(location, start, end) {
    try {
        const url = `http://localhost:3000/cars/search?location=${location}&start=${start}&end=${end}`;
        
        console.log("Attempting to fetch cars from:", url);
        
        const res = await fetch(url);
        
        if (!res.ok) {
            console.error(`HTTP error! status: ${res.status}`);
            return [];
        }
        
        const data = await res.json();

        if (data.success) {
            console.log("Cars fetched successfully. Count:", data.cars.length); 
            return data.cars;
        } else {
            console.error("Failed to fetch cars:", data.message);
            return [];
        }
    } catch (error) {
        console.error("Network error while fetching cars. Is server.js running on port 3000?", error);
        return [];
    }
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}


async function displaySearchResults() {
  const params = getUrlParams();
  const { location, start, end } = params;
  
  // 1. Inject the search criteria into the searchParams div (since they aren't separate elements)
  const searchParamsContainer = document.getElementById('searchParams');
  if (searchParamsContainer) {
      searchParamsContainer.innerHTML = `
              <div class="param-item">
                <strong>Location:</strong> ${location || 'N/A'}
              </div>
              <div class="param-item">
                <strong>Pick-up:</strong> ${formatDate(start || 'N/A')}
              </div>
              <div class="param-item">
                <strong>Return:</strong> ${formatDate(end || 'N/A')}
              </div>
      `;
  }

  const resultsGrid = document.getElementById('resultsGrid'); // Corrected ID usage
  const noResults = document.getElementById('noResults');
  
  // 2. Fetch cars from the backend
  const cars = await fetchCars(location, start, end);
  
  // 3. Handle results
  if (cars.length === 0) {
    if (resultsGrid) resultsGrid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    return;
  }
  
  if (resultsGrid) {
    resultsGrid.style.display = 'grid'; 
    resultsGrid.innerHTML = ''; // Clear existing content
  }
  if (noResults) noResults.style.display = 'none'; 
  
  const startParam = encodeURIComponent(start);
  const endParam = encodeURIComponent(end);

  // 4. Iterate over the fetched car data and render
  cars.forEach(car => {
    const carElement = document.createElement('div');
    carElement.className = 'deals__card'; 
    
    // Ensure car.price is treated as a number for toFixed
    const price = parseFloat(car.price);

    carElement.innerHTML = `
      <img src="${car.image}" alt="${car.name}" />
      <div class="deals__rating">
        ${generateStarRating(car.rating)}
        <span>(${car.reviews})</span>
      </div>
      <h4>${car.name}</h4>
      <div class="deals__card__grid">
        ${car.features.map(feature => `
            <div>
                <i class="${getFeatureIcon(feature)}"></i> ${feature}
            </div>
        `).join('')}
      </div>
      <hr />
      <div class="deals__card__footer">
        <h3>$${price.toFixed(2)}<span>/Per Day</span></h3>
        <a href="/html/booking.html?car=${car.id}&location=${location}&start=${startParam}&end=${endParam}">
          Rent Now
          <span><i class="ri-arrow-right-line"></i></span>
        </a>
        
      </div>
    `;
    if (resultsGrid) resultsGrid.appendChild(carElement);
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', displaySearchResults);