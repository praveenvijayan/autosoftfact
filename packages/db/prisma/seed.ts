import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_TODOS = [
  { id: "seed-1", title: "Buy groceries", status: "TODO" },
  { id: "seed-2", title: "Read a book", status: "TODO" },
  { id: "seed-3", title: "Exercise for 30 minutes", status: "COMPLETE" },
  { id: "seed-4", title: "Write unit tests", status: "TODO" },
  { id: "seed-5", title: "Review pull requests", status: "COMPLETE" },
];

async function main() {
  for (const todo of SEED_TODOS) {
    await prisma.todo.upsert({
      where: { id: todo.id },
      update: {},
      create: todo,
    });
  }
  console.log(`Seeded ${SEED_TODOS.length} todos`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
