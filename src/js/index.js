import debounce from "lodash.debounce";
import { alert, error, Stack } from "@pnotify/core";
import "@pnotify/core/dist/PNotify.css";
import "@pnotify/core/dist/BrightTheme.css";
import fetchCountries from "./fetchCountries.js";

const searchInput = document.querySelector("#country-input");
const countryContainer = document.querySelector("#country-container");

const noticeStack = new Stack({
  dir1: 'down',
  dir2: 'left',
  firstpos1: 10,
  firstpos2: 10,
  modal: false,
  maxOpen: 1,
});

if (searchInput) {
  searchInput.addEventListener("input", debounce(onSearchInput, 500));
}

function onSearchInput() {
  const searchQuery = searchInput.value.trim();

  clearCountryContainer();
  noticeStack.close();

  if (!searchQuery) {
    return;
  }

  fetchCountries(searchQuery)
    .then(handleCountryResult)
    .catch((err) => {
      console.error("Fetch error:", err);
      error({
        text: "Error loading data.",
        delay: 1200,
        stack: noticeStack,
      });
    });
}

function handleCountryResult(countries) {
  if (!countries || countries.length === 0) {
    error({
      text: "Country not found! Check your input.",
      delay: 3000,
      stack: noticeStack,
    });
  } else if (countries.length > 10) {
    alert({
      text: "Too many matches found. Please enter a more specific query!",
      delay: 3000,
      stack: noticeStack,
    });
  } else if (countries.length >= 2 && countries.length <= 10) {
    renderCountryList(countries);
  } else if (countries.length === 1) {
    renderCountryCard(countries[0]);
  }
}

function getCountryName(c) {
  return c.names?.common || c.names?.official || "Unknown";
}

function renderCountryList(countries) {
  const listMarkup = `
    <ul class="country-list">
      ${countries
        .map((c) => `<li class="country-list-item">${getCountryName(c)}</li>`)
        .join("")}
    </ul>
  `;
  countryContainer.innerHTML = listMarkup;
}

function renderCountryCard(country) {
  const name = getCountryName(country);
  let capital = "Unknown";
  if (Array.isArray(country.capitals) && country.capitals.length > 0) {
    capital = country.capitals
      .map((cap) => (typeof cap === "object" ? cap.name || cap.common : cap))
      .filter(Boolean)
      .join(", ");
  }
  const population = country.population
    ? country.population.toLocaleString()
    : "0";
  let languagesList = "";
  if (Array.isArray(country.languages)) {
    languagesList = country.languages
      .map((l) => {
        const langName = typeof l === "object" ? l.name || l.common || Object.values(l)[0] : l;
        return `<li>${langName}</li>`;
      })
      .join("");
  }
  const flagUrl = country.flag.url_png;
  const cardMarkup = `
    <div class="country-card">
      <h1 class="country-title">${name}</h1>
      <div class="country-content">
        <div class="country-details">
          <p><b>Capital:</b> ${capital}</p>
          <p><b>Population:</b> ${population}</p>
          <p><b>Languages:</b></p>
          <ul class="languages-list">
            ${languagesList}
          </ul>
        </div>
        <div class="country-flag-wrapper">
          ${
            flagUrl
              ? `<img src="${flagUrl}" alt="Flag of ${name}" class="country-flag" width="250" />`
              : `<span class="country-code" style="font-size: 48px; font-weight: bold;">${country.codes?.alpha_2 || "CH"}</span>`
          }
        </div>
      </div>
    </div>
  `;
  countryContainer.innerHTML = cardMarkup;
}

function clearCountryContainer() {
  countryContainer.innerHTML = "";
}