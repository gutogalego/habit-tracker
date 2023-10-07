import { HabitCheck } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userHabitRouter = createTRPCRouter({
  getHabitsByUserID: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      if (input.userId == "no_user") return [];
      const habits = ctx.prisma.userHabit.findMany({
        where: {
          userId: input.userId,
        },
        take: 200,
      });
      return habits;
    }),

  create: publicProcedure
    .input(
      z.object({
        habitName: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId == "no_user") return [];

      const userTopic = await ctx.prisma.userHabit.create({
        data: {
          habitName: input.habitName,
          userId: input.userId,
        },
      });

      return userTopic;
    }),

  checkHabit: publicProcedure
    .input(
      z.object({
        done: z.boolean(),
        date: z.date(),
        habitId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const habitCheck = await ctx.prisma.habitCheck.upsert({
        where: {
          userHabitId_date: { userHabitId: input.habitId, date: input.date },
        },
        update: { done: input.done },
        create: {
          userHabitId: input.habitId,
          date: input.date,
          done: input.done,
        },
      });

      return habitCheck;
    }),

  getHabitChecksByUserHabitId: publicProcedure
    .input(
      z.object({
        UserHabitId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      const habitChecks = ctx.prisma.habitCheck.findMany({
        where: {
          userHabitId: input.UserHabitId,
        },
        take: 200,
      });
      return habitChecks;
    }),

  getHabitsAndChecks: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.userId == "no_user") return [];

      const habits = await ctx.prisma.userHabit.findMany({
        where: {
          userId: input.userId,
        },
        take: 200,
      });

      const checks: HabitCheck[] = [];
      const promises = [];
      
      for (const habit of habits) {
        promises.push(
          ctx.prisma.habitCheck.findMany({
            where: {
              userHabitId: habit.id,
              done: true
            },
            take: 200,
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      for (const habitChecks of results) {
        checks.push(...habitChecks);
      }
      return {habits, checks};
    }),
});
