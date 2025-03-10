// Utility function to calculate progress percentage
export const calculateProgressPercentage = (raised, goal) => {
  if (!goal) return 0;
  return Math.round((raised / goal) * 100);
};