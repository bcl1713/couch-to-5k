import { getDb } from "./db";

interface WorkoutInterval {
  type: "walk" | "jog";
  seconds: number;
  repeat_with_next?: boolean;
  repeat_count?: number;
}

interface WorkoutData {
  week: number;
  number: number;
  warmup_seconds: number;
  intervals: WorkoutInterval[];
  total_duration_seconds: number;
  is_final_workout: boolean;
}

const WORKOUTS: WorkoutData[] = [
  // Week 1 - All 3 workouts identical
  {
    week: 1,
    number: 1,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 60, repeat_with_next: true },
      { type: "walk", seconds: 90, repeat_count: 8 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },
  {
    week: 1,
    number: 2,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 60, repeat_with_next: true },
      { type: "walk", seconds: 90, repeat_count: 8 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },
  {
    week: 1,
    number: 3,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 60, repeat_with_next: true },
      { type: "walk", seconds: 90, repeat_count: 8 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },

  // Week 2 - All 3 workouts identical
  {
    week: 2,
    number: 1,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 90, repeat_with_next: true },
      { type: "walk", seconds: 120, repeat_count: 8 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },
  {
    week: 2,
    number: 2,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 90, repeat_with_next: true },
      { type: "walk", seconds: 120, repeat_count: 8 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },
  {
    week: 2,
    number: 3,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 90, repeat_with_next: true },
      { type: "walk", seconds: 120, repeat_count: 8 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },

  // Week 3 - All 3 workouts identical
  {
    week: 3,
    number: 1,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 90 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 90 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 180 },
    ],
    total_duration_seconds: 1560,
    is_final_workout: false,
  },
  {
    week: 3,
    number: 2,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 90 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 90 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 180 },
    ],
    total_duration_seconds: 1560,
    is_final_workout: false,
  },
  {
    week: 3,
    number: 3,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 90 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 90 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 180 },
    ],
    total_duration_seconds: 1560,
    is_final_workout: false,
  },

  // Week 4 - All 3 workouts identical
  {
    week: 4,
    number: 1,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 300 },
      { type: "walk", seconds: 150 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 300 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },
  {
    week: 4,
    number: 2,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 300 },
      { type: "walk", seconds: 150 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 300 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },
  {
    week: 4,
    number: 3,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 300 },
      { type: "walk", seconds: 150 },
      { type: "jog", seconds: 180 },
      { type: "walk", seconds: 90 },
      { type: "jog", seconds: 300 },
    ],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },

  // Week 5
  {
    week: 5,
    number: 1,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 300 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 300 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 300 },
    ],
    total_duration_seconds: 1560,
    is_final_workout: false,
  },
  {
    week: 5,
    number: 2,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 480 },
      { type: "walk", seconds: 300 },
      { type: "jog", seconds: 480 },
    ],
    total_duration_seconds: 1560,
    is_final_workout: false,
  },
  {
    week: 5,
    number: 3,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1200 }],
    total_duration_seconds: 1500,
    is_final_workout: false,
  },

  // Week 6
  {
    week: 6,
    number: 1,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 300 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 480 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 300 },
    ],
    total_duration_seconds: 1740,
    is_final_workout: false,
  },
  {
    week: 6,
    number: 2,
    warmup_seconds: 300,
    intervals: [
      { type: "jog", seconds: 600 },
      { type: "walk", seconds: 180 },
      { type: "jog", seconds: 600 },
    ],
    total_duration_seconds: 1680,
    is_final_workout: false,
  },
  {
    week: 6,
    number: 3,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1500 }],
    total_duration_seconds: 1800,
    is_final_workout: false,
  },

  // Week 7 - All 3 workouts identical
  {
    week: 7,
    number: 1,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1500 }],
    total_duration_seconds: 1800,
    is_final_workout: false,
  },
  {
    week: 7,
    number: 2,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1500 }],
    total_duration_seconds: 1800,
    is_final_workout: false,
  },
  {
    week: 7,
    number: 3,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1500 }],
    total_duration_seconds: 1800,
    is_final_workout: false,
  },

  // Week 8 - All 3 workouts identical
  {
    week: 8,
    number: 1,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1680 }],
    total_duration_seconds: 1980,
    is_final_workout: false,
  },
  {
    week: 8,
    number: 2,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1680 }],
    total_duration_seconds: 1980,
    is_final_workout: false,
  },
  {
    week: 8,
    number: 3,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1680 }],
    total_duration_seconds: 1980,
    is_final_workout: false,
  },

  // Week 9 - All 3 workouts identical, with last one marked as final
  {
    week: 9,
    number: 1,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1800 }],
    total_duration_seconds: 2100,
    is_final_workout: false,
  },
  {
    week: 9,
    number: 2,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1800 }],
    total_duration_seconds: 2100,
    is_final_workout: false,
  },
  {
    week: 9,
    number: 3,
    warmup_seconds: 300,
    intervals: [{ type: "jog", seconds: 1800 }],
    total_duration_seconds: 2100,
    is_final_workout: true,
  },
];

export function seedWorkouts(): void {
  const db = getDb();

  // Check if workouts are already seeded
  const count = db.prepare("SELECT COUNT(*) as count FROM workouts").get() as {
    count: number;
  };

  if (count.count > 0) {
    console.log("Workouts already seeded, skipping...");
    return;
  }

  const insert = db.prepare(`
    INSERT INTO workouts (week, number, intervals_json, duration_seconds)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((workouts: WorkoutData[]) => {
    for (const workout of workouts) {
      insert.run(
        workout.week,
        workout.number,
        JSON.stringify(workout),
        workout.total_duration_seconds
      );
    }
  });

  insertMany(WORKOUTS);
  console.log(`Seeded ${WORKOUTS.length} workouts`);
}
