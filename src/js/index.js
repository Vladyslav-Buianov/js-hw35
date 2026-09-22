import debounce from "lodash.debounce";
import { alert, error } from "@pnotify/core";
import "@pnotify/core/dist/PNotify.css";
import "@pnotify/core/dist/BrightTheme.css";
import fetchCountries from "./fetchCountries.js";

const searchInput = document.querySelector("#country-input");
const countryContainer = document.querySelector("#country-container");

searchInput.addEventListener("input", debounce(onSearchInput, 500));

function onSearchInput(event) {
  const searchQuery = event.target.value.trim();

  clearCountryContainer();

  if (!searchQuery) {
    return;
  }

  fetchCountries(searchQuery)
    .then(handleCountryResult)
    .catch((err) => {
      console.error("Fetch error:", err);
      error({
        text: "Error loading data.",
        delay: 3000,
      });
    });
}

function handleCountryResult(countries) {
  if (!countries || countries.length === 0) {
    error({
      text: "Country not found! Check your input.",
      delay: 3000,
    });
  } else if (countries.length > 10) {
    alert({
      text: "Too many matches found. Please enter a more specific query!",
      delay: 3000,
    });
  } else if (countries.length >= 2 && countries.length <= 10) {
    renderCountryList(countries);
  } else if (countries.length === 1) {
    renderCountryCard(countries[0]);
  }
}

function renderCountryList(countries) {
  const listMarkup = `
<ul class="country-list">
${countries.map((c) => `<li class="country-list-item">${c.name.common}</li>`).join("")}
</ul>
`;
  countryContainer.innerHTML = listMarkup;
}

function renderCountryCard(country) {
  const name = country.name.common;
  const capital = country.capital ? country.capital.join(", ") : "Unknown";
  const population = country.population
    ? country.population.toLocaleString("en-US")
    : "0";
  const languages = country.languages
    ? Object.values(country.languages).join(", ")
    : "Unknown";
  const flag = country.flags ? country.flags.svg || country.flags.png : "";

  const cardMarkup = ` 
<div class="country-card"> 
<h2 class="country-name">${name}</h2> 
<div class="country-info-wrapper"> 
<div class="country-details"> 
<p><b>Capital:</b> ${capital}</p> 
<p><b>Population:</b> ${population}</p> 
<p><b>Languages:</b></p> 
<ul> 
${
  country.languages
    ? Object.values(country.languages)
        .map((lang) => `<li>${lang}</li>`)
        .join("")
    : ""
} 
</ul> 
</div> 
<div class="country-flag-wrapper"> 
<img src="${flag}" alt="Flag of ${name}" class="country-flag" width="200" /> 
</div> 
</div> 
</div> 
`;
  countryContainer.innerHTML = cardMarkup;
}

function clearCountryContainer() {
  countryContainer.innerHTML = "";
}
