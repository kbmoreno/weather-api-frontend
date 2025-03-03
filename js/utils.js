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
                time: null,
                condition: null,
                description: null,
                icon: null,
                temp: null,
            },
            {
                time: null,
                condition: null,
                description: null,
                icon: null,
                temp: null,
            },
            {
                time: null,
                condition: null,
                description: null,
                icon: null,
                temp: null,
            },
            {
                time: null,
                condition: null,
                description: null,
                icon: null,
                temp: null,
            },
            {
                time: null,
                condition: null,
                description: null,
                icon: null,
                temp: null,
            },
            {
                time: null,
                condition: null,
                description: null,
                icon: null,
                temp: null,
            },
            {
                time: null,
                condition: null,
                description: null,
                icon: null,
                temp: null,
            },
            {
                time: null,
                condition: null,
                description: null,
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

function convertToImperial(num, unit) {
    switch (unit) {
        case "km":  // kilometers to miles
            num *= 0.621371;
            unit = "mi";
            break;
        case "m":   // meters to feet
            num *= 3.28084;
            unit = "ft";
            break;
        case "K":   // kelvin to fahrenheit
            num = (num - 273.15) * 9/5 + 32;
            unit = "F";
            break;
        case "C":   // celcius to fahrenheit
            num = num * 9/5 + 32;
            unit = "F";
            break;
        default:
            break;
    }
    return { num, unit };
}

function convertToSI(num, unit) {
    switch (unit) {
        case "mi":  // miles to kilometers
            num *= 1.60934;
            unit = "km";
            break;
        case "ft":  // feet to meters
            num *= 0.3048;
            unit = "m";
            break;
        case "F":   // fahrenheit to kelvin
            num = (num - 32) * 5/9 + 273.15;
            unit = "K";
            break;
        case "C":   // celsius to kelvin
            num += 273.15;
            unit = "K";
            break;
        case "km":  // | no conversion needed
        case "m":   // |
        default:
            break;
    }
    return { num, unit };
}

function convertToMetric(num, unit) {
    switch (unit) {
        case "mi":  // miles to kilometers
            num *= 1.60934;
            unit = "km";
            break;
        case "ft":  // feet to meters
            num *= 0.3048;
            unit = "m";
            break;
        case "F":   // fahrenheit to celsius
            num = (num - 32) * 5/9;
            unit = "C";
            break;
        case "K":   // kelvin to celsius
            num -= 273.15;
            unit = "C";
            break;
        case "km":  // | no conversion needed
        case "m":   // |
        default:
            break;
    }
    return { num, unit };
}