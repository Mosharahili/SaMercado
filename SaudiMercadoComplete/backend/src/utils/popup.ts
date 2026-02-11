export const isInSchedule = (startsAt?: Date | null, endsAt?: Date | null) => {
  const now = new Date();
  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
};
