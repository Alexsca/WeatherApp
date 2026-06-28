import { useMemo, useState } from "react";
import { CITIES, type City } from "../data/cities";

interface Props {
  selected: City | null;
  onSelect: (city: City) => void;
}

/** A search box that filters the starter list of cities as you type. */
export default function CitySearch({ selected, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }, [query]);

  function choose(city: City) {
    onSelect(city);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="city-search">
      <input
        type="text"
        className="city-search__input"
        placeholder={selected ? selected.name : "Search a city…"}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-label="Search a city"
      />
      {open && (
        <ul className="city-search__list">
          {matches.length === 0 && (
            <li className="city-search__empty">No cities match “{query}”.</li>
          )}
          {matches.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={
                  "city-search__option" +
                  (selected?.id === c.id ? " is-selected" : "")
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
              >
                <span>{c.name}</span>
                <span className="city-search__country">{c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
