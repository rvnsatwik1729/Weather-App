const weatherContainer = document.querySelector(".weather-content");
const emptyState = document.querySelector(".empty-state");
const errorMessage = document.querySelector(".error-message");

const inputValue = document.getElementById("location-input");
const searchBtn = document.querySelector(".search-submit-btn");

const cityName = document.querySelector(".city-name");
const currentDate = document.querySelector(".current-date");

const heroDegree = document.querySelector(".hero-degree");

const weatherIcon = document.querySelector(".hero-temp-box img");

const metricValues = document.querySelectorAll(".metric-value");

const hourlyList = document.querySelector(".hourly-list");

const dailyForecast = document.querySelector(".daily-forecast-row");

const API_KEY = "c7e67f5fa6b67bccb1be809e832dc9c5";

const weatherIcons = {
        Clear : {
            src : "images/icon-sunny.webp",
            alt : "Clear"
        },
        Clouds : {
            src : "images/icon-overcast.webp",
            alt : "Clouds"
        },
        Rain : {
            src : "images/icon-rain.webp",
            alt : "Rain"
        },
        Drizzle : {
            src : "images/icon-drizzle.webp",
            alt : "Drizzle"
        },
        Snow : {
            src : "images/icon-snow.webp",
            alt : "Snow"
        },
        Thunderstorm : {
            src : "images/icon-storm.webp",
            alt : "Thunderstorm"
        },
        Mist : {
            src : "images/icon-fog.webp",
            alt : "Mist"
        },
        Fog : {
            src : "images/icon-fog.webp",
            alt : "Fog"
        }
    };

function showEmptyState(){
    emptyState.classList.remove("hidden");
    weatherContainer.classList.add("hidden");
    errorMessage.classList.add("hidden");
}

function showWeather(){
    errorMessage.classList.add("hidden");
    emptyState.classList.add("hidden");
    weatherContainer.classList.remove("hidden");
}

function showError(message){
    emptyState.classList.add("hidden");
    weatherContainer.classList.add("hidden");
    errorMessage.classList.remove("hidden");

    errorMessage.textContent =message;
}

showEmptyState();


async function displayWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        searchBtn.disabled = true;
        searchBtn.textContent = "Searching...";
        inputValue.readOnly = true;

        const response = await fetch(url);
        
        if(!response.ok){
            showError("city not found");
            return;
        }
        const data = await response.json();
            showWeather();
        

        inputValue.value = "";
        console.log(data);


        const cityNameValue = data.name;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const wind = data.wind.speed;
        const weatherType = data.weather[0].main;
        const icon = weatherIcons[weatherType] || {
                    src: "images/icon-overcast.webp",
                    alt: "Weather"
                };

        if(icon){
            weatherIcon.src = icon.src;
            weatherIcon.alt = icon.alt;
        }

        cityName.textContent = cityNameValue;
        currentDate.textContent = Date.now();
        heroDegree.textContent = `${temp}°`;
        metricValues[0].textContent = `${feelsLike}°`;
        metricValues[1].textContent = `${humidity}%`;
        metricValues[2].textContent = `${wind} km/h`;

    } catch (error) {
        console.log(error);
        showError("Network Error. Please check your internet connection");
    } finally{
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
        inputValue.readOnly = false;
    }

}

searchBtn.addEventListener("click",()=>{
    const searchCity = inputValue.value.trim();
    if(searchCity === ""){
        showEmptyState();
        return;
    }
    displayWeather(searchCity);
});

inputValue.addEventListener("keydown", e =>{
    if(e.key === "Enter"){
        const searchCity = inputValue.value.trim();
        if(searchCity === ""){
            showEmptyState();
            return;
        }
        displayWeather(searchCity);
    }
});