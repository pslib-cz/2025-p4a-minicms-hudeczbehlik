import { ReviewForm } from "@/components/forms/review-form";
import { getGameSelectOptions } from "@/lib/db/games";

export default async function NewReviewPage() {
  const games = await getGameSelectOptions();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-white">Create review</h1>
      <ReviewForm games={games} />
    </section>
  );
}
