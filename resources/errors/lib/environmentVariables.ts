export class EnvironmentVariablesError extends Error {
  constructor() {
    super("Could not parse the environment variables");
  }
}
