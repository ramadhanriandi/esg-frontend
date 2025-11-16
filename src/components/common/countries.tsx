import { countries as countriesMap } from "countries-list";

export type Country = {
  code: string;
  name: string;
};

export const countries: Country[] = Object.entries(countriesMap)
  .map(([code, data]) => ({
    code,
    name: (data as { name: string }).name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
