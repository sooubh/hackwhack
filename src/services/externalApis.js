// src/services/externalApis.js
// Simulating external data API connections (Weather, Traffic, Geopolitical)
// The user requested "hardcoded api data" as placeholders for real API keys.

export async function fetchWeatherData(lat, lng, isPort = false) {
    // Simulate an API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real app, you would use an API key here:
    // const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    // const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}`);

    // Hardcoded realistic mock data based on location
    const conditions = ['Clear skies', 'Heavy Rain', 'Thunderstorms', 'Light Snow', 'Foggy conditions', 'High Winds'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * 35) + 5; // 5 to 40 Celsius

    let warning = null;
    if (isPort && (randomCondition === 'Thunderstorms' || randomCondition === 'High Winds')) {
        warning = 'Port closure likely due to adverse weather.';
    } else if (randomCondition === 'Heavy Rain' || randomCondition === 'Light Snow') {
        warning = 'Logistics delays expected on surrounding roads.';
    }

    return {
        temperature: `${temp}°C`,
        condition: randomCondition,
        warning: warning || 'Normal conditions'
    };
}

export async function fetchTrafficData(lat, lng) {
    await new Promise(resolve => setTimeout(resolve, 200));

    // const apiKey = process.env.NEXT_PUBLIC_TRAFFIC_API_KEY;
    // const res = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&key=${apiKey}`);

    const levels = ['Light', 'Moderate', 'Heavy', 'Gridlock'];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const delayMins = randomLevel === 'Gridlock' ? Math.floor(Math.random() * 120) + 60 : (randomLevel === 'Heavy' ? Math.floor(Math.random() * 45) + 15 : 0);

    return {
        congestionLevel: randomLevel,
        estimatedDelay: delayMins > 0 ? `${delayMins} minutes` : 'None',
        incidentReported: randomLevel === 'Gridlock' ? true : false
    };
}

export async function fetchGeopoliticalStatus(country) {
    await new Promise(resolve => setTimeout(resolve, 150));

    // Simulated risk logic based on country for demonstration purposes
    const highRiskRegions = ['Brazil', 'Nigeria', 'South Africa'];
    const mediumRiskRegions = ['China', 'India'];

    let status = 'Stable';
    let alert = 'None';

    if (highRiskRegions.includes(country)) {
        status = 'Elevated Risk';
        alert = 'Ongoing regional instability affecting supply routes (Simulated)';
    } else if (mediumRiskRegions.includes(country)) {
        status = 'Monitoring';
        alert = 'Customs delays or local strikes reported (Simulated)';
    }

    return { status, alert };
}
