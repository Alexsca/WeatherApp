import { describe, it, expect } from "vitest";
import {
  aggregateByYear,
  aggregateByMonth,
  aggregateByDay,
  daysInMonth,
  type DailySeries,
} from "./aggregate";

/**
 * Small synthetic series spanning two years, including a leap day (29 Feb 2020)
 * and a null reading, so we exercise averaging, month filtering, exact-day
 * extraction, and missing-data handling.
 */
const sample: DailySeries = {
  time: [
    "2019-01-01", "2019-01-31", "2019-02-13", "2019-12-31",
    "2020-01-10", "2020-02-13", "2020-02-29", "2020-06-01",
  ],
  temperature_2m_mean: [
    0, 10, 4, -2,
    5, 6, null, 20,
  ],
};

describe("aggregateByYear", () => {
  it("averages all valid days per year and skips nulls", () => {
    const result = aggregateByYear(sample);
    expect(result).toEqual([
      { year: 2019, temp: 3, count: 4 }, // (0+10+4-2)/4 = 3
      { year: 2020, temp: 10.3, count: 3 }, // (5+6+20)/3 = 10.33 -> 10.3, null skipped
    ]);
  });

  it("returns points sorted ascending by year", () => {
    const years = aggregateByYear(sample).map((p) => p.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });
});

describe("aggregateByMonth", () => {
  it("averages only the chosen month within each year", () => {
    const jan = aggregateByMonth(sample, 1);
    expect(jan).toEqual([
      { year: 2019, temp: 5, count: 2 }, // (0+10)/2
      { year: 2020, temp: 5, count: 1 }, // just the 10th
    ]);
  });

  it("omits years with no data in that month", () => {
    const june = aggregateByMonth(sample, 6);
    expect(june).toEqual([{ year: 2020, temp: 20, count: 1 }]);
  });
});

describe("aggregateByDay", () => {
  it("returns one point per year for the exact date", () => {
    const feb13 = aggregateByDay(sample, 2, 13);
    expect(feb13).toEqual([
      { year: 2019, temp: 4, count: 1 },
      { year: 2020, temp: 6, count: 1 },
    ]);
  });

  it("skips years where the date is missing or null (e.g. 29 Feb)", () => {
    const feb29 = aggregateByDay(sample, 2, 29);
    expect(feb29).toEqual([]); // 2020-02-29 is null, 2019 has no 29 Feb
  });
});

describe("daysInMonth", () => {
  it("offers 29 days for February so leap days are selectable", () => {
    expect(daysInMonth(2)).toBe(29);
    expect(daysInMonth(4)).toBe(30);
    expect(daysInMonth(1)).toBe(31);
  });
});
