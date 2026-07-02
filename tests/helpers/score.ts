export function getScoreBand(score: number | null) {
  if (score === null) {
    return "unknown";
  }

  if (score >= 80) {
    return "strong";
  }

  if (score >= 60) {
    return "moderate";
  }

  return "needs-work";
}
