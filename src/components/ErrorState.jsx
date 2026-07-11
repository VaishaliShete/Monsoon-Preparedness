export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <h2>Couldn't generate your readiness card</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}
