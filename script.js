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

const unitsBtn = document.querySelector(".units-btn");
const unitsMenu = document.querySelector(".units-menu");
const unitOptions = document.querySelectorAll(".unit-option");

const API_KEY = "c7e67f5fa6b67bccb1be809e832dc9c5";

let currentWeatherData = null;
let currentUnit = "metric";

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

    errorMessage.textContent = message;
}

function setLoading(isLoading){
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? "Searching..." : "Search";
    inputValue.readOnly = isLoading;
    document.body.style.cursor = isLoading ? "wait" : "default";
}

function convertTemperature(temp){
    if(currentUnit === "metric"){
        return `${Math.round(temp)}°C`;
    }

    return `${Math.round((temp * 9/5) + 32)}F`;
}

function convertWind(speed){
    if(currentUnit === "metric"){
        return `${Math.round(speed*3.6)} km/h`;
    }

    return `${Math.round(speed*2.237)} mph`;
}

function renderWeather(data){
    const current = data.list[0];

        const cityNameValue = data.city.name;
        const temp = current.main.temp;
        const feelsLike = current.main.feels_like;
        const humidity = current.main.humidity;
        const wind = current.wind.speed;
        const weatherType = current.weather[0].main;

        const icon = weatherIcons[weatherType] || weatherIcons.Default;

        weatherIcon.src = icon.src;
        weatherIcon.alt = icon.alt;


        cityName.textContent = cityNameValue;

        const todayDate = new Date(current.dt_txt);
        const formattedDate = todayDate.toLocaleDateString("en-US",{
            weekday : "long",
            month   : "short",
            day     : "numeric",
            year    : "numeric"
        });
        currentDate.textContent = formattedDate;

        heroDegree.textContent = `${convertTemperature(temp)}`;
        metricValues[0].textContent = `${convertTemperature(feelsLike)}`;
        metricValues[1].textContent = `${humidity}%`;
        metricValues[2].textContent = `${convertWind(wind)}`;
        
        updateHourlyForecast(data.list);
        updateDailyForecast(data.list);

}

function getCurrentLocation(){
    if(!navigator.geolocation){
        showError("Geolocation is not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) =>{
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            displayWeatherByLocation(lat,lon);
        },
        ()=>{
            showError("Location permission denied");
        }
    );
}


async function displayWeatherByLocation(lat, lon){
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    try{
        
        setLoading(true);

        const response = await fetch(url);
        const data = await response.json();

        currentWeatherData = data;

        if(Number(data.cod) !== 200){
            showError("city not found. Please check your spelling.");
            return;
        }

        showWeather();
        inputValue.value = "";
        renderWeather(data);

    }

    catch(error){
        console.log(error);
        showError("Network Error");
    }

    finally{
        setLoading(false);
    }

}

function updateHourlyForecast(hourlyData) {

    hourlyList.innerHTML = "";

    for (let i = 0; i < Math.min(8, hourlyData.length); i++) {

        const forecast = hourlyData[i];

        const weatherType = forecast.weather[0].main;

        const icon = weatherIcons[weatherType] || weatherIcons.Default;

        const time = new Date(forecast.dt_txt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
 
        const temp = forecast.main.temp;

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
        hourTemp.textContent = `${convertTemperature(temp)}`;

        hourTime.appendChild(img);
        hourTime.appendChild(timeText);

        hourlyItem.appendChild(hourTime);
        hourlyItem.appendChild(hourTemp);

        hourlyList.appendChild(hourlyItem);
    }

}

function updateDailyForecast(forecastData) {

    dailyForecast.innerHTML = "";

    const dailyData = {};

    // Calculate max/min temperature for each day
    for (const forecast of forecastData) {

        const date = forecast.dt_txt.split(" ")[0];

        if (!dailyData[date]) {

            dailyData[date] = {
                max: forecast.main.temp_max,
                min: forecast.main.temp_min,
                weather: forecast.weather[0].main
            };

        } else {

            dailyData[date].max = Math.max(
                dailyData[date].max,
                forecast.main.temp_max
            );

            dailyData[date].min = Math.min(
                dailyData[date].min,
                forecast.main.temp_min
            );

        }
    }

    // Take only first 5 days
    const dates = Object.keys(dailyData).slice(0, 5);

    for (const date of dates) {

        const dayData = dailyData[date];

        const day = new Date(date).toLocaleDateString("en-US", {
            weekday: "short"
        });

        const maxTemp = dayData.max;
        const minTemp = dayData.min;

        const icon = weatherIcons[dayData.weather] || weatherIcons.Default;

        const dayCard = document.createElement("div");
        dayCard.classList.add("day-card");

        const dayName = document.createElement("span");
        dayName.classList.add("day-name");
        dayName.textContent = day;

        const img = document.createElement("img");
        img.src = icon.src;
        img.alt = icon.alt;

        const dayTemps = document.createElement("span");
        dayTemps.classList.add("day-temps");

        const tempMax = document.createElement("span");
        tempMax.classList.add("max-temp");
        tempMax.textContent = `${convertTemperature(maxTemp)}`;

        const tempMin = document.createElement("span");
        tempMin.classList.add("min-temp");
        tempMin.textContent = `${convertTemperature(minTemp)}`;

        dayTemps.appendChild(tempMax);
        dayTemps.appendChild(tempMin);

        dayCard.appendChild(dayName);
        dayCard.appendChild(img);
        dayCard.appendChild(dayTemps);

        dailyForecast.appendChild(dayCard);
    }
}

async function displayWeather(city){
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        setLoading(true);

        const response = await fetch(url);
        const data = await response.json();

        currentWeatherData = data;
        
        if(Number(data.cod) !== 200){
            showError("city not found. Please check your spelling.");
            return;
        }

        showWeather();
        inputValue.value = "";

        renderWeather(data);
        
    } catch (error) {
        console.log(error);
        showError("Network Error. Please check your internet connection");
    } finally{
        setLoading(false);
    }

}

function searchWeather(){

    if(searchBtn.disabled)
        return;

    const searchCity = inputValue.value.trim();
    if(searchCity === ""){
        showEmptyState();
        return;
    }
    displayWeather(searchCity);
}
searchBtn.addEventListener("click",(searchWeather));

inputValue.addEventListener("keydown", e =>{
    if(e.key === "Enter"){
        searchWeather();
    }
});

unitsBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    unitsMenu.classList.toggle("hidden");

    unitsBtn.classList.toggle("open");

    unitOptions.forEach(option => {

    option.addEventListener("click", () => {

        currentUnit = option.dataset.unit;

        unitOptions.forEach(btn =>
            btn.classList.remove("active")
        );

        option.classList.add("active");

        unitsMenu.classList.add("hidden");

        unitsBtn.classList.remove("open");

        if(currentWeatherData){
            renderWeather(currentWeatherData);
        }
    });
});

});

document.addEventListener("click", () => {

    unitsMenu.classList.add("hidden");

    unitsBtn.classList.remove("open");

});

getCurrentLocation();
showEmptyState();
