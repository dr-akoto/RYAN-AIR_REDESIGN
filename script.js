// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Set minimum date for flight search
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const departDateInput = document.getElementById('departDate');
const returnDateInput = document.getElementById('returnDate');

if (departDateInput) {
    const minDate = today.toISOString().split('T')[0];
    departDateInput.setAttribute('min', minDate);
    
    departDateInput.addEventListener('change', () => {
        const selectedDate = new Date(departDateInput.value);
        const minReturnDate = new Date(selectedDate);
        minReturnDate.setDate(minReturnDate.getDate() + 1);
        
        if (returnDateInput) {
            returnDateInput.setAttribute('min', minReturnDate.toISOString().split('T')[0]);
            
            // Clear return date if it's before the new minimum
            if (returnDateInput.value && new Date(returnDateInput.value) < minReturnDate) {
                returnDateInput.value = '';
            }
        }
    });
}

// Trip Type Toggle
const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
const returnDateGroup = document.getElementById('returnDateGroup');

tripTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'oneway') {
            returnDateGroup.style.opacity = '0.5';
            returnDateInput.required = false;
            returnDateInput.disabled = true;
        } else {
            returnDateGroup.style.opacity = '1';
            returnDateInput.required = true;
            returnDateInput.disabled = false;
        }
    });
});

// Flight Search Form Submission
const flightSearchForm = document.getElementById('flightSearchForm');

if (flightSearchForm) {
    flightSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            tripType: document.querySelector('input[name="tripType"]:checked').value,
            origin: document.getElementById('origin').value,
            destination: document.getElementById('destination').value,
            departDate: document.getElementById('departDate').value,
            returnDate: document.getElementById('returnDate').value,
            passengers: document.getElementById('passengers').value,
            class: document.getElementById('class').value
        };
        
        // Store search data in sessionStorage
        sessionStorage.setItem('flightSearch', JSON.stringify(formData));
        
        // Redirect to results page
        window.location.href = 'results.html';
    });
}

// Generate sample flight data
function generateFlights(origin, destination) {
    const airlines = ['Ryan Air', 'Sky Express', 'Air Connect'];
    const flights = [];
    
    // Generate 5-8 sample flights
    const numFlights = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < numFlights; i++) {
        const departHour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
        const departMinute = Math.random() < 0.5 ? '00' : '30';
        const duration = Math.floor(Math.random() * 4) + 2; // 2-6 hours
        
        const arriveHour = (departHour + duration) % 24;
        const arriveMinute = departMinute;
        
        const basePrice = Math.floor(Math.random() * 400) + 100;
        
        flights.push({
            id: `FL${1000 + i}`,
            airline: airlines[Math.floor(Math.random() * airlines.length)],
            departTime: `${departHour.toString().padStart(2, '0')}:${departMinute}`,
            arriveTime: `${arriveHour.toString().padStart(2, '0')}:${arriveMinute}`,
            duration: `${duration}h ${Math.floor(Math.random() * 60)}m`,
            price: basePrice,
            stops: Math.random() < 0.6 ? 0 : 1
        });
    }
    
    // Sort by price
    flights.sort((a, b) => a.price - b.price);
    
    return flights;
}

// Load and display flight results
function loadFlightResults() {
    const flightListContainer = document.getElementById('flightList');
    const searchInfoContainer = document.getElementById('searchInfo');
    
    if (!flightListContainer) return;
    
    const searchData = JSON.parse(sessionStorage.getItem('flightSearch'));
    
    if (!searchData) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display search info
    if (searchInfoContainer) {
        searchInfoContainer.innerHTML = `
            <h2>Available Flights</h2>
            <p>${searchData.origin} → ${searchData.destination}</p>
            <p>${new Date(searchData.departDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })}</p>
            <p>${searchData.passengers} passenger(s) • ${searchData.class}</p>
        `;
    }
    
    // Generate and display flights
    const flights = generateFlights(searchData.origin, searchData.destination);
    
    flightListContainer.innerHTML = flights.map(flight => `
        <div class="flight-card">
            <div class="flight-info">
                <div class="flight-time">${flight.departTime}</div>
                <div class="flight-airport">${searchData.origin}</div>
                <div class="flight-airline">${flight.airline} ${flight.id}</div>
            </div>
            <div class="flight-duration">
                <div>${flight.duration}</div>
                <div>${flight.stops === 0 ? 'Non-stop' : '1 Stop'}</div>
            </div>
            <div class="flight-info">
                <div class="flight-time">${flight.arriveTime}</div>
                <div class="flight-airport">${searchData.destination}</div>
            </div>
            <div class="flight-price">
                <div class="price-amount">$${flight.price}</div>
                <button class="btn-book" onclick="selectFlight('${flight.id}', ${flight.price}, '${flight.departTime}', '${flight.arriveTime}')">Select</button>
            </div>
        </div>
    `).join('');
}

// Select a flight and go to booking page
function selectFlight(flightId, price, departTime, arriveTime) {
    const searchData = JSON.parse(sessionStorage.getItem('flightSearch'));
    const flightData = {
        flightId,
        price,
        departTime,
        arriveTime,
        origin: searchData.origin,
        destination: searchData.destination,
        departDate: searchData.departDate,
        passengers: searchData.passengers,
        class: searchData.class
    };
    
    sessionStorage.setItem('selectedFlight', JSON.stringify(flightData));
    window.location.href = 'booking.html';
}

// Load booking page
function loadBookingPage() {
    const bookingSummary = document.getElementById('bookingSummary');
    
    if (!bookingSummary) return;
    
    const flightData = JSON.parse(sessionStorage.getItem('selectedFlight'));
    
    if (!flightData) {
        window.location.href = 'index.html';
        return;
    }
    
    const taxes = Math.floor(flightData.price * 0.15);
    const total = flightData.price + taxes;
    
    bookingSummary.innerHTML = `
        <h3>Booking Summary</h3>
        <div class="summary-item">
            <span>Route:</span>
            <span>${flightData.origin} → ${flightData.destination}</span>
        </div>
        <div class="summary-item">
            <span>Date:</span>
            <span>${new Date(flightData.departDate).toLocaleDateString()}</span>
        </div>
        <div class="summary-item">
            <span>Flight:</span>
            <span>${flightData.flightId}</span>
        </div>
        <div class="summary-item">
            <span>Departure:</span>
            <span>${flightData.departTime}</span>
        </div>
        <div class="summary-item">
            <span>Arrival:</span>
            <span>${flightData.arriveTime}</span>
        </div>
        <div class="summary-item">
            <span>Passengers:</span>
            <span>${flightData.passengers}</span>
        </div>
        <div class="summary-item">
            <span>Class:</span>
            <span>${flightData.class}</span>
        </div>
        <div class="summary-item">
            <span>Base Fare:</span>
            <span>$${flightData.price}</span>
        </div>
        <div class="summary-item">
            <span>Taxes & Fees:</span>
            <span>$${taxes}</span>
        </div>
        <div class="summary-item summary-total">
            <span>Total:</span>
            <span>$${total}</span>
        </div>
    `;
}

// Handle booking form submission
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const bookingReference = 'RYN' + Math.random().toString(36).substring(2, 11).toUpperCase();
        
        const passengerData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            bookingReference
        };
        
        sessionStorage.setItem('bookingConfirmation', JSON.stringify(passengerData));
        window.location.href = 'confirmation.html';
    });
}

// Load confirmation page
function loadConfirmation() {
    const confirmationDetails = document.getElementById('confirmationDetails');
    
    if (!confirmationDetails) return;
    
    const bookingData = JSON.parse(sessionStorage.getItem('bookingConfirmation'));
    const flightData = JSON.parse(sessionStorage.getItem('selectedFlight'));
    
    if (!bookingData || !flightData) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('bookingRef').textContent = bookingData.bookingReference;
    
    confirmationDetails.innerHTML = `
        <p><strong>Passenger:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
        <p><strong>Email:</strong> ${bookingData.email}</p>
        <p><strong>Route:</strong> ${flightData.origin} → ${flightData.destination}</p>
        <p><strong>Date:</strong> ${new Date(flightData.departDate).toLocaleDateString()}</p>
        <p><strong>Flight:</strong> ${flightData.flightId}</p>
        <p><strong>Departure:</strong> ${flightData.departTime}</p>
        <p><strong>Arrival:</strong> ${flightData.arriveTime}</p>
        <p class="confirmation-note">A confirmation email has been sent to ${bookingData.email}</p>
    `;
}

// Initialize page-specific functions
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and load appropriate content
    if (document.getElementById('flightList')) {
        loadFlightResults();
    }
    
    if (document.getElementById('bookingSummary')) {
        loadBookingPage();
    }
    
    if (document.getElementById('confirmationDetails')) {
        loadConfirmation();
    }
});
