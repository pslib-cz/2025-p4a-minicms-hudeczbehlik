import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GameForm } from "@/components/forms/game-form";
import { getGameFilterData } from "@/lib/db/games";

export default async function NewGamePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/games/new");
  }

  const { genres, tags } = await getGameFilterData();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-white">Add game</h1>
      <GameForm genres={genres} tags={tags} />
    </section>
  );
}
