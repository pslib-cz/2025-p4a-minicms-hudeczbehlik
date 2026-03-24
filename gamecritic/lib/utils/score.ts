export function scoreClass(score: number) {
  if (score <= 4) return "text-red-500";
  if (score <= 6) return "text-yellow-500";
  if (score <= 8) return "text-green-500";
  return "text-emerald-400 font-bold";
}
