const starterAchievements = [
  {
    name: 'First workout',
    description: 'Complete your first workout.',
    xpReward: 25,
    condition: { type: 'workoutCount', threshold: 1 },
  },
  {
    name: 'Getting consistent',
    description: 'Complete 5 workout days.',
    xpReward: 50,
    condition: { type: 'workoutCount', threshold: 5 },
  },
  {
    name: 'Training regular',
    description: 'Complete 25 workout days.',
    xpReward: 100,
    condition: { type: 'workoutCount', threshold: 25 },
  },
  {
    name: 'Finding your rhythm',
    description: 'Complete workouts on 2 different days.',
    xpReward: 15,
    condition: { type: 'workoutCount', threshold: 2 },
  },
  {
    name: 'Ten sessions strong',
    description: 'Complete workouts on 10 different days.',
    xpReward: 75,
    condition: { type: 'workoutCount', threshold: 10 },
  },
  {
    name: 'Half century',
    description: 'Complete workouts on 50 different days.',
    xpReward: 200,
    condition: { type: 'workoutCount', threshold: 50 },
  },
  {
    name: 'Century club',
    description: 'Complete workouts on 100 different days.',
    xpReward: 400,
    condition: { type: 'workoutCount', threshold: 100 },
  },
  {
    name: 'Unstoppable',
    description: 'Complete workouts on 200 different days.',
    xpReward: 800,
    condition: { type: 'workoutCount', threshold: 200 },
  },
  {
    name: 'Three day streak',
    description: 'Train three days in a row.',
    xpReward: 30,
    condition: { type: 'streak', threshold: 3 },
  },
  {
    name: 'Two week streak',
    description: 'Train fourteen days in a row.',
    xpReward: 150,
    condition: { type: 'streak', threshold: 14 },
  },
  {
    name: 'Five day flame',
    description: 'Train five days in a row.',
    xpReward: 50,
    condition: { type: 'streak', threshold: 5 },
  },
  {
    name: 'Perfect week',
    description: 'Train seven days in a row.',
    xpReward: 100,
    condition: { type: 'streak', threshold: 7 },
  },
  {
    name: 'Ten day momentum',
    description: 'Train ten days in a row.',
    xpReward: 125,
    condition: { type: 'streak', threshold: 10 },
  },
  {
    name: 'Three week streak',
    description: 'Train twenty-one days in a row.',
    xpReward: 225,
    condition: { type: 'streak', threshold: 21 },
  },
  {
    name: 'Month of movement',
    description: 'Train thirty days in a row.',
    xpReward: 350,
    condition: { type: 'streak', threshold: 30 },
  },
];

const ensureStarterAchievements = (Achievement) =>
  Achievement.bulkWrite(
    starterAchievements.map((achievement) => ({
      updateOne: {
        filter: { name: achievement.name },
        update: { $setOnInsert: achievement },
        upsert: true,
      },
    }))
  );

module.exports = { starterAchievements, ensureStarterAchievements };
