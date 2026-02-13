import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CommentComposer } from "@/features/social/components/comment-composer";

describe("CommentComposer", () => {
  afterEach(() => {
    cleanup();
  });

  it("blocks empty comment submit", () => {
    const onSubmit = vi.fn();

    render(<CommentComposer onSubmit={onSubmit} />);

    const button = screen.getByRole("button", { name: "Отправить" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed value", async () => {
    const onSubmit = vi.fn(async () => {});

    render(<CommentComposer onSubmit={onSubmit} />);

    fireEvent.change(screen.getAllByPlaceholderText("Напишите комментарий...")[0], {
      target: { value: "  Отличный лук  " }
    });

    fireEvent.submit(screen.getByRole("button", { name: "Отправить" }).closest("form")!);

    expect(onSubmit).toHaveBeenCalledWith("Отличный лук");
  });
});
