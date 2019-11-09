var cdYears = document.getElementById("cd-years");
var cdMonths = document.getElementById("cd-months");
var cdDays = document.getElementById("cd-days");
var cdHours = document.getElementById("cd-hours");
var cdMinutes = document.getElementById("cd-minutes");
var cdSeconds = document.getElementById("cd-seconds");
var spanPercentageLeft = document.getElementById("percentage-left");
var spanBudgetLeft = document.getElementById("budget-left");
var spanEmissionsPerSecond = document.getElementById("emissions-per-seconds");

var start = moment("2018-01-01");
var percentageBudgetLeft = 0;

/**
 * Format a number to string format, with commas to separate groups of thousands.
 */
function numberFormatter(numberToFormat) {
    return numberToFormat.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

/**
 * Update countries measures every second.
 */
function updateCountries(emissionsData){
    var now = moment();
    var elapsed = moment.duration(now.diff(start)).asSeconds();

    var worldEmissions = emissionsData.find(function(entry) { return entry.name === 'World'});

    $("#country-table-body").html(
      "<tr class='world-emissions-data'>" +
          "<td>World</td>" +
          "<td>" + numberFormatter(Math.round(worldEmissions["emission_budget_15"])) + "</td>" +
          "<td>100%</td>" +
          "<td>" + numberFormatter(Math.round(worldEmissions["emission_budget_15"] - (elapsed * worldEmissions["emission_per_second"]))) + "</td>" +
      "</tr>"
    );

    for (var country of emissionsData) {
        // calculate time left
        if (!Number.isNaN(country["emission_budget_15"])) {
            var countryBudgetTotal = Math.round(country["emission_budget_15"]);
            var countryBudgetLeft = Math.round(countryBudgetTotal - (elapsed * country["emission_per_second"]));
            var countryPercentageBudgetLeft = Math.round((countryBudgetTotal / worldEmissions["emission_budget_15"]) * 10000) / 100;
        } else {
            countryBudgetTotal = countryBudgetLeft = countryPercentageBudgetLeft = 0;
        }

        

        // create table row
        if(country.name !== 'World') {
          $("#country-table-body").append(
            "<tr>" +
                "<td>" + country.name + "</td>" +
                "<td>" + numberFormatter(countryBudgetTotal) + "</td>" +
                "<td>" + countryPercentageBudgetLeft + "%</td>" +
                "<td>" + numberFormatter(countryBudgetLeft) + "</td>" +
            "</tr>"
          );
        }

    }
    setTimeout(function(){ updateCountries(emissionsData); }, 1000);
}

function sortByName(direction) {
  return emissions.sort(function(curr, next) {
    if(direction === 'desc') {
      return next.name < curr.name ? 1 : -1;
    }
    return next.name > curr.name ? 1 : -1;
  });
}

function sortByBudget(direction) {
  return emissions.sort(function(curr, next) {
    return direction === 'desc'
      ? next['emission_budget_15'] - curr['emission_budget_15']
      : curr['emission_budget_15'] - next['emission_budget_15'];
  });
}

function orderCategory(categoryName, direction) {
  var sortedEmissionsData = categoryName === 'name'
    ? sortByName(direction)
    : sortByBudget(direction);

  updateCountries(sortedEmissionsData)
}

/**
 * Update countdown at the top of the page every second.
 */
function updateCountdown(){
    var now = moment();
    var elapsed = moment.duration(now.diff(start)).asSeconds();
    var worldEmissions = emissions.find(function(entry) { return entry.name === 'World'});

    // calculate global timer
    var worldBudgetTotal = worldEmissions["emission_budget_15"];
    var worldBudgetLeft = worldBudgetTotal - (elapsed * worldEmissions["emission_per_second"]);
    var totalSecondsLeft = worldBudgetLeft/worldEmissions["emission_per_second"];
    percentageBudgetLeft = Math.round((worldBudgetLeft/worldBudgetTotal) * 10000) / 100;

    var years = Math.floor(totalSecondsLeft / 31536000);
    totalSecondsLeft %= 31536000;
    var months = Math.floor(totalSecondsLeft / 2592000);
    totalSecondsLeft %= 2592000;
    var days = Math.floor(totalSecondsLeft / 86400);
    totalSecondsLeft %= 86400;
    var hours = Math.floor(totalSecondsLeft / 3600);
    totalSecondsLeft %= 3600;
    var minutes = Math.floor(totalSecondsLeft / 60);
    totalSecondsLeft = Math.floor(totalSecondsLeft % 60);

    // update html
    cdYears.innerHTML = ('0' + years).slice(-2);
    cdMonths.innerHTML = ('0' + months).slice(-2);
    cdDays.innerHTML = ('0' + days).slice(-2);
    cdHours.innerHTML = ('0' + hours).slice(-2);
    cdMinutes.innerHTML = ('0' + minutes).slice(-2);
    cdSeconds.innerHTML = ('0' + totalSecondsLeft).slice(-2);

    spanPercentageLeft.innerHTML = percentageBudgetLeft;
    spanBudgetLeft.innerHTML = numberFormatter(Math.floor(worldBudgetLeft));
    spanEmissionsPerSecond.innerHTML = numberFormatter(Math.round(worldEmissions["emission_per_second"]));

    setTimeout(updateCountdown, 1000);
}

/**
 * Resize the black rectangle behind the logo to illustrate percentage of budget left.
 */
function resizeMeter(){
    treeColor = document.getElementById("xr-black");
    width = treeColor.offsetWidth;
    height = treeColor.offsetHeight;
    startY = Math.round(height - (height * percentageBudgetLeft / 100));

    treeColor.style.clip = "rect(" + startY + "px, " + width + "px, " + height + "px, 0px)";
}

// Start up everything
updateCountdown();
resizeMeter();
updateCountries(emissions);
