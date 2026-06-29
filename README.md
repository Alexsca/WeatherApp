# Temperature over time

A small website that visualizes how temperatures have changed across the years
for a set of cities. Pick a city, then explore by **year**, **month**, or a
**single day** — each view plots one point per year so you can see the
long-term trend at a glance, with the latest year highlighted.

- **Year** — average temperature for each year.
- **Month** (e.g. January) — that month's average, year by year.
- **Day** (e.g. 13 Feb) — the temperature on that exact date, year by year.
- **Hot days** — drag a temperature slider to count how many days the daily
  high reached that value or above, in total and per year (bar chart by year).

## Data

Temperatures come from the free [Open-Meteo Historical Weather
API](https://open-meteo.com/en/docs/historical-weather-api) (ERA5 reanalysis),
called directly from the browser — no API key, no backend. Each city's full
daily history (from 1950 to today) is fetched once and cached, so switching
views is instant.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Recharts](https://recharts.org/) for the line chart
- [Vitest](https://vitest.dev/) for unit tests

## Getting started

```bash
npm install
npm run dev      # start the dev server (prints a local URL)
```

Then open the printed URL, search for a city (e.g. Gothenburg), and switch
between Year / Month / Day.

## Other commands

```bash
npm test         # run the aggregation unit tests
npm run build    # type-check + produce a static build in dist/
npm run preview  # preview the production build locally
```

## Adding more cities

Cities are data-driven. Append an entry (with latitude/longitude) to
`src/data/cities.ts` and it shows up in the search immediately.
