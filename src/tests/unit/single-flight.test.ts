import { describe, expect, it, vi } from "vitest";
import { SingleFlight } from "@/common/utils/single-flight";

describe("SingleFlight", () => {
  it("runs task only once while request is in flight", async () => {
    const singleFlight = new SingleFlight<number>();
    const task = vi.fn(async () => 42);

    const [first, second, third] = await Promise.all([
      singleFlight.run(task),
      singleFlight.run(task),
      singleFlight.run(task)
    ]);

    expect(first).toBe(42);
    expect(second).toBe(42);
    expect(third).toBe(42);
    expect(task).toHaveBeenCalledTimes(1);
  });
});
