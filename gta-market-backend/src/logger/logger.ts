import { Logger } from 'tslog';


const rootLogger = new Logger({ minLevel: "INFO" });
const loggerMap = new Map<string, Logger<unknown>>();

export function getLogger(name?: string): Logger<unknown> {
  if (!name) return rootLogger;

  if (!loggerMap.has(name)) {
    loggerMap.set(name, rootLogger.getSubLogger({ name }));
  }

  return loggerMap.get(name)!
}
