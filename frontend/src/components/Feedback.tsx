export function Feedback({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <div className="feedback">
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice success" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
