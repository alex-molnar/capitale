
let five_mil = 5000000
let mil = 1000000
let ten_k = 10000
let k = 1000

function mathDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    const distance = Math.round(d / 1000)
    if (distance < 200) {
        return {
            distance: distance,
            distanceClass: "good",
        }
    } else if (distance < 500) {
        return {
            distance: distance,
            distanceClass: "mid",
        }
    } else {
        return {
            distance: distance,
            distanceClass: "bad",
        }
    }
}

function getPopulationClass(guessed_population, todays_population) {
    let direction = todays_population > guessed_population ? "north" : "south"

    if (
        (todays_population > five_mil && Math.abs(guessed_population - todays_population) < mil) ||
        (todays_population > mil && Math.abs(guessed_population - todays_population) < 300 * k) ||
        (todays_population > 100 * k && Math.abs(guessed_population - todays_population) < 100 * k) ||
        (todays_population > ten_k && Math.abs(guessed_population - todays_population) < ten_k) ||
        Math.abs(guessed_population - todays_population) < k
    ) {
        return `mid ${direction}`
    } else {
        return `bad ${direction}`
    }
}

function getDirectionClass(angle) {
    if (angle <= 22.5 && angle >= -22.5) {
        return {
            direction: "S",
            directionClass: "south"
        }
    } else if(angle < -22.5 && angle > -67.5) {
        return {
            direction: "SE",
            directionClass: "southeast"
        }
    } else if (angle <= -67.5 && angle >= -112.5) {
        return {
            direction: "E",
            directionClass: "east"
        }
    } else if (angle < -112.5 && angle > -157.5) {
        return {
            direction: "NE",
            directionClass: "northeast"
        }
    } else if (angle <= -157.5 || angle >= 157.5) {
        return {
            direction: "N",
            directionClass: "north"
        }
    } else if (angle < 157.5 && angle > 112.5) {
        return {
            direction: "NW",
            directionClass: "northwest"
        }
    } else if (angle <= 112.5 && angle >= 67.5) {
        return {
            direction: "W",
            directionClass: "west"
        }
    } else if (angle < 67.5 && angle > 22.5) {
        return {
            direction: "SW",
            directionClass: "southwest"
        }
    }
}