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
function updateCountries(){
    var now = moment();
    var elapsed = moment.duration(now.diff(start)).asSeconds();

    $("#country-table-body").html("");

    for (var country in emissions) {
        // calculate time left
        if (!Number.isNaN(emissions[country]["emission_budget_15"])) {
            var countryBudgetTotal = Math.round(emissions[country]["emission_budget_15"]);
            var countryBudgetLeft = Math.round(countryBudgetTotal - (elapsed * emissions[country]["emission_per_second"]));
            var countryPercentageBudgetLeft = Math.round((countryBudgetTotal / emissions["world"]["emission_budget_15"]) * 10000) / 100;
        } else {
            countryBudgetTotal = countryBudgetLeft = countryPercentageBudgetLeft = 0;
        }

        // create table row
        $("#country-table-body").append(
            "<tr>" +
                "<td>" + country + "</td>" +
                "<td>" + numberFormatter(countryBudgetTotal) + "</td>" +
                "<td>" + countryPercentageBudgetLeft + "%</td>" +
                "<td>" + numberFormatter(countryBudgetLeft) + "</td>" +
            "</tr>"
        );
    }

    setTimeout(updateCountries, 1000);
}

/**
 * Update countdown at the top of the page every second.
 */
function updateCountdown(){
    var now = moment();
    var elapsed = moment.duration(now.diff(start)).asSeconds();

    // calculate global timer
    var worldBudgetTotal = emissions["world"]["emission_budget_15"];
    var worldBudgetLeft = worldBudgetTotal - (elapsed * emissions["world"]["emission_per_second"]);
    var totalSecondsLeft = worldBudgetLeft/emissions["world"]["emission_per_second"];
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
    spanEmissionsPerSecond.innerHTML = numberFormatter(Math.round(emissions["world"]["emission_per_second"]));

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
updateCountries();
