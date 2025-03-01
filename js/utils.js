function getGeoTemplate() {
    return {
        lat: null,
        lon: null,
        city: null,
        countryCode: null,
    }
}

function getWxTemplate() {
    return {
        condition: null,
        description: null,
        icon: null,
        temp: null,
        heatIndex: null,
        humidity: null,
        visibility: null,
        windSpeed: null,
        windDegree: null,
        dt: null,
        sunrise: null,
        sunset: null,
    }
}

function getFcstTemplate() {
    return {
        timeStart: null,
        timeEnd: null,
        points: [    
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
            {
                dt: null,
                condition: null,
                icon: null,
                temp: null,
            },
        ]
    }
}

function getPollutTemplate() {
    return {
        aqi: null,
        co: null,
        no: null,
        no2: null,
        o3: null,
        so2: null,
        pm2_5: null,
        pm10: null,
        nh3: null,
    }
}

function toTitleCase(str) {
    return str
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function convertKelvin(k) {
    if (typeof k != "number" || k < 0) {
        console.error(`Conversion error. Invalid Kelvin value: ${k}.`);
        return 0;
    }

    let tempUnit = localStorage.getItem("unit");
    switch (tempUnit) {
        case "c":
            return (k - 273.15).toFixed(1);
        case "f":
            return ((k - 273.15) * 9 / 5 + 32).toFixed(1);
        default:
            return (k - 273.15).toFixed(1);
    }
}

function kelvinToCelsius(k) {
    return (k - 273.15).toFixed(1);
}

function kelvinToFahrenheit(k) {
    return ((k - 273.15) * 9/5 + 32).toFixed(1);
}

function celsiusToFahrenheit(c) {
    return ((c * 9/5) + 32).toFixed(1);
}

function fahrenheitToCelsius(f) {
    return ((f - 32) * 5/9).toFixed(1);
}
function getIconURL(code) {
    const validCodes = [
        "01d", "01n", "02d", "02n", "03d", "03n", "04d", "04n", 
        "09d", "09n", "10d", "10n", "11d", "11n", "13d", "13n",
        "50d", "50n"
    ];

    return validCodes.includes(code) 
        ? `../assets/icons/${code}.png` 
        : "../assets/icons/loading.png";
}

function getDateFromTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
}

function getTimeFromTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert 0 (midnight) and 12 (noon) properly
    minutes = minutes.toString().padStart(2, '0'); // Ensure two-digit minutes

    return `${hours}:${minutes} ${ampm}`;
}
