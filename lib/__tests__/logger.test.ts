import { createLogger, getLogLevel, LogLevel } from "../logger";

function createSink() {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

describe("logger", () => {
  it("logs every level by default outside production", () => {
    const sink = createSink();
    const logger = createLogger({ env: { NODE_ENV: "test" }, sink });

    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");

    expect(sink.debug).toHaveBeenCalledWith("debug message");
    expect(sink.info).toHaveBeenCalledWith("info message");
    expect(sink.warn).toHaveBeenCalledWith("warn message");
    expect(sink.error).toHaveBeenCalledWith("error message");
  });

  it("suppresses debug and info by default in production", () => {
    const sink = createSink();
    const logger = createLogger({ env: { NODE_ENV: "production" }, sink });

    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");

    expect(sink.debug).not.toHaveBeenCalled();
    expect(sink.info).not.toHaveBeenCalled();
    expect(sink.warn).toHaveBeenCalledWith("warn message");
    expect(sink.error).toHaveBeenCalledWith("error message");
  });

  it.each<LogLevel>(["debug", "info", "warn", "error", "silent"])(
    "respects explicit %s log level",
    (level) => {
      const sink = createSink();
      const logger = createLogger({
        env: { NODE_ENV: "production", LOG_LEVEL: level },
        sink,
      });

      logger.debug("debug message");
      logger.info("info message");
      logger.warn("warn message");
      logger.error("error message");

      expect(sink.debug).toHaveBeenCalledTimes(level === "debug" ? 1 : 0);
      expect(sink.info).toHaveBeenCalledTimes(
        level === "debug" || level === "info" ? 1 : 0
      );
      expect(sink.warn).toHaveBeenCalledTimes(
        ["debug", "info", "warn"].includes(level) ? 1 : 0
      );
      expect(sink.error).toHaveBeenCalledTimes(level !== "silent" ? 1 : 0);
    }
  );

  it("prefers NEXT_PUBLIC_LOG_LEVEL when both public and server levels are set", () => {
    expect(
      getLogLevel({
        NODE_ENV: "production",
        LOG_LEVEL: "error",
        NEXT_PUBLIC_LOG_LEVEL: "info",
      })
    ).toBe("info");
  });

  it("preserves argument identity and Error objects", () => {
    const sink = createSink();
    const logger = createLogger({ env: { NODE_ENV: "production" }, sink });
    const error = new Error("still useful");
    const metadata = { route: "/api/workouts/start" };

    logger.error("Start workout error:", error, metadata);

    expect(sink.error).toHaveBeenCalledWith(
      "Start workout error:",
      error,
      metadata
    );
    expect(sink.error.mock.calls[0][1]).toBe(error);
    expect(sink.error.mock.calls[0][2]).toBe(metadata);
  });
});
