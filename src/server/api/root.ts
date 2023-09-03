import { exampleRouter } from "~/server/api/routers/example";
import { userHabitRouter } from "~/server/api/routers/habits"
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  habits: userHabitRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
