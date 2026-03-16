let already_guessed = []
let todays_capital

function loadCapitale() {
    let currentDate = new Date().toJSON().slice(0, 10);
    let todays_capital_name = capitalForTheDay[currentDate]
    todays_capital = capitals_data[todays_capital_name]
    document.getElementById("guess-input").addEventListener("input", searchForCapital)
    document.getElementById("guess-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            submitGuess(e)
        }
    })
    document.getElementById("submit-button").addEventListener("click", submitGuess)
}

function searchForCapital(e) {
    let guess = e.target.value
    if (!capitals.includes(guess)) {
        let filteredCapitals = capitals
            .filter(capital => capital.toLowerCase().includes(guess.toLowerCase()))
            .filter(capital => !already_guessed.includes(capital))
            .sort()
        document.getElementById("suggestions").innerHTML = filteredCapitals.map(capital => `<option value="${capital}">`).join('')
    } else {
        document.getElementById("suggestions").innerHTML = ""
    }
}

function makeScrollable(div) {
    div.style.overflowY = "scroll"
    div.style.paddingRight = "10px"
    document.getElementById("header-container").style.paddingRight = "10px"
    document.getElementById("input-container").style.paddingRight = "10px"
    div.scrollTop = div.scrollHeight
}

function displayNewGuessRow(guess) {
    let guessed_capital = capitals_data[guess]

    let distance = mathDistance(guessed_capital.latitude, guessed_capital.longitude, todays_capital.latitude, todays_capital.longitude)
    let direction = getDirectionClass(Math.atan2(guessed_capital.longitude - todays_capital.longitude, guessed_capital.latitude - todays_capital.latitude) * 180 / Math.PI)

    let formattedDiff = formatDiff({
        hemisphereClass: guessed_capital.hemisphere === todays_capital.hemisphere ? "good" : "bad",
        hemisphere: guessed_capital.hemisphere,
        continentClass: guessed_capital.continent === todays_capital.continent ? "good" : "bad",
        continent: guessed_capital.continent,
        populationClass: guessed_capital.pretty_population === todays_capital.pretty_population ? "good" : getPopulationClass(guessed_capital.population, todays_capital.population),
        population: guessed_capital.pretty_population,
        distanceClass: distance.distanceClass, 
        distance: `${distance.distance} km`, 
        directionClass: direction.directionClass,
        direction: direction.direction,
        guess: `${already_guessed.length}. ${guess}`
    })
    document.getElementById("guesses-container").innerHTML += formattedDiff

    if(already_guessed.length > 4) {
        let scroller = document.getElementById("guesses-container")
        makeScrollable(scroller)
    }
}

function displayWinningGuessRow() {
    let formattedDiff = formatWinningDiff(todays_capital, already_guessed.length + 1)
    document.getElementById("guesses-container").innerHTML += formattedDiff
    
    if(already_guessed.length >= 4) {
        let scroller = document.getElementById("guesses-container")
        makeScrollable(scroller)
    }
    
    document.getElementById('guess-input').disabled = true;
    document.getElementById('guess-input').style.cursor = "not-allowed";
    document.getElementById('submit-button').disabled = true;
    document.getElementById('submit-button').style.cursor = "not-allowed";
}

function submitGuess(e) {
    let guessInput = document.getElementById("guess-input")
    let guess = guessInput.value
    if (!capitals.includes(guess)) {
        alert("Please select a valid city from the suggestions")
    } else if (already_guessed.includes(guess)) {
        alert("You have already guessed this city")
    } else if (guess === todays_capital.name) {
        displayWinningGuessRow()
        guessInput.value = ""
    } else {
        already_guessed.push(guess)
        displayNewGuessRow(guess)
        guessInput.value = ""
    }
    document.getElementById("suggestions").innerHTML = ""
}

window.onload = loadCapitale