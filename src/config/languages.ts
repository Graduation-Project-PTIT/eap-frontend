export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
  },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0]; // English

export const getLanguageByCode = (code: string): Language => {
  return LANGUAGES.find((lang) => lang.code === code) || DEFAULT_LANGUAGE;
};
