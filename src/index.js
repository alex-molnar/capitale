let gameTitle = PARAM_GAME_TITLE
let alreadyGuessed = [] 
let currentDate = new Date().toJSON().slice(0, 10);
let todaysSolutionName = getRandomSolutionForToday()
let todaysSolution = solutionsData[todaysSolutionName]
let selectedSuggestionIndex = -1

function getRandomSolutionForToday() {
  let seed = parseInt(currentDate.replaceAll("-", ""));
  // LCG using GCC's constants
  m = 0x80000000; // 2**31;
  a = 1103515245;
  c = 12345;

  return solutions[Math.floor((((a * seed + c) % m) / m) * solutions.length)]
}

function getAlreadyGuessedToday() {
    if (localStorage.getItem(`${gameTitle}-${currentDate}`) != null) {
        alreadyGuessed = JSON.parse(localStorage.getItem(`${gameTitle}-${currentDate}`))
    } else {
        localStorage.clear()
        alreadyGuessed = []
        localStorage.setItem(`${gameTitle}-${currentDate}`, JSON.stringify(alreadyGuessed))
    }
}

function loadGame() {
    getAlreadyGuessedToday()
    alreadyGuessed
        .filter(guess => guess !== todaysSolutionName)
        .forEach((guess, index) => displayNewGuessRow(guess, index + 1))
    if (alreadyGuessed.includes(todaysSolutionName)) {
        displayWinningGuessRow()
    } else {
        let guessInput = document.getElementById("guess-input")
        guessInput.addEventListener("input", searchForSolution)
        guessInput.addEventListener("keydown", handleKeyboardNavigation)
        guessInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitGuess(e)
            }
        })
        guessInput.addEventListener("blur", () => {
            setTimeout(hideSuggestions, 150) // Delay to allow click on suggestion
        })
        guessInput.focus()
        guessInput.select()
        document.getElementById("submit-button").addEventListener("click", submitGuess)
        document.getElementById("hint-button").addEventListener("click", showSolution)
    }
}

function searchForSolution(e) {
    let guess = e.target.value
    let suggestionsContainer = document.getElementById("suggestions-container")
    selectedSuggestionIndex = -1
    
    if (guess.length > 0 && !solutions.includes(guess)) {
        let filteredSolutions = solutions
            .filter(solution => solution.toLowerCase().startsWith(guess.toLowerCase().trim()) || solution.toLowerCase().includes(`(${guess.toLowerCase().trim()}`))
            .filter(solution => !alreadyGuessed.includes(solution))
            .slice(0, 8) // Limit to 8 suggestions
        
        if (filteredSolutions.length > 0) {
            suggestionsContainer.innerHTML = filteredSolutions.map((solution, index) => 
                `<div class="suggestion-item" data-value="${solution}" data-index="${index}">${solution}</div>`
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

function displayNewGuessRow(guess, no = alreadyGuessed.length) {
    let guessedSolution = solutionsData[guess]

    let distance = mathDistance(guessedSolution.latitude, guessedSolution.longitude, todaysSolution.latitude, todaysSolution.longitude)
    let direction = getDirectionClass(Math.atan2(guessedSolution.longitude - todaysSolution.longitude, guessedSolution.latitude - todaysSolution.latitude) * 180 / Math.PI)

    let formattedDiff = formatDiff({
        hemisphereClass: guessedSolution.hemisphere === todaysSolution.hemisphere ? "good" : "bad",
        hemisphere: guessedSolution.hemisphere,
        continentClass: guessedSolution.continent === todaysSolution.continent ? "good" : "bad",
        continent: guessedSolution.continent,
        populationClass: guessedSolution.pretty_population === todaysSolution.pretty_population ? "good" : getPopulationClass(guessedSolution.population, todaysSolution.population),
        population: guessedSolution.pretty_population,
        distanceClass: distance.distanceClass, 
        distance: `${distance.distance} km`, 
        directionClass: direction.directionClass,
        direction: direction.direction,
        guess: `${no}. ${guess}`
    })
    let container = document.getElementById("guesses-container")
    container.insertAdjacentHTML('beforeend', formattedDiff)
    let newRow = container.lastElementChild
    if (newRow && newRow.classList.contains('guess-row')) {
        newRow.classList.add('new')
        setTimeout(() => newRow.classList.remove('new'), 1000)
    }

    if(alreadyGuessed.length > 4) {
        let scroller = document.getElementById("guesses-container")
        makeScrollable(scroller)
    }
}

function displayWinningGuessRow(triggerConfetti = false) {
    let formattedDiff = formatWinningDiff(todaysSolution, alreadyGuessed.length)
    let container = document.getElementById("guesses-container")
    container.insertAdjacentHTML('beforeend', formattedDiff)
    let newRow = container.lastElementChild
    if (newRow && newRow.classList.contains('guess-row')) {
        newRow.classList.add('new')
        setTimeout(() => newRow.classList.remove('new'), 1000)
    }
    
    container.insertAdjacentHTML('beforeend', formatIframe(todaysSolutionName))
    
    if(alreadyGuessed.length > 4) {
        let scroller = document.getElementById("guesses-container")
        makeScrollable(scroller)
    }
    
    document.getElementById('guess-input').disabled = true;
    document.getElementById('guess-input').style.cursor = "not-allowed";
    document.getElementById('submit-button').disabled = true;
    document.getElementById('submit-button').style.cursor = "not-allowed";
    document.getElementById('hint-button').disabled = true;
    document.getElementById('hint-button').style.cursor = "not-allowed";
    
    if (triggerConfetti) {
        launchConfetti()
    }
}

function launchConfetti() {
    let container = document.getElementById('confetti-container')
    if (!container) {
        container = document.createElement('div')
        container.id = 'confetti-container'
        document.body.appendChild(container)
    }
    
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea', '#00a629', '#0b74de']
    const shapes = ['square', 'circle', 'ribbon']
    const confettiCount = 150
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div')
            confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`
            confetti.style.left = Math.random() * 100 + '%'
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'
            confetti.style.animationDelay = Math.random() * 0.5 + 's'
            container.appendChild(confetti)
            
            setTimeout(() => confetti.remove(), 4500)
        }, i * 20)
    }
    
    setTimeout(() => container.innerHTML = '', 5000)
}

function showSolution() {
    if (!alreadyGuessed.includes(todaysSolutionName)) {
        alreadyGuessed.push(todaysSolutionName)
        localStorage.setItem(`${gameTitle}-${currentDate}`, JSON.stringify(alreadyGuessed))
        displayWinningGuessRow()
        document.getElementById("guess-input").value = ""
        hideSuggestions()
    }
}

function submitGuess(e) {
    let guessInput = document.getElementById("guess-input")
    let guess = guessInput.value
    if (!solutions.includes(guess)) {
        let firstChoice = solutions
            .filter(solution => !alreadyGuessed.includes(solution))
            .find(solution => solution.toLowerCase().startsWith(guess.toLowerCase().trim()) || solution.toLowerCase().includes(`(${guess.toLowerCase().trim()}`))
        if (firstChoice && guess.toLowerCase().trim().length > 0) {
            guessInput.value = firstChoice.trim()
            submitGuess(e)
        } else if (guess.toLowerCase().trim().length > 0) {
            alert(`Please select a valid ${gameTitle.unLe()} from the suggestions`)
        }
    } else if (alreadyGuessed.includes(guess)) {
        alert(`You have already guessed this ${gameTitle.unLe()}`)
    } else if (guess === todaysSolution.name) {
        alreadyGuessed.push(guess)
        localStorage.setItem(`${gameTitle}-${currentDate}`, JSON.stringify(alreadyGuessed))
        displayWinningGuessRow(true)
        guessInput.value = ""
    } else {
        alreadyGuessed.push(guess)
        localStorage.setItem(`${gameTitle}-${currentDate}`, JSON.stringify(alreadyGuessed))
        displayNewGuessRow(guess)
        guessInput.value = ""
    }
    hideSuggestions()
}

document.title = `${gameTitle.capitalize()} v2`
window.onload = loadGame