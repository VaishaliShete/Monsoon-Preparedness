import { SUPPORTED_LANGUAGES } from '../services/gemini'

export default function LanguageSelector({ activeLanguage, onSelect, loading }) {
  return (
    <div className="language-selector" role="group" aria-label="Show card in another language">
      <button
        type="button"
        className={activeLanguage === null ? 'is-active' : ''}
        onClick={() => onSelect(null)}
        aria-pressed={activeLanguage === null}
      >
        English only
      </button>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={activeLanguage === lang.code ? 'is-active' : ''}
          onClick={() => onSelect(lang.code)}
          aria-pressed={activeLanguage === lang.code}
          disabled={loading}
        >
          + {lang.name}
        </button>
      ))}
    </div>
  )
}
