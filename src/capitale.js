let already_guessed = []
let currentDate = new Date().toJSON().slice(0, 10);
let todays_capital_name = getRandomCapitalForToday()
let todays_capital = capitals_data[todays_capital_name]
document.title = `Capitale`

function getRandomCapitalForToday() {
  let seed = parseInt(currentDate.replaceAll("-", ""));
  // LCG using GCC's constants
  m = 0x80000000; // 2**31;
  a = 1103515245;
  c = 12345;

  return capitals[Math.floor((((a * seed + c) % m) / m) * capitals.length)]
}

function getAlreadyGuessedToday(date) {
    if (localStorage.getItem(`capitale-${date}`) != null) {
        already_guessed = JSON.parse(localStorage.getItem(`capitale-${date}`))
    } else {
        localStorage.clear()
        already_guessed = []
        localStorage.setItem(`capitale-${date}`, JSON.stringify(already_guessed))
    }
}

function loadCapitale() {
    getAlreadyGuessedToday(currentDate)
    already_guessed.filter(guess => guess !== todays_capital_name).forEach((guess, index) => displayNewGuessRow(guess, index + 1))
    if (already_guessed.includes(todays_capital_name)) {
        displayWinningGuessRow()
    } else {
        document.getElementById("guess-input").addEventListener("input", searchForCapital)
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

function searchForCapital(e) {
    let guess = e.target.value
    let suggestionsContainer = document.getElementById("suggestions-container")
    selectedSuggestionIndex = -1
    
    if (guess.length > 0 && !capitals.includes(guess)) {
        let filteredCapitals = capitals
            .filter(capital => capital.toLowerCase().startsWith(guess.toLowerCase()) || capital.toLowerCase().includes(`(${guess.toLowerCase()}`))
            .filter(capital => !already_guessed.includes(capital))
            .slice(0, 8) // Limit to 8 suggestions
        
        if (filteredCapitals.length > 0) {
            suggestionsContainer.innerHTML = filteredCapitals.map((capital, index) => 
                `<div class="suggestion-item" data-value="${capital}" data-index="${index}">${capital}</div>`
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
    document.getElementById('hint-button').disabled = true;
    document.getElementById('hint-button').style.cursor = "not-allowed";
}

function showSolution() {
    if (!already_guessed.includes(todays_capital_name)) {
        already_guessed.push(todays_capital_name)
        localStorage.setItem(`capitale-${currentDate}`, JSON.stringify(already_guessed))
        displayWinningGuessRow()
        document.getElementById("guess-input").value = ""
        hideSuggestions()
    }
}

function submitGuess(e) {
    let guessInput = document.getElementById("guess-input")
    let guess = guessInput.value
    if (!capitals.includes(guess)) {
        let firstChoice = capitals
            .filter(capital => !already_guessed.includes(capital))
            .find(capital => capital.toLowerCase().startsWith(guess.toLowerCase()) || capital.toLowerCase().includes(`(${guess.toLowerCase()}`))
        if (firstChoice) {
            guessInput.value = firstChoice
            submitGuess(e)
        } else {
            alert("Please select a valid city from the suggestions")
        }
    } else if (already_guessed.includes(guess)) {
        alert("You have already guessed this city")
    } else if (guess === todays_capital.name) {
        already_guessed.push(guess)
        localStorage.setItem(`capitale-${currentDate}`, JSON.stringify(already_guessed))
        displayWinningGuessRow()
        guessInput.value = ""
    } else {
        already_guessed.push(guess)
        localStorage.setItem(`capitale-${currentDate}`, JSON.stringify(already_guessed))
        displayNewGuessRow(guess)
        guessInput.value = ""
    }
    hideSuggestions()
}

window.onload = loadCapitale