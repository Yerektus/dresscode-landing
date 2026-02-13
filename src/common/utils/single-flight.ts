export class SingleFlight<T> {
  private inFlight: Promise<T> | null = null;

  run(task: () => Promise<T>): Promise<T> {
    if (!this.inFlight) {
      this.inFlight = task().finally(() => {
        this.inFlight = null;
      });
    }

    return this.inFlight;
  }
}
