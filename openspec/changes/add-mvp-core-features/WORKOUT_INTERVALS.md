# Couch to 5K Workout Intervals

Reference specification for all 27 workouts in the 9-week program.

## Week 1

All three workouts are identical.

**Warmup:** 5 minutes brisk walk
**Main:** Alternate 60s jogging / 90s walking, repeated 8 times (20 minutes total)
**Total duration:** 25 minutes

## Week 2

All three workouts are identical.

**Warmup:** 5 minutes brisk walk
**Main:** Alternate 90s jogging / 2 min walking, repeated 8 times (20 minutes
total)
**Total duration:** 25 minutes

## Week 3

### Week 3 Workout 1

**Warmup:** 5 minutes brisk walk

**Main:** Repeat twice:

- Jog 90s
- Walk 90s
- Jog 3 min
- Walk 3 min

**Total duration:** 26 minutes (5 min warmup + 21 min intervals)

### Week 3 Workouts 2-3

Same as Workout 1

## Week 4

### Week 4 Workout 1

**Warmup:** 5 minutes brisk walk

**Main:**

- Jog 3 min
- Walk 90s
- Jog 5 min
- Walk 2.5 min (150s)
- Jog 3 min
- Walk 90s
- Jog 5 min

**Total duration:** 25 minutes (5 min warmup + 20 min intervals)

### Week 4 Workouts 2-3

Same as Workout 1

## Week 5

### Week 5 Workout 1

**Warmup:** 5 minutes brisk walk

**Main:**

- Jog 5 min
- Walk 3 min
- Jog 5 min
- Walk 3 min
- Jog 5 min

**Total duration:** 26 minutes (5 min warmup + 21 min intervals)

### Week 5 Workout 2

**Warmup:** 5 minutes brisk walk

**Main:**

- Jog 8 min
- Walk 5 min
- Jog 8 min

**Total duration:** 26 minutes (5 min warmup + 21 min intervals)

### Week 5 Workout 3

**Warmup:** 5 minutes brisk walk

**Main:** Jog 20 minutes (no walking)

**Total duration:** 25 minutes

## Week 6

### Week 6 Workout 1

**Warmup:** 5 minutes brisk walk

**Main:**

- Jog 5 min
- Walk 3 min
- Jog 8 min
- Walk 3 min
- Jog 5 min

**Total duration:** 29 minutes (5 min warmup + 24 min intervals)

### Week 6 Workout 2

**Warmup:** 5 minutes brisk walk

**Main:**

- Jog 10 min
- Walk 3 min
- Jog 10 min

**Total duration:** 28 minutes (5 min warmup + 23 min intervals)

### Week 6 Workout 3

**Warmup:** 5 minutes brisk walk

**Main:** Jog 25 minutes (no walking)

**Total duration:** 30 minutes

## Week 7

All three workouts are identical.

**Warmup:** 5 minutes brisk walk
**Main:** Jog 25 minutes (no walking)
**Total duration:** 30 minutes

## Week 8

All three workouts are identical.

**Warmup:** 5 minutes brisk walk
**Main:** Jog 28 minutes (no walking)
**Total duration:** 33 minutes

## Week 9

All three workouts are identical.

**Warmup:** 5 minutes brisk walk
**Main:** Jog 30 minutes (no walking)
**Total duration:** 35 minutes

### Special Note for Week 9 Workout 3

Workout 3 of Week 9 is marked as the final workout with celebratory messaging
(e.g., "🎉 Final workout! Congratulations on completing Couch to 5K!").

## Interval Data Format

Each workout is stored with the following JSON structure:

```json
{
  "week": 1,
  "number": 1,
  "warmup_seconds": 300,
  "intervals": [
    {
      "type": "jog",
      "seconds": 60,
      "repeat_with_next": true
    },
    {
      "type": "walk",
      "seconds": 90,
      "repeat_count": 8
    }
  ],
  "total_duration_seconds": 1500,
  "is_final_workout": false
}
```

Alternatively, for simpler workouts (Week 7-9):

```json
{
  "week": 7,
  "number": 1,
  "warmup_seconds": 300,
  "intervals": [
    {
      "type": "jog",
      "seconds": 1500
    }
  ],
  "total_duration_seconds": 1800,
  "is_final_workout": false
}
```
