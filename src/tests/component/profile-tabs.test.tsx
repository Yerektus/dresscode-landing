import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProfileTabs } from "@/features/social/components/profile-tabs";

describe("ProfileTabs", () => {
  it("switches tab on click", () => {
    const onChange = vi.fn();

    render(<ProfileTabs value="looks" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Подписчики" }));

    expect(onChange).toHaveBeenCalledWith("followers");
  });
});
