import { GameForm } from "@/components/forms/game-form";
import { getGameFilterData } from "@/lib/db/games";

export default async function NewGamePage() {
  const { genres, tags } = await getGameFilterData();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-slate-900">Add game</h1>
      <GameForm genres={genres} tags={tags} />
    </section>
  );
}
