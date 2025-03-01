async function loadLocalWxFcst() {
    const geo = await fetchGeoFromIP();

    if (!geo.status == "success") {
        updateSearchDisplay(geo.status, geo.msg);
        return
    }

    const wx = await fetchWeather(geo.lat, geo.lon);
    if (wx.status) {
        updateSearchDisplay(wx.status, wx.msg);
        return
    }

    const fcst = await fetchForecast(geo.lat, geo.lon);
    if (fcst.status) {
        updateSearchDisplay(fcst.status, fcst.msg);
        return
    }

    const ap = await fetchPollution(geo.lat, geo.lon);
    if (ap.status) {
        updateSearchDisplay(ap.status, ap.msg);
        return
    }

    hideReports();
    displayWxReport(geo, wx);
    displayPollutReport(ap);
    displayFcstReport(fcst);
    setTimeout(revealReports, 300);
}

async function loadSearchedWxFcst(loc) {
    const geo = await fetchGeoFromName(loc);
    if (geo.status) {
        updateSearchDisplay(geo.status, geo.msg);
        return
    }

    const wx = await fetchWeather(geo.lat, geo.lon);
    if (wx.status) {
        updateSearchDisplay(wx.status, wx.msg);
        return
    }

    const fcst = await fetchForecast(geo.lat, geo.lon);
    if (fcst.status) {
        updateSearchDisplay(fcst.status, fcst.msg);
        return
    }

    const ap = await fetchPollution(geo.lat, geo.lon);
    if (ap.status) {
        updateSearchDisplay(ap.status, ap.msg);
        return
    }

    hideReports();
    updateSearchDisplay("success", "")
    displayWxReport(geo, wx);
    displayPollutReport(ap);
    displayFcstReport(fcst);
    setTimeout(revealReports, 500);
}

async function fetchGeoFromIP() {
    const ipEndpoint = 'http://ip-api.com/json/?fields=status,message,countryCode,city,lat,lon';

    try {
        const response = await fetch(ipEndpoint);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const jsonData = await response.json();
        if (jsonData.status == "fail") {
            return { status: "no data", msg: "No data found in your current location." };
        }

        return { ...getGeoTemplate(), ...jsonData };
    } catch (error) {
        console.error(`Error fetching data from IP-API: ${error}`);
        return { status: "error", msg: "An error occurred while fetching data." };
    }
}

async function fetchGeoFromName(loc) {
    const cityName = loc[0];
    const countryCode = loc[1] || "";
    const geoEndpoint = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=1&appid=${apiKey}`;

    try {
        const response = await fetch(geoEndpoint);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const jsonData = await response.json();
        if(jsonData.length < 1) {
            return { status: "no data", msg: "No data found." };
        }

        let geo = getGeoTemplate();
        geo.lat = jsonData[0].lat;
        geo.lon = jsonData[0].lon;
        geo.city = jsonData[0].name;
        geo.countryCode = jsonData[0].country;
        return geo;
    } catch (error) {
        console.error(`Error fetching data from OpenWeatherMap Geo API: ${error}`);
        return { status: "error", msg: "An error occurred while fetching data." };
    }
}

async function fetchWeather(lat, lon) {
    const weatherEndpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(weatherEndpoint);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const jsonData = await response.json();
        if (!jsonData.weather) {
            return { status: "no data", msg: "No data found." };
        }
    
        let wx = getWxTemplate();
        wx.condition = jsonData.weather[0].main;
        wx.description = toTitleCase(jsonData.weather[0].description);
        wx.icon = jsonData.weather[0].icon;
        wx.temp = convertKelvin(jsonData.main.temp);
        wx.heatIndex = convertKelvin(jsonData.main.feels_like);
        wx.humidity = jsonData.main.humidity;
        wx.visibility = jsonData.visibility;
        wx.windSpeed = jsonData.wind.speed;
        wx.windDegree = jsonData.wind.deg;
        wx.dt = jsonData.dt;
        wx.sunrise = jsonData.sys.sunrise;
        wx.sunset = jsonData.sys.sunset;
        return wx;
    } catch (error) {
        console.error(`Error fetching data from OpenWeatherMap Current API: ${error}`);
        return { status: "error", msg: "An error occured while fetching data." };
    }
}

async function fetchPollution(lat, lon) {
    const pollutionEndpoint = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(pollutionEndpoint);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const jsonData = await response.json();
        if (!jsonData.list) {
            return { status: "no data", msg: "No data found."}
        }

        let ap = getPollutTemplate();
        ap.aqi = jsonData.list[0].main.aqi;
        ap.co = jsonData.list[0].components.co;
        ap.no = jsonData.list[0].components.no;
        ap.no2 = jsonData.list[0].components.no2;
        ap.o3 = jsonData.list[0].components.o3;
        ap.so2 = jsonData.list[0].components.so2;
        ap.pm2_5 = jsonData.list[0].components.pm2_5;
        ap.pm10 = jsonData.list[0].components.pm10;
        ap.nh3  = jsonData.list[0].components.nh3;
        return ap;
    } catch (error) {
        console.error(`Error fetching data from OpenWeatherMap Pollution API: ${error}`);
        return { status: "error", msg: "An error occured while fetching data." };
    }
}

async function fetchForecast(lat, lon) {
    const forecastEndpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(forecastEndpoint);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const jsonData = await response.json();
        if  (!jsonData.list) {
            return { status: "no data", msg: "No data found."}
        }

        let fcst = getFcstTemplate();
        for (let i = 0; i < fcst.points.length; i++) {
            if (i < jsonData.list.length) {
                fcst.points[i].dt = jsonData.list[i].dt;
                fcst.points[i].condition = jsonData.list[i].weather[0].main;
                fcst.points[i].description = toTitleCase(jsonData.list[i].weather[0].description);
                fcst.points[i].icon = jsonData.list[i].weather[0].icon;
                fcst.points[i].temp = convertKelvin(jsonData.list[i].main.temp);
            }            
        }
        fcst.timeStart = fcst.points[0]?.dt ?? null;
        fcst.timeEnd = fcst.points[fcst.points.length - 1]?.dt ?? null;
        return fcst;
    } catch (error) {
        console.error(`Error fetching data from OpenWeatherMap Forecast API: ${error}`);
        return { status: "error", msg: "An error occured while fetching data." };
    }
}

function displayWxReport(geo, wx) {
    const unit = localStorage.getItem("unit");
    const wxIcon = getIconURL(wx.icon);

    document.getElementById("location").textContent = `${geo.city}, ${geo.countryCode}`;
    document.getElementById("condition").textContent = wx.description;
    document.getElementById("wx-temp").textContent = `${wx.temp} °${unit.toUpperCase()}`;
    document.getElementById("wx-icon").src = wxIcon;
    document.getElementById("heat-index").textContent = `${wx.heatIndex} °${unit.toUpperCase()}`;
    document.getElementById("humidity").textContent = `${wx.humidity} %`;
    document.getElementById("speed").textContent = `${wx.windSpeed} m/s`;
    document.getElementById("degree").textContent = `${wx.windDegree} °`;
    document.getElementById("sunrise").textContent = getTimeFromTimestamp(wx.sunrise);
    document.getElementById("sunset").textContent = getTimeFromTimestamp(wx.sunset);
    document.getElementById("visibility").textContent = `${wx.humidity} km`;
}

function displayPollutReport(ap) {
    const aqiStatus = getAqiStatus(ap.aqi);

    document.getElementById("aqi").textContent = `${ap.aqi} (${aqiStatus})`;
    document.getElementById("pollut-co").textContent = `${ap.co} μg/m3`;
    document.getElementById("pollut-no").textContent = `${ap.no} μg/m3`;
    document.getElementById("pollut-no2").textContent = `${ap.no2} μg/m3`;
    document.getElementById("pollut-o3").textContent = `${ap.o3} μg/m3`;
    document.getElementById("pollut-so2").textContent = `${ap.so2} μg/m3`;
    document.getElementById("pollut-pm2_5").textContent = `${ap.pm2_5} μg/m3`;
    document.getElementById("pollut-pm10").textContent = `${ap.pm10} μg/m3`;
    document.getElementById("pollut-nh3").textContent = `${ap.nh3} μg/m3`;
}

function displayFcstReport(fcst) {
    for (let i = 0; i < fcst.points.length; i++) {
        j = i + 1;

        const unit = localStorage.getItem("unit");
        const fcstIcon = getIconURL(fcst.points[i].icon);

        document.getElementById(`fcst-time-${j}`).textContent = getTimeFromTimestamp(fcst.points[i].dt);
        document.getElementById(`fcst-icon-${j}`).src = fcstIcon;
        document.getElementById(`fcst-icon-${j}`).title = fcst.points[i].condition;
        document.getElementById(`fcst-desc-${j}`).textContent = fcst.points[i].description
        document.getElementById(`fcst-temp-${j}`).textContent = `${fcst.points[i].temp} °${unit.toUpperCase()}`;
    }
}

function getAqiStatus(aqi) {
    switch (aqi) {
        case 1:
            return "Good";
        case 2:
            return "Fair";
        case 3:
            return "Moderate";
        case 4:
            return "Poor";
        case 5:
            return "Very Poor";                                        
        default:
            return "-";
    }
}

function updateSearchDisplay(status, msg) {
    let searchDisplay = document.getElementById("search-err-disp");

    if (status == "error") {
        searchDisplay.textContent = msg;
        searchDisplay.classList.remove("hidden");
        return;
    } else if (status == "no data") {
        searchDisplay.textContent = msg;
        searchDisplay.classList.remove("hidden");
        return;
    }

    searchDisplay.textContent = "";
    searchDisplay.classList.add("hidden");
}

// 
// 
// 

async function findSearchedLocation() {
    const query = document.getElementById("search-bar").value;

    if (query.length < 1) {
        return;
    }

    const loc = query.split(',').map(str => str.trim()).filter(Boolean);

    if (loc.length < 1 || loc.length > 2 || (/^[^\w\s]+$/.test(loc[0]))) {
        updateSearchDisplay("error", "Invalid city name")
        return;
    }

    await loadSearchedWxFcst(loc);
    document.getElementById("search-bar").value = "";
}

function updateTempUnit(unit) {
    console.log(unit);
    localStorage.setItem("unit", unit.toLowerCase() || "c");

    let tempElements = document.getElementsByClassName("temp");

    Array.from(tempElements).forEach(element => {
        let tempValue = parseFloat(element.textContent.replace(/[^\d.-]/g, ""));

        if (isNaN(tempValue)) {
            element.textContent = `-- °${unit.toUpperCase()}`;
            return;
        }

        let convertedValue = unit === "f" 
            ? celsiusToFahrenheit(tempValue) 
            : fahrenheitToCelsius(tempValue);

        element.textContent = `${convertedValue} °${unit.toUpperCase()}`;
    });
}

function revealReports() {
    const reports = document.querySelector(".reports");
    reports.classList.remove("hidden");
    reports.classList.add("visible");
}

function hideReports() {
    const reports = document.querySelector(".reports");
    reports.classList.remove("visible");
    reports.classList.add("hidden");
}


document.getElementById("search-bar").addEventListener("keydown", (event) => {
    if (event.key === "Enter") findSearchedLocation();
});

document.getElementById("temp-toggle").addEventListener("change", (event) => {
    updateTempUnit(event.target.value);
});

window.addEventListener("load", loadLocalWxFcst());