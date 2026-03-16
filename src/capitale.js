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

function displayNewGuessRow(guess) {
    console.log(guess)
}

function displayWinningGuessRow() {
    console.log("You win!")
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
        displayNewGuessRow(guess)
        already_guessed.push(guess)
        guessInput.value = ""
    }
    document.getElementById("suggestions").innerHTML = ""
}

window.onload = loadCapitale