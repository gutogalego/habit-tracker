import { type HabitsAndChecks } from "~/pages";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { getLastNDays } from "~/utils/helpers";

export const SkeletonHabitCheckerTable: React.FC<{ daysCount: number }> = ({
  daysCount,
}) => {
  return (
    <div>
      {/* Simulate multiple habits */}
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="grid h-16 w-full grid-cols-12 items-center">
          <div className="mx-4 h-8 w-36 animate-pulse bg-gray-300 pl-8"></div>

          {Array.from({ length: daysCount }).map((_, dayIdx) => (
            <div
              key={dayIdx}
              className="form-control h-full items-center justify-center"
            >
              <div className="h-2/5 w-1/6 animate-pulse rounded bg-gray-300"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const CreateHabit = () => {
  const [input, setInput] = useState("");

  const { data: sessionData } = useSession();

  const ctx = api.useContext();

  const { mutate: createHabit, isLoading: isCreatingHabit } =
    api.habits.create.useMutation({
      onSuccess: () => {
        setInput("");
        void ctx.habits.getHabitsAndChecks.invalidate();
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

export const HabitCheckerTable = (props: {
  habitsAndChecks: HabitsAndChecks | undefined;
}) => {
  const habitsAndChecks = props.habitsAndChecks;
  const habits = habitsAndChecks?.habits;

  const { data: sessionData } = useSession();

  const { mutate: checkHabit } = api.habits.checkHabit.useMutation({
    onSuccess: () => {
      true;
    },
  });
  const last11Days = getLastNDays(11);

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
              check.userHabitId === `${habit.habitName}-${habit.userId}` &&
              new Date(check.date).toDateString() === day.toDateString() &&
              check.done,
          );
          habitMap.set(day.toDateString(), isChecked);
        });
        initialState.set(`${habit.habitName}-${habit.userId}`, habitMap);
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
                    checkedStates
                      .get(`${habit.habitName}-${habit.userId}`)
                      ?.get(day.toDateString()) ?? false
                  }
                  onChange={(e) => {
                    const newState = new Map(checkedStates);
                    const habitMap =
                      newState.get(`${habit.habitName}-${habit.userId}`) ??
                      new Map<string, boolean>();
                    habitMap.set(day.toDateString(), e.target.checked);
                    newState.set(
                      `${habit.habitName}-${habit.userId}`,
                      habitMap,
                    );

                    setCheckedStates(newState);

                    checkHabit({
                      date: day,
                      userId: sessionData?.user.id ?? "no_user",
                      done: e.target.checked,
                      habitName: habit.habitName,
                    });
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      ))}
      <CreateHabit />
    </>
  );
};
