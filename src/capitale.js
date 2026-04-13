let already_guessed = []
let currentDate = new Date().toJSON().slice(0, 10);
let todays_capital_name = getRandomCapitalForToday()
let todays_capital = capitals_data[todays_capital_name]

function getRandomCapitalForToday() {
  let seed = parseInt(currentDate.replaceAll("-", ""));
  // LCG using GCC's constants
  m = 0x80000000; // 2**31;
  a = 1103515245;
  c = 12345;

  return capitals[Math.floor((((a * seed + c) % m) / m) * capitals.length)]
}

function getAlreadyGuessedToday(date) {
    if (localStorage.getItem(date) != null) {
        already_guessed = JSON.parse(localStorage.getItem(date))
    } else {
        localStorage.clear()
        already_guessed = []
        localStorage.setItem(date, JSON.stringify(already_guessed))
    }
}

function loadCapitale() {
    getAlreadyGuessedToday(currentDate)
    already_guessed.filter(guess => guess !== todays_capital_name).forEach((guess, index) => displayNewGuessRow(guess, index + 1))
    if (already_guessed.includes(todays_capital_name)) {
        displayWinningGuessRow()
    } else {
        document.getElementById("guess-input").addEventListener("input", searchForCapital)
        document.getElementById("guess-input").addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitGuess(e)
            }
        })
        document.getElementById("submit-button").addEventListener("click", submitGuess)
    }
}

function searchForCapital(e) {
    let guess = e.target.value
    if (!capitals.includes(guess)) {
        let filteredCapitals = capitals
            .filter(capital => capital.toLowerCase().includes(guess.toLowerCase()))
            .filter(capital => !already_guessed.includes(capital))
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

function displayNewGuessRow(guess, no = already_guessed.length) {
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
        guess: `${no}. ${guess}`
    })
    document.getElementById("guesses-container").innerHTML += formattedDiff

    if(already_guessed.length > 4) {
        let scroller = document.getElementById("guesses-container")
        makeScrollable(scroller)
    }
}

function displayWinningGuessRow() {
    let formattedDiff = formatWinningDiff(todays_capital, already_guessed.length)
    document.getElementById("guesses-container").innerHTML += formattedDiff
    
    if(already_guessed.length > 4) {
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
        already_guessed.push(guess)
        localStorage.setItem(currentDate, JSON.stringify(already_guessed))
        displayWinningGuessRow()
        guessInput.value = ""
    } else {
        already_guessed.push(guess)
        localStorage.setItem(currentDate, JSON.stringify(already_guessed))
        displayNewGuessRow(guess)
        guessInput.value = ""
    }
    document.getElementById("suggestions").innerHTML = ""
}

window.onload = loadCapitale