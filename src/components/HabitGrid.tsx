import { useEffect, useState } from "react";
import { getLast365Days, getLast365Weeks } from "~/utils/helpers";
import { type HabitsAndChecks, type Check } from "../pages";

const habitCountsForDate = (date: Date, checks: Check[]): number => {
  return checks.filter(
    (check) => new Date(check.date).toDateString() === date.toDateString(),
  ).length;
};

export const generateHabitCounts = (checks: Check[]) => {
  const days = getLast365Days();
  const counts: Record<string, number> = {};
  days.forEach((day) => {
    counts[day.toDateString()] = habitCountsForDate(day, checks);
  });
  return counts;
};

const colorMapping: Record<number, string> = {
  0: "bg-white",
  1: "bg-green-100",
  2: "bg-green-200",
  3: "bg-green-300",
  4: "bg-green-400",
  5: "bg-green-500",
};

const getColorForCountTailwind = (count: number): string => {
  return colorMapping[count] ?? "bg-green-600"; // Default to "bg-green-600" if count is above 5 or not found
};

export const HabitGrid: React.FC<{ habitsAndChecks: HabitsAndChecks }> = ({
  habitsAndChecks,
}) => {
  const [habitCounts, setHabitCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (habitsAndChecks.checks) {
      const counts = generateHabitCounts(habitsAndChecks.checks);
      setHabitCounts(counts);
    }
  }, [habitsAndChecks]);

  return (
    <div className="flex justify-center">
      <div className="grid-cols-52 grid-rows-7 grid ">
        {getLast365Weeks().flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={` h-2 w-2 rounded-sm border sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 xl:h-5 xl:w-5 ${getColorForCountTailwind(
                habitCounts[day.toDateString()] ?? 0,
              )}`}
              style={{
                gridColumn: weekIndex + 1,
                gridRow: dayIndex + 1,
              }}
            ></div>
          )),
        )}
      </div>
    </div>
  );
};
