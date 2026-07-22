let already_guessed = []
let currentDate = new Date().toJSON().slice(0, 10);
let todays_country_name = getRandomCountryForToday()
let todays_country = countries_data[todays_country_name]
document.title = `Countryle`

function getRandomCountryForToday() {
  let seed = parseInt(currentDate.replaceAll("-", ""));
  // LCG using GCC's constants
  m = 0x80000000; // 2**31;
  a = 1103515245;
  c = 12345;

  return countries[Math.floor((((a * seed + c) % m) / m) * countries.length)]
}

function getAlreadyGuessedToday(date) {
    if (localStorage.getItem(`countryle-${date}`) != null) {
        already_guessed = JSON.parse(localStorage.getItem(`countryle-${date}`))
    } else {
        localStorage.clear()
        already_guessed = []
        localStorage.setItem(`countryle-${date}`, JSON.stringify(already_guessed))
    }
}

function loadCountry() {
    getAlreadyGuessedToday(currentDate)
    already_guessed.filter(guess => guess !== todays_country_name).forEach((guess, index) => displayNewGuessRow(guess, index + 1))
    if (already_guessed.includes(todays_country_name)) {
        displayWinningGuessRow()
    } else {
        document.getElementById("guess-input").addEventListener("input", searchForCountry)
        document.getElementById("guess-input").addEventListener("keydown", handleKeyboardNavigation)
        document.getElementById("guess-input").addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitGuess(e)
            }
        })
        document.getElementById("guess-input").addEventListener("blur", () => {
            setTimeout(hideSuggestions, 150) // Delay to allow click on suggestion
        })
        document.getElementById("submit-button").addEventListener("click", submitGuess)
        document.getElementById("hint-button").addEventListener("click", showSolution)
    }
}

let selectedSuggestionIndex = -1

function searchForCountry(e) {
    let guess = e.target.value
    let suggestionsContainer = document.getElementById("suggestions-container")
    selectedSuggestionIndex = -1
    
    if (guess.length > 0 && !countries.includes(guess)) {
        let filteredCountries = countries
            .filter(country => country.toLowerCase().includes(guess.toLowerCase()))
            .filter(country => !already_guessed.includes(country))
            .slice(0, 8) // Limit to 8 suggestions
        
        if (filteredCountries.length > 0) {
            suggestionsContainer.innerHTML = filteredCountries.map((country, index) => 
                `<div class="suggestion-item" data-value="${country}" data-index="${index}">${country}</div>`
            ).join('')
            suggestionsContainer.classList.add("show")
            
            // Add click handlers to suggestions
            suggestionsContainer.querySelectorAll(".suggestion-item").forEach(item => {
                item.addEventListener("click", () => selectSuggestion(item.dataset.value))
            })
        } else {
            hideSuggestions()
        }
    } else {
        hideSuggestions()
    }
}

function hideSuggestions() {
    let suggestionsContainer = document.getElementById("suggestions-container")
    suggestionsContainer.innerHTML = ""
    suggestionsContainer.classList.remove("show")
    selectedSuggestionIndex = -1
}

function selectSuggestion(value) {
    document.getElementById("guess-input").value = value
    hideSuggestions()
}

function handleKeyboardNavigation(e) {
    let suggestionsContainer = document.getElementById("suggestions-container")
    let items = suggestionsContainer.querySelectorAll(".suggestion-item")
    
    if (!suggestionsContainer.classList.contains("show") || items.length === 0) return
    
    if (e.key === "ArrowDown") {
        e.preventDefault()
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1)
        updateSelectedSuggestion(items)
    } else if (e.key === "ArrowUp") {
        e.preventDefault()
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0)
        updateSelectedSuggestion(items)
    } else if (e.key === "Escape") {
        hideSuggestions()
    }
}

function updateSelectedSuggestion(items) {
    items.forEach((item, index) => {
        item.classList.toggle("selected", index === selectedSuggestionIndex)
    })
    if (selectedSuggestionIndex >= 0) {
        document.getElementById("guess-input").value = items[selectedSuggestionIndex].dataset.value
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
    let guessed_country = countries_data[guess]

    let distance = mathDistance(guessed_country.latitude, guessed_country.longitude, todays_country.latitude, todays_country.longitude)
    let direction = getDirectionClass(Math.atan2(guessed_country.longitude - todays_country.longitude, guessed_country.latitude - todays_country.latitude) * 180 / Math.PI)

    let formattedDiff = formatDiff({
        hemisphereClass: guessed_country.hemisphere === todays_country.hemisphere ? "good" : "bad",
        hemisphere: guessed_country.hemisphere,
        continentClass: guessed_country.continent === todays_country.continent ? "good" : "bad",
        continent: guessed_country.continent,
        populationClass: guessed_country.pretty_population === todays_country.pretty_population ? "good" : getPopulationClass(guessed_country.population, todays_country.population),
        population: guessed_country.pretty_population,
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
    let formattedDiff = formatWinningDiff(todays_country, already_guessed.length)
    document.getElementById("guesses-container").innerHTML += formattedDiff
    
    if(already_guessed.length > 4) {
        let scroller = document.getElementById("guesses-container")
        makeScrollable(scroller)
    }
    
    document.getElementById('guess-input').disabled = true;
    document.getElementById('guess-input').style.cursor = "not-allowed";
    document.getElementById('submit-button').disabled = true;
    document.getElementById('submit-button').style.cursor = "not-allowed";
    document.getElementById('hint-button').disabled = true;
    document.getElementById('hint-button').style.cursor = "not-allowed";
}

function showSolution() {
    if (!already_guessed.includes(todays_country_name)) {
        already_guessed.push(todays_country_name)
        localStorage.setItem(`countryle-${currentDate}`, JSON.stringify(already_guessed))
        displayWinningGuessRow()
        document.getElementById("guess-input").value = ""
        hideSuggestions()
    }
}

function submitGuess(e) {
    let guessInput = document.getElementById("guess-input")
    let guess = guessInput.value
    if (!countries.includes(guess)) {
        let firstChoice = countries
            .filter(country => !already_guessed.includes(country))
            .find(country => country.toLowerCase().includes(guess.toLowerCase()))
        if (firstChoice) {
            guessInput.value = firstChoice
            submitGuess(e)
        } else {
            alert("Please select a valid country from the suggestions")
        }
    } else if (already_guessed.includes(guess)) {
        alert("You have already guessed this country")
    } else if (guess === todays_country.name) {
        already_guessed.push(guess)
        localStorage.setItem(`countryle-${currentDate}`, JSON.stringify(already_guessed))
        displayWinningGuessRow()
        guessInput.value = ""
    } else {
        already_guessed.push(guess)
        localStorage.setItem(`countryle-${currentDate}`, JSON.stringify(already_guessed))
        displayNewGuessRow(guess)
        guessInput.value = ""
    }
    hideSuggestions()
}

window.onload = loadCountry