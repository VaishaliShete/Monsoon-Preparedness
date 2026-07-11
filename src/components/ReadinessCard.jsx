import { RISK_TIERS } from '../utils/cardSchema'

const TIER_LABEL = Object.fromEntries(
  RISK_TIERS.map((tier) => [tier, `${tier[0].toUpperCase()}${tier.slice(1)} Risk`]),
)

function Bilingual({ en, translated }) {
  if (!translated) return en
  return (
    <>
      {en}
      <span className="translated">{translated}</span>
    </>
  )
}

export default function ReadinessCard({ card, translation }) {
  return (
    <article className="readiness-card" aria-label="Family Flood Readiness Card">
      <header className="readiness-card__header">
        <h2>Family Flood Readiness Card</h2>
        <span className={`risk-badge risk-badge--${card.risk_tier}`}>
          {TIER_LABEL[card.risk_tier] || card.risk_tier}
        </span>
      </header>

      <p className="readiness-card__summary">
        <Bilingual en={card.household_summary} translated={translation?.household_summary} />
      </p>

      <section aria-labelledby="trigger-heading" className="readiness-card__trigger">
        <h3 id="trigger-heading">Evacuate now if...</h3>
        <p>
          <Bilingual en={card.evacuation_trigger} translated={translation?.evacuation_trigger} />
        </p>
      </section>

      <section aria-labelledby="checklist-heading">
        <h3 id="checklist-heading">Prioritized Checklist</h3>
        <ol className="readiness-card__checklist">
          {card.prioritized_checklist.map((item, idx) => (
            <li key={idx}>
              <strong>
                <Bilingual en={item.action} translated={translation?.prioritized_checklist?.[idx]?.action} />
              </strong>
              <span>
                {' '}
                — <Bilingual en={item.reason} translated={translation?.prioritized_checklist?.[idx]?.reason} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="medicine-heading">
        <h3 id="medicine-heading">Medicine & Document Safety</h3>
        <ul>
          {card.medicine_document_safety.map((step, idx) => (
            <li key={idx}>
              <Bilingual en={step} translated={translation?.medicine_document_safety?.[idx]} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contacts-heading">
        <h3 id="contacts-heading">Emergency Contact Template</h3>
        <ul>
          {card.emergency_contacts_template.map((entry, idx) => (
            <li key={idx}>
              <Bilingual en={entry} translated={translation?.emergency_contacts_template?.[idx]} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
