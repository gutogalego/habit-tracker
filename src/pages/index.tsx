import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { api } from "~/utils/api";

export type Habit = {
  habitName: string;
  userId: string;
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

const getLast11Days = () => {
  const today = new Date();
  const last11Days = [];

  for (let i = 0; i < 11; i++) {
    const date = new Date(today); // Create a new Date object with the same value as 'today'
    last11Days.push(date);

    // Move the date one day back for the next iteration
    const day = today.getDate();
    today.setDate(day - 1);
  }
  last11Days.reverse();
  return last11Days;
};

const CreateHabit = () => {
  const [input, setInput] = useState("");

  const { data: sessionData } = useSession();

  const ctx = api.useContext();

  const { mutate: createHabit, isLoading: isCreatingHabit } =
    api.habits.create.useMutation({
      onSuccess: () => {
        setInput("");
        void ctx.habits.getHabitsByUserID.invalidate();
      },
    });

  return (
    <div className="grid h-16 w-full grid-cols-12 items-center">
      <input
        placeholder="Add a new habit!"
        className="w-40 grow bg-transparent pl-8 outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input != "") {
              createHabit({
                habitName: input,
                userId: sessionData?.user.id ?? "no_user",
              });
            }
          }
        }}
        disabled={isCreatingHabit}
      />
    </div>
  );
};

const HabitCheckerTable = (props: { last11Days: Date[] }) => {
  const { data: sessionData } = useSession();
  const { data: habits } = api.habits.getHabitsByUserID.useQuery({
    userId: sessionData?.user.id ?? "no_user",
  });

  const { data: habitsAndChecks, isLoading } =
    api.habits.getHabitsAndChecks.useQuery({
      userId: sessionData?.user.id ?? "no_user",
    });

  const { mutate: checkHabit } =
    api.habits.checkHabit.useMutation({
      onSuccess: () => {
        true;
      },
    });
  const last11Days = props.last11Days;

  const [checkedStates, setCheckedStates] = useState<
    Map<string, Map<string, boolean>>
  >(new Map());

  useEffect(() => {
    if (habitsAndChecks?.checks) {
      const initialState = new Map<string, Map<string, boolean>>();

      habits?.forEach((habit) => {
        const habitMap = new Map<string, boolean>();
        last11Days.forEach((day) => {
          const isChecked = habitsAndChecks.checks.some(
            (check) =>
              check.userHabitId === habit.id &&
              new Date(check.date).toDateString() === day.toDateString() &&
              check.done,
          );
          habitMap.set(day.toDateString(), isChecked);
        });
        initialState.set(habit.id, habitMap);
      });

      setCheckedStates(initialState);
    }
  }, [habits, habitsAndChecks, last11Days]);

  return (
    <>
      {habits?.map((habit, index) => (
        <div key={index} className="grid h-16 w-full grid-cols-12 items-center">
          <div className="w-40 pl-8">{habit.habitName}</div>

          {last11Days.map((day, index) => (
            <div
              key={index}
              className="form-control h-full items-center justify-center"
            >
              <label className="label h-2/3 w-2/3 cursor-pointer justify-center">
                <input
                  type="checkbox"
                  className="checkbox-success checkbox"
                  checked={
                    checkedStates.get(habit.id)?.get(day.toDateString()) ??
                    false
                  }
                  onChange={(e) => {
                    const newState = new Map(checkedStates);
                    const habitMap =
                      newState.get(habit.id) ?? new Map<string, boolean>();
                    habitMap.set(day.toDateString(), e.target.checked);
                    newState.set(habit.id, habitMap);

                    setCheckedStates(newState);

                    checkHabit({
                      date: day,
                      userId: sessionData?.user.id ?? "no_user",
                      done: e.target.checked,
                      habitId: habit.id,
                    });
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default function Home() {
  const last11Days = getLast11Days();

  return (
    <>
      <Head>
        <title>Habit Tracker</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen  divide-y-4 divide-dashed bg-neutral-100">
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
          <HabitCheckerTable last11Days={last11Days} />
          <CreateHabit />
        </div>
      </main>
    </>
  );
}
