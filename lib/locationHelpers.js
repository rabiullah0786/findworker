import { indiaData } from "@/app/data/locations";

// Simple translations map for state/district labels.
// This is intentionally small as a starting point — we fallback to English when translation is missing.
export const locationTranslations = {
  "Andhra Pradesh": { hi: "आंध्र प्रदेश", ur: "آندھرا پردیش" },
  Bihar: { hi: "बिहार", ur: "بہار" },
  Karnataka: { hi: "कर्नाटक", ur: "کرنٹکا" },
  Maharashtra: { hi: "महाराष्ट्र", ur: "مہاراشٹر" },
  "Uttar Pradesh": { hi: "उत्तर प्रदेश", ur: "اتر پردیش" },
  "Tamil Nadu": { hi: "तमिलनाडु", ur: "تامِل ناڈو" },
  Kerala: { hi: "केरल", ur: "کیڑلا" },
};

function translateLabel(label, lang) {
  if (!lang || lang === "en") return label;
  const stateEntry = locationTranslations[label];
  if (stateEntry && stateEntry[lang]) return stateEntry[lang];
  return label; // fallback
}

// Return array of { key, label }
export function getStates(lang = "en") {
  return Object.keys(indiaData).map((state) => ({
    key: state,
    label: translateLabel(state, lang),
  }));
}

// Return array of { key, label }
export function getDistricts(stateKey, lang = "en") {
  if (!stateKey || !indiaData[stateKey]) return [];
  const districtsObj = indiaData[stateKey].districts || {};
  return Object.keys(districtsObj).map((d) => ({
    key: d,
    label: d, // leaving district translation as-is for now
  }));
}

// Return array of simple city strings (no translation by default)
export function getCities(stateKey, districtKey) {
  if (!stateKey || !districtKey) return [];
  const districtsObj = indiaData[stateKey]?.districts || {};
  const cities = districtsObj[districtKey] || [];
  return cities;
}

export default {
  getStates,
  getDistricts,
  getCities,
};
