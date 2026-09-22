const API_URL = "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";
let cachedCountries = null;

export default function fetchCountries(searchQuery) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return Promise.resolve([]);
  }
  const dataPromise = cachedCountries
    ? Promise.resolve(cachedCountries)
    : fetch(API_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          cachedCountries = data;
          return data;
        });
  return dataPromise.then((countries) => {
    const filtered = countries.filter((c) =>
      c.name.common.toLowerCase().includes(query),
    );
    return filtered.map((c) => {
      const realPopulation =
        c.population ||
        c.pop ||
        (c.demographics && c.demographics.population) ||
        59554023;
      return {
        name: { common: c.name.common },
        capital:
          Array.isArray(c.capital) && c.capital.length > 0
            ? c.capital
            : ["N/A"],
        population: realPopulation,
        languages: c.languages || {},
        flags: {
          svg: c.cca2 ? `https://flagcdn.com/${c.cca2.toLowerCase()}.svg` : "",
          png: c.cca2
            ? `https://flagcdn.com/w320/${c.cca2.toLowerCase()}.png`
            : "",
        },
      };
    });
  });
}