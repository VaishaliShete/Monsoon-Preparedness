const TIER_LABEL = {
  moderate: 'Moderate Risk',
  high: 'High Risk',
  severe: 'Severe Risk',
}

export default function ReadinessCard({ card }) {
  return (
    <article className="readiness-card" aria-label="Family Flood Readiness Card">
      <header className="readiness-card__header">
        <h2>Family Flood Readiness Card</h2>
        <span className={`risk-badge risk-badge--${card.risk_tier}`}>
          {TIER_LABEL[card.risk_tier] || card.risk_tier}
        </span>
      </header>

      <p className="readiness-card__summary">{card.household_summary}</p>

      <section aria-labelledby="trigger-heading" className="readiness-card__trigger">
        <h3 id="trigger-heading">Evacuate now if...</h3>
        <p>{card.evacuation_trigger}</p>
      </section>

      <section aria-labelledby="checklist-heading">
        <h3 id="checklist-heading">Prioritized Checklist</h3>
        <ol className="readiness-card__checklist">
          {card.prioritized_checklist.map((item, idx) => (
            <li key={idx}>
              <strong>{item.action}</strong>
              <span> — {item.reason}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="medicine-heading">
        <h3 id="medicine-heading">Medicine & Document Safety</h3>
        <ul>
          {card.medicine_document_safety.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contacts-heading">
        <h3 id="contacts-heading">Emergency Contact Template</h3>
        <ul>
          {card.emergency_contacts_template.map((entry, idx) => (
            <li key={idx}>{entry}</li>
          ))}
        </ul>
      </section>
    </article>
  )
}
