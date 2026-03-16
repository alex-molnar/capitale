
function loadCapitale() {
    let currentDate = new Date().toJSON().slice(0, 10);
    let todays_capital_name = capitalForTheDay[currentDate]
    let todays_capital = capitals_data[todays_capital_name]
    document.getElementById("temp").innerHTML = todays_capital.name
}

window.onload = loadCapitale