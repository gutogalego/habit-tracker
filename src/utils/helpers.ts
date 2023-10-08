
export const getLast365Weeks = () => {
  const weeks: Date[][] = [];
  const today = new Date();

  for (let i = 0; i < 52; i++) {
    const week: Date[] = [];
    for (let j = 6; j >= 0; j--) {
      const day = new Date(today);
      day.setDate(today.getDate() - (i * 7 + j));
      week.push(day);
    }
    weeks.unshift(week);
  }
  return weeks;
};export const getLast365Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push(day);
  }
  return days;
};
export const getLast11Days = () => {
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

