import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { api } from "~/utils/api";
import { getLast11Days } from "~/utils/helpers";
import { HabitCheckerTable } from "~/components/HabitCheckerTable";
import { HabitGrid } from "../components/HabitGrid";

export type Habit = {
  habitName: string;
  userId: string;
};

export type Check = {
  userHabitId: string;
  date: Date;
  done: boolean;
};

export type HabitsAndChecks = {
  checks: Check[];
  habits: Habit[];
};

const LoginComponent = () => {
  const { data: sessionData } = useSession();

  if (sessionData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <button
          className=" h-8 w-28 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-slate-600 to-slate-500 text-sm font-medium text-white transition-opacity duration-300 hover:from-gray-500 hover:to-gray-600"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <button
        className="flex h-8 w-28 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-neutral-600 to-neutral-500 text-sm font-medium text-white transition-opacity duration-300 hover:from-amber-500 hover:to-amber-600"
        onClick={() => void signIn("google")}
      >
        Login
      </button>
    </div>
  );
};

export default function Home() {
  const last11Days = getLast11Days();

  const { data: sessionData } = useSession();
  const { data: habitsAndChecks, isLoading } =
    api.habits.getHabitsAndChecks.useQuery({
      userId: sessionData?.user.id ?? "no_user",
    });

  return (
    <>
      <Head>
        <title>Habit Tracker</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-neutral-100">
        <div className="divide-y-4 divide-dashed">
          <div className="grid grid-cols-12">
            <LoginComponent />

            {last11Days.map((day, index) => (
              <span
                key={index}
                className={`flex h-16 items-center justify-center`}
              >
                {day.getDate()}
              </span>
            ))}
          </div>

          <div>
            <HabitCheckerTable
              last11Days={last11Days}
              habitsAndChecks={habitsAndChecks}
            />
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <HabitGrid
            habitsAndChecks={habitsAndChecks ?? { habits: [], checks: [] }}
          />
        </div>
      </main>
    </>
  );
}
