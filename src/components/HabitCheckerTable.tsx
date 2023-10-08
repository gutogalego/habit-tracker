import { type HabitsAndChecks } from "~/pages";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";


export const HabitCheckerTable = (props: {
  last11Days: Date[];
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
            (check) => check.userHabitId === habit.id &&
              new Date(check.date).toDateString() === day.toDateString() &&
              check.done
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
                  checked={checkedStates.get(habit.id)?.get(day.toDateString()) ??
                    false}
                  onChange={(e) => {
                    const newState = new Map(checkedStates);
                    const habitMap = newState.get(habit.id) ?? new Map<string, boolean>();
                    habitMap.set(day.toDateString(), e.target.checked);
                    newState.set(habit.id, habitMap);

                    setCheckedStates(newState);

                    checkHabit({
                      date: day,
                      userId: sessionData?.user.id ?? "no_user",
                      done: e.target.checked,
                      habitId: habit.id,
                    });
                  } } />
              </label>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
