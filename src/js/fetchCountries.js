const API_URL = "https://api.restcountries.com/countries/v5";
const API_KEY = "rc_live_15b2a069e2584476abba6f4a3ae8b5bb";

export default function fetchCountries(country) {
  return fetch(`${API_URL}?q=${country}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Server error: " + response.status);
      }
      return response.json();
    })
    .then((res) => {
      if (res?.data?.objects && Array.isArray(res.data.objects)) {
        return res.data.objects;
      }
      return [];
    });
}