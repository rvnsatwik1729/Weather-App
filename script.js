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
        Default : {
            src : "images/icon-overcast.webp",
            alt : "Weather"
        },
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

function updateHourlyForecast(hourlyData) {

    hourlyList.innerHTML = "";

    for (let i = 0; i < 8; i++) {

        const forecast = hourlyData[i];

        const weatherType = forecast.weather[0].main;

        const icon = weatherIcons[weatherType] || weatherIcons.Default;

        const time = new Date(forecast.dt_txt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
 
        const temp = Math.round(forecast.main.temp);

        const hourlyItem = document.createElement("div");
        hourlyItem.classList.add("hourly-item");

        const hourTime = document.createElement("div");
        hourTime.classList.add("hour-time");

        const img = document.createElement("img");
        img.classList.add("hour-img");
        img.src = icon.src;
        img.alt = icon.alt;

        const timeText = document.createElement("span");
        timeText.textContent = time;

        const hourTemp = document.createElement("span");
        hourTemp.classList.add("hour-temp");
        hourTemp.textContent = `${temp}°`;

        hourTime.appendChild(img);
        hourTime.appendChild(timeText);

        hourlyItem.appendChild(hourTime);
        hourlyItem.appendChild(hourTemp);

        hourlyList.appendChild(hourlyItem);
    }

}

async function displayWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    
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
        console.log(data);
        showWeather();

        inputValue.value = "";


        const current = data.list[0];

        const cityNameValue = data.city.name;
        const temp = Math.round(current.main.temp);
        const feelsLike = Math.round(current.main.feels_like);
        const humidity = current.main.humidity;
        const wind = current.wind.speed;
        const weatherType = current.weather[0].main;

        const icon = weatherIcons[weatherType] || weatherIcons.Default;

        weatherIcon.src = icon.src;
        weatherIcon.alt = icon.alt;


        cityName.textContent = cityNameValue;
        currentDate.textContent = Date.now();
        heroDegree.textContent = `${temp}°`;
        metricValues[0].textContent = `${feelsLike}°`;
        metricValues[1].textContent = `${humidity}%`;
        metricValues[2].textContent = `${wind} km/h`;
        
        updateHourlyForecast(data.list);

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