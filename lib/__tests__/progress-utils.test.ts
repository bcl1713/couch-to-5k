import {
  calculateNextWorkout,
  isProgramComplete,
  isValidProgress,
} from "../progress-utils";

describe("calculateNextWorkout", () => {
  describe("within a week", () => {
    it("should advance from workout 1 to workout 2", () => {
      expect(calculateNextWorkout(1, 1)).toEqual({
        nextWeek: 1,
        nextWorkout: 2,
      });
    });

    it("should advance from workout 2 to workout 3", () => {
      expect(calculateNextWorkout(5, 2)).toEqual({
        nextWeek: 5,
        nextWorkout: 3,
      });
    });
  });

  describe("week transitions", () => {
    it("should advance to next week after completing workout 3", () => {
      expect(calculateNextWorkout(1, 3)).toEqual({
        nextWeek: 2,
        nextWorkout: 1,
      });
    });

    it("should transition from week 8 to week 9", () => {
      expect(calculateNextWorkout(8, 3)).toEqual({
        nextWeek: 9,
        nextWorkout: 1,
      });
    });

    it("should handle mid-program week transitions", () => {
      expect(calculateNextWorkout(4, 3)).toEqual({
        nextWeek: 5,
        nextWorkout: 1,
      });
    });
  });

  describe("program completion", () => {
    it("should stay at week 9 workout 3 when completing final workout", () => {
      expect(calculateNextWorkout(9, 3)).toEqual({
        nextWeek: 9,
        nextWorkout: 3,
      });
    });

    it("should allow advancing within week 9", () => {
      expect(calculateNextWorkout(9, 1)).toEqual({
        nextWeek: 9,
        nextWorkout: 2,
      });

      expect(calculateNextWorkout(9, 2)).toEqual({
        nextWeek: 9,
        nextWorkout: 3,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle week 1 workout 1", () => {
      expect(calculateNextWorkout(1, 1)).toEqual({
        nextWeek: 1,
        nextWorkout: 2,
      });
    });

    it("should handle all weeks consistently", () => {
      for (let week = 1; week < 9; week++) {
        expect(calculateNextWorkout(week, 3)).toEqual({
          nextWeek: week + 1,
          nextWorkout: 1,
        });
      }
    });
  });
});

describe("isProgramComplete", () => {
  it("should return true for week 9 workout 3", () => {
    expect(isProgramComplete(9, 3)).toBe(true);
  });

  it("should return false for week 9 workout 1", () => {
    expect(isProgramComplete(9, 1)).toBe(false);
  });

  it("should return false for week 9 workout 2", () => {
    expect(isProgramComplete(9, 2)).toBe(false);
  });

  it("should return false for earlier weeks", () => {
    expect(isProgramComplete(1, 1)).toBe(false);
    expect(isProgramComplete(5, 3)).toBe(false);
    expect(isProgramComplete(8, 3)).toBe(false);
  });
});

describe("isValidProgress", () => {
  describe("valid progress", () => {
    it("should accept week 1 workout 1", () => {
      expect(isValidProgress(1, 1)).toBe(true);
    });

    it("should accept week 9 workout 3", () => {
      expect(isValidProgress(9, 3)).toBe(true);
    });

    it("should accept all valid combinations", () => {
      for (let week = 1; week <= 9; week++) {
        for (let workout = 1; workout <= 3; workout++) {
          expect(isValidProgress(week, workout)).toBe(true);
        }
      }
    });
  });

  describe("invalid progress", () => {
    it("should reject week 0", () => {
      expect(isValidProgress(0, 1)).toBe(false);
    });

    it("should reject week 10", () => {
      expect(isValidProgress(10, 1)).toBe(false);
    });

    it("should reject workout 0", () => {
      expect(isValidProgress(1, 0)).toBe(false);
    });

    it("should reject workout 4", () => {
      expect(isValidProgress(1, 4)).toBe(false);
    });

    it("should reject negative values", () => {
      expect(isValidProgress(-1, 1)).toBe(false);
      expect(isValidProgress(1, -1)).toBe(false);
    });
  });
});
