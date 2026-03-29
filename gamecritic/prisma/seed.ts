import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoPassword = await hash("demo123456", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@gamecritic.local" },
    update: { passwordHash: demoPassword },
    create: {
      email: "demo@gamecritic.local",
      name: "Demo Recenzent",
      passwordHash: demoPassword,
    },
  });

  const genreDefinitions = [
    { name: "Akce", slug: "action" },
    { name: "RPG", slug: "rpg" },
    { name: "Dobrodružné", slug: "adventure" },
    { name: "Strategie", slug: "strategy" },
    { name: "Simulátory", slug: "simulation" },
    { name: "Závodní", slug: "racing" },
    { name: "Sportovní", slug: "sports" },
    { name: "Střílečky", slug: "shooter" },
    { name: "Horor", slug: "horror" },
    { name: "Puzzle", slug: "puzzle" },
    { name: "Plošinovky", slug: "platformer" },
    { name: "Bojové", slug: "fighting" },
    { name: "MMO", slug: "mmo" },
    { name: "Roguelike", slug: "roguelike" },
    { name: "Sandbox", slug: "sandbox" },
    { name: "Open World", slug: "open-world" },
    { name: "Survival", slug: "survival" },
    { name: "Stealth", slug: "stealth" },
    { name: "Visual Novel", slug: "visual-novel" },
  ] as const;

  const genresBySlug = new Map<string, { id: string; name: string; slug: string }>();

  for (const genre of genreDefinitions) {
    const upserted = await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: { name: genre.name },
      create: { name: genre.name, slug: genre.slug },
    });
    genresBySlug.set(upserted.slug, upserted);
  }

  const action = genresBySlug.get("action");
  const rpg = genresBySlug.get("rpg");

  if (!action || !rpg) {
    throw new Error("Nepodařilo se připravit povinné žánry action/rpg.");
  }

  const tagSp = await prisma.tag.upsert({
    where: { slug: "single-player" },
    update: {},
    create: { name: "Single-player", slug: "single-player" },
  });

  const tagIndie = await prisma.tag.upsert({
    where: { slug: "indie" },
    update: {},
    create: { name: "Indie", slug: "indie" },
  });

  const gameA = await prisma.game.upsert({
    where: { slug: "nebula-quest" },
    update: {},
    create: {
      title: "Nebula Quest",
      slug: "nebula-quest",
      description: "Sci-fi RPG s procedurálními světy (demo data).",
      releaseYear: 2023,
      coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80",
      addedById: demoUser.id,
      genres: { connect: [{ id: rpg.id }, { id: action.id }] },
      tags: { connect: [{ id: tagSp.id }, { id: tagIndie.id }] },
    },
  });

  const gameB = await prisma.game.upsert({
    where: { slug: "pixel-racer" },
    update: {},
    create: {
      title: "Pixel Racer",
      slug: "pixel-racer",
      description: "Arkádové závody v retro stylu.",
      releaseYear: 2024,
      addedById: demoUser.id,
      genres: { connect: [{ id: action.id }] },
      tags: { connect: [{ id: tagIndie.id }] },
    },
  });

  await prisma.review.upsert({
    where: { slug: "nebula-quest-prvni-dojmy" },
    update: {},
    create: {
      title: "Nebula Quest — první dojmy",
      slug: "nebula-quest-prvni-dojmy",
      content:
        "<p>Silný vizuál a zajímavý soubojový systém. <strong>Doporučuji</strong> vyzkoušet.</p>",
      score: 8,
      status: "PUBLISHED",
      publishDate: new Date("2024-06-01T12:00:00.000Z"),
      gameId: gameA.id,
      authorId: demoUser.id,
    },
  });

  await prisma.review.upsert({
    where: { slug: "pixel-racer-kratka-recenze" },
    update: {},
    create: {
      title: "Pixel Racer — krátká recenze",
      slug: "pixel-racer-kratka-recenze",
      content: "<p>Rychlá zábava na večer. Ovládání je přesné, obsah menší.</p>",
      score: 7,
      status: "PUBLISHED",
      publishDate: new Date("2024-09-15T10:00:00.000Z"),
      gameId: gameB.id,
      authorId: demoUser.id,
    },
  });

  await prisma.review.upsert({
    where: { slug: "draft-nebula-draft" },
    update: {},
    create: {
      title: "Draft: rozpracovaná recenze",
      slug: "draft-nebula-draft",
      content: "<p>Tento koncept ještě není publikován.</p>",
      score: 6,
      status: "DRAFT",
      publishDate: null,
      gameId: gameA.id,
      authorId: demoUser.id,
    },
  });

  console.log("Seed dokončen. Demo účet: demo@gamecritic.local / demo123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
