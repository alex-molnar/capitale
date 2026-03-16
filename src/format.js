function format(str, ...values) {
  return str.replace(/{(\d+)}/g, function(match, index) {
    return typeof values[index] !== 'undefined' ? values[index] : match;
  });
}

guessTemplate = `
<div class="guess-header">{10}</div>
<div class="guess-row">
    <div class="guess-circle {0}" id="guess-hemisphere">{1}</div>
    <div class="guess-circle {2}" id="guess-continent">{3}</div>
    <div class="guess-circle {4}" id="guess-population">{5}</div>
    <div class="guess-circle {6}" id="guess-distance">{7}</div>
    <div class="guess-circle natural {8}" id="guess-direction">{9}</div>
</div>`

function formatDiff(diff) {
    return format(
        guessTemplate, 
        diff.hemisphereClass, 
        diff.hemisphere, 
        diff.continentClass, 
        diff.continent, 
        diff.populationClass, 
        diff.population, 
        diff.distanceClass, 
        diff.distance, 
        diff.directionClass, 
        diff.direction,
        diff.guess
    );
}