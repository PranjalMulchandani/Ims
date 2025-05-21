// array of destinations
const destinations = [
    { name: "Great Barrier Reef" },
    { name: "Fraser Island" },
    { name: "Whitsunday Islands" },
    { name: "Noosa" },
    { name: "Port Douglas" },
    { name: "K'Gari" },
    { name: "Byron Bay" },
];
// api keys
const apiKey = "21c34ff4f448fc47e596e4155bf5c773";
const apiKeyWeatherAPI = "ad072d3c11a24d40957134706242304 ";

const recentlyViewed = [];

// function to fetch photo through flickr api
function fetchPhotos(destination) {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const minTakenDate = `${twoYearsAgo.getFullYear()}-${
        twoYearsAgo.getMonth() + 1
    }-${twoYearsAgo.getDate()}`;
    const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&text=${encodeURIComponent(
        destination
    )}&format=json&nojsoncallback=1&per_page=5&extras=date_taken,url_s,url_m,url_l&min_taken_date=${minTakenDate}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            displayThumbnails(data.photos.photo, destination);
        })
        .catch((error) => console.error("Error to fetch photo:", error));
}

// function to fetch weather deatils through weatherapi
function fetchWeather(destinationName) {
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKeyWeatherAPI}&q=${encodeURIComponent(
        destinationName
    )}&aqi=no`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === "404") {
                console.error("Weather data not found for", destinationName);
            } else {
                displayWeather(data, destinationName);
            }
        })
        .catch((error) => console.error("Error fetching weather:", error));
}

// displaying current weather by appending weatherHTML into weather-container div
function displayWeather(weatherData, destinationName) {
    const weatherContainer = document.getElementById("weather-container");
    const weatherHTML = `
        <h3>Weather in ${destinationName}</h3>
        <p>Temperature: ${weatherData.current.temp_c}°C</p>
        <p>Condition: ${weatherData.current.condition.text}</p>
    `;
    weatherContainer.innerHTML = weatherHTML;
}

// function to add photos in carousel
function setupCarousel(photos) {
    const slidesContainer = document.querySelector(".carousel-slides");
    slidesContainer.innerHTML = "";

    photos.forEach((photo) => {
        const img = document.createElement("img");
        img.src = photo.url_l || photo.url_m || photo.url_o;
        img.alt = photo.title;
        slidesContainer.appendChild(img);
    });

    let currentIndex = 0;
    const updateSlidePosition = () => {
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    document.querySelector(".prev-btn").onclick = () => {
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        updateSlidePosition();
    };

    document.querySelector(".next-btn").onclick = () => {
        currentIndex = (currentIndex + 1) % photos.length;
        updateSlidePosition();
    };

    updateSlidePosition();
}

// function to show thumbnails and call carousel
function displayThumbnails(photos, destination) {
    const container = document.getElementById("thumbnails-container");
    container.innerHTML = `<h2>${destination}</h2>`;
    photos.forEach((photo) => {
        const photoContainer = document.createElement("div");
        photoContainer.className = "photo-container";
        const img = document.createElement("img");
        img.src = photo.url_s || photo.url_o;
        img.alt = photo.title;
        img.addEventListener("click", () => showFullSizePhoto(photo));
        photoContainer.appendChild(img);
        const title = document.createElement("div");
        title.textContent = `${photo.title} - taken on: ${
            photo.datetaken.split(" ")[0]
        }`;
        photoContainer.appendChild(title);
        container.appendChild(photoContainer);
    });
    // calling carousel
    setupCarousel(photos);
}

// function to handle on click thumbnail and show full size photo
function showFullSizePhoto(photo) {
    const modal = document.getElementById("modal");
    const fullSizeImage = document.getElementById("full-size-image-modal");
    fullSizeImage.src = photo.url_l || photo.url_m || photo.url_o;
    fullSizeImage.alt = photo.title;
    document.getElementById("caption").textContent = photo.title;
    modal.style.display = "block";

    updateRecentlyViewed(photo);
}

function updateRecentlyViewed(photo) {
    if (recentlyViewed.unshift(photo) > 5) {
        recentlyViewed.pop();
    }
    displayRecentlyViewed();
}

// funciton to display recently viewed
function displayRecentlyViewed() {
    const list = document.getElementById("recently-viewed-list");
    list.innerHTML = "";
    recentlyViewed.forEach((photo) => {
        const img = document.createElement("img");
        img.src = photo.url_sq || photo.url_o || photo.url_l || photo.url_s;
        img.alt = photo.title;
        img.addEventListener("click", () => showFullSizePhoto(photo));
        list.appendChild(img);
    });
}

document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

// calling fetch photos and fetch weather on click one of destinations list
const destinationsList = document.getElementById("destinations-list");
destinations.forEach((destination) => {
    const li = document.createElement("li");
    li.textContent = destination.name;
    li.addEventListener("click", () => {
        fetchPhotos(destination.name);
        fetchWeather(destination.name);
    });
    destinationsList.appendChild(li);
});
