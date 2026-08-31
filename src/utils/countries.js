import countriesData from '../assets/countries.json';

export const getFormattedCountries = (language = 'ar') => {
  return countriesData
    .map((country) => ({
      value: country.code,
      label: language === 'ar' ? country.nameAr : country.name,
      flag: `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
