export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

type LogMethod = (...args: unknown[]) => void;

type LoggerSink = Record<Exclude<LogLevel, "silent">, LogMethod>;

export type Logger = LoggerSink;

interface LoggerEnvironment {
  NODE_ENV?: string;
  LOG_LEVEL?: string;
  NEXT_PUBLIC_LOG_LEVEL?: string;
}

interface LoggerOptions {
  env?: LoggerEnvironment;
  sink?: LoggerSink;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const DEFAULT_SINK: LoggerSink = {
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

function runtimeEnv(): LoggerEnvironment {
  if (typeof process === "undefined") {
    return {};
  }

  return process.env;
}

function normalizeLogLevel(value: string | undefined): LogLevel | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (normalized in LOG_LEVELS) {
    return normalized as LogLevel;
  }

  return undefined;
}

export function getLogLevel(env: LoggerEnvironment = runtimeEnv()): LogLevel {
  const configuredLevel = normalizeLogLevel(
    env.NEXT_PUBLIC_LOG_LEVEL ?? env.LOG_LEVEL
  );

  if (configuredLevel) {
    return configuredLevel;
  }

  return env.NODE_ENV === "production" ? "warn" : "debug";
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const sink = options.sink ?? DEFAULT_SINK;
  const activeLevel = getLogLevel(options.env);

  const shouldLog = (level: Exclude<LogLevel, "silent">) =>
    LOG_LEVELS[level] >= LOG_LEVELS[activeLevel];

  return {
    debug: (...args) => {
      if (shouldLog("debug")) {
        sink.debug(...args);
      }
    },
    info: (...args) => {
      if (shouldLog("info")) {
        sink.info(...args);
      }
    },
    warn: (...args) => {
      if (shouldLog("warn")) {
        sink.warn(...args);
      }
    },
    error: (...args) => {
      if (shouldLog("error")) {
        sink.error(...args);
      }
    },
  };
}

export const logger = createLogger();
