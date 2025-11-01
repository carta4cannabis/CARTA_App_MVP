export const Routes = {
  COACH: 'Coach' as const,
  GOAL_BUILDER: 'GoalBuilder' as const,
  QUEST: 'Quest' as const,
};
export type AppRoute = typeof Routes[keyof typeof Routes];
