import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FollowButton } from "@/features/social/components/follow-button";

describe("FollowButton", () => {
  it("shows subscribe label and handles click", () => {
    const onToggle = vi.fn();

    render(<FollowButton isFollowing={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: "Подписаться" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows unsubscribe label", () => {
    const onToggle = vi.fn();

    render(<FollowButton isFollowing onToggle={onToggle} />);

    expect(screen.getByRole("button", { name: "Отписаться" })).toBeInTheDocument();
  });
});
