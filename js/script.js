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
    setTimeout(revealReports, 500);
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
        return { status: "error", msg: "An error occurred. Try again later." };
    }
}

async function fetchWeather(lat, lon) {
    const measSys = localStorage.getItem("measSys");

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
        wx.temp = `${jsonData.main.temp} °K`;
        wx.heatIndex = `${jsonData.main.feels_like} °K`;
        wx.humidity = `${jsonData.main.humidity} %`;
        wx.visibility = jsonData.visibility >= 1000 ? `${jsonData.visibility/1000} km` : `${jsonData.visibility} m`;
        wx.windSpeed = `${jsonData.wind.speed} m/sec`;
        wx.windDegree = `${jsonData.wind.deg} °`;
        wx.dt = `${getDateFromTimestamp(jsonData.dt)} ${getTimeFromTimestamp}`;
        wx.sunrise = getTimeFromTimestamp(jsonData.sys.sunrise);
        wx.sunset = getTimeFromTimestamp(jsonData.sys.sunset);
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
        ap.co = jsonData.list[0].components.co + " μg/m3";
        ap.no = jsonData.list[0].components.no + " μg/m3";
        ap.no2 = jsonData.list[0].components.no2 + " μg/m3";
        ap.o3 = jsonData.list[0].components.o3 + " μg/m3";
        ap.so2 = jsonData.list[0].components.so2 + " μg/m3";
        ap.pm2_5 = jsonData.list[0].components.pm2_5 + " μg/m3";
        ap.pm10 = jsonData.list[0].components.pm10 + " μg/m3";
        ap.nh3  = jsonData.list[0].components.nh3 + " μg/m3";
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
                fcst.points[i].time = getTimeFromTimestamp(jsonData.list[i].dt);
                fcst.points[i].condition = jsonData.list[i].weather[0].main;
                fcst.points[i].description = toTitleCase(jsonData.list[i].weather[0].description);
                fcst.points[i].icon = jsonData.list[i].weather[0].icon;
                fcst.points[i].temp = jsonData.list[i].main.temp + " °K";
            }            
        }
        fcst.timeStart = fcst.points[0]?.time ?? null;
        fcst.timeEnd = fcst.points[fcst.points.length - 1]?.time ?? null;
        return fcst;
    } catch (error) {
        console.error(`Error fetching data from OpenWeatherMap Forecast API: ${error}`);
        return { status: "error", msg: "An error occured while fetching data." };
    }
}

function displayWxReport(geo, wx) {
    const measSys = localStorage.getItem("measSys");

    const wxIconURL = getIconURL(wx.icon);

    document.getElementById("location").textContent = `${geo.city}, ${geo.countryCode}`;
    document.getElementById("condition").textContent = wx.description;
    document.getElementById("wx-temp").textContent = updateMeasText(wx.temp, measSys);
    document.getElementById("wx-icon").src = wxIconURL;
    document.getElementById("heat-index").textContent = updateMeasText(wx.heatIndex, measSys);
    document.getElementById("humidity").textContent = wx.humidity;
    document.getElementById("speed").textContent = updateMeasText(wx.windSpeed, measSys);
    document.getElementById("degree").textContent = wx.windDegree;
    document.getElementById("sunrise").textContent = wx.sunrise;
    document.getElementById("sunset").textContent = wx.sunset;
    document.getElementById("visibility").textContent = updateMeasText(wx.visibility, measSys);
}

function displayPollutReport(ap) {
    document.getElementById("aqi").textContent = `${ap.aqi} (${getAqiStatus(ap.aqi)})`;
    document.getElementById("pollut-co").textContent = ap.co;
    document.getElementById("pollut-no").textContent = ap.no;
    document.getElementById("pollut-no2").textContent = ap.no2;
    document.getElementById("pollut-o3").textContent = ap.o3;
    document.getElementById("pollut-so2").textContent = ap.so2;
    document.getElementById("pollut-pm2_5").textContent = ap.pm2_5;
    document.getElementById("pollut-pm10").textContent = ap.pm10;
    document.getElementById("pollut-nh3").textContent = ap.nh3;
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

function displayFcstReport(fcst) {
    const measSys = localStorage.getItem("measSys");

    for (let i = 0; i < fcst.points.length; i++) {
        j = i + 1;

        const fcstIconURL = getIconURL(fcst.points[i].icon);

        document.getElementById(`fcst-time-${j}`).textContent = fcst.points[i].dt;
        document.getElementById(`fcst-icon-${j}`).src = fcstIconURL;
        document.getElementById(`fcst-icon-${j}`).title = fcst.points[i].condition;
        document.getElementById(`fcst-desc-${j}`).textContent = fcst.points[i].description
        document.getElementById(`fcst-temp-${j}`).textContent = updateMeasText(fcst.points[i].temp);
    }
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

function updateSearchDisplay(status, msg) {
    const root = document.querySelector(":root");
    const rs = getComputedStyle(root);

    let searchDisplay = document.getElementById("search-err-disp");

    if (status == "error") {
        searchDisplay.textContent = msg;
        searchDisplay.style.color = rs.getPropertyValue("--color-error1");
        searchDisplay.classList.remove("hidden");
        return;
    } else if (status == "no data") {
        searchDisplay.textContent = msg;
        searchDisplay.style.color = rs.getPropertyValue("--color-error2");
        searchDisplay.classList.remove("hidden");
        return;
    }

    searchDisplay.textContent = "";
    searchDisplay.classList.add("hidden");
}

function updateMeasurementSystem(measSys) {
    let newMeasSys;

    switch (measSys) {
        case "imp":
        case "si":
        case "met":
            newMeasSys = measSys;
            break;
        default:
            return;
    }

    if (newMeasSys == localStorage.getItem("measSys")) return;
    
    localStorage.setItem("measSys", newMeasSys);
    
    let measElements = document.getElementsByClassName("measElement");

    Array.from(measElements).forEach(element => {
        let text = element.textContent;
        text = updateMeasText(text, newMeasSys);
        element.textContent = text;
    });
}

function updateMeasText(text, measSys) {
    const numRegex = /-?\d+(\.\d+)?/;
    const unitRegex = /(°)?(mi|ft|km|m|F|K|C)(\.)?/;

    const matchedValue = text.match(numRegex);
    const matchedUnit = text.match(unitRegex);

    if (!matchedValue && !matchedUnit) return text;

    let num = parseFloat(matchedValue[0]);
    let [, degreeSymbol, unit, period] = matchedUnit;

    switch (measSys) {
        case "imp":
            ({num, unit} = convertToImperial(num, unit));
            break;
        case "si":
            ({num, unit} = convertToSI(num, unit));
            break;
        case "met":
            ({num, unit} = convertToMetric(num, unit));
            break;
    }

    // Removes unnecessary decimals
    num = Number.isInteger(num) ? num.toFixed(0) : num.toFixed(2);
    
    return text.replace(numRegex, num).replace(unitRegex, `${degreeSymbol || ""}${unit}${period || ""}`);
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

document.getElementById("measSys-toggle").addEventListener("change", (event) => {
    updateMeasurementSystem(event.target.value);
});

window.addEventListener("load", () => {
    localStorage.setItem("measSys", "met");
    loadLocalWxFcst();
})