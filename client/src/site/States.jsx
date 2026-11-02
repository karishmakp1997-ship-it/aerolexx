export function LoadingState() {
  return (
    <div className="page-state" aria-busy="true" aria-live="polite">
      <div>
        <div className="loader" />
        <p>Loading…</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="page-state" role="alert">
      <div>
        <h2>We couldn’t load the page</h2>
        <p>{message || 'Please check your connection and try again.'}</p>
        {onRetry && <button className="btn btn-red" onClick={onRetry}>Try again</button>}
      </div>
    </div>
  );
}
