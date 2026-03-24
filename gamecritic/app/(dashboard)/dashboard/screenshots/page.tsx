import { auth } from "@/auth";
import { ScreenshotManager } from "@/components/forms/screenshot-manager";
import { getGameSelectOptions } from "@/lib/db/games";
import { getMyScreenshots } from "@/lib/db/screenshots";

export default async function ScreenshotsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [games, screenshots] = await Promise.all([
    getGameSelectOptions(),
    getMyScreenshots(session.user.id),
  ]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-slate-900">Screenshots</h1>
      <ScreenshotManager games={games} screenshots={screenshots} />
    </section>
  );
}
