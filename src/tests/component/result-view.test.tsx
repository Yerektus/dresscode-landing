import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ResultView } from "@/features/try-on/components/result-view";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";

describe("ResultView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useTryOnStore.setState({
      userPhotoDataUri: "data:image/jpeg;base64,before",
      resultImageDataUri: "data:image/png;base64,inpaint",
      resultMimeType: "image/png",
      resultOutputs: [
        {
          id: "inpaint",
          imageDataUri: "data:image/png;base64,inpaint",
          mimeType: "image/png"
        }
      ],
      resultStyleHints: [],
      resultStyleHintsLoading: false,
      resultStyleHintsError: null
    });
  });

  it("shows before/after comparison slider", () => {
    render(<ResultView />);

    expect(screen.getByRole("img", { name: "До" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "После (inpainting)" })).toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: "Сравнение до и после" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "52");
  });

  it("renders style hints after analysis", () => {
    useTryOnStore.setState({
      resultStyleHints: [
        { style: "Кэжуал", reason: "Подходит для прогулок и офиса." },
        { style: "Минимализм", reason: "Лаконичный силуэт и спокойная палитра." },
        { style: "Спорт-шик", reason: "Комфорт и динамичный образ." }
      ],
      resultStyleHintsLoading: false,
      resultStyleHintsError: null
    });

    render(<ResultView />);

    expect(screen.getAllByText("Подсказки стиля после AI-анализа").length).toBeGreaterThan(0);
    expect(screen.getByText("Кэжуал")).toBeInTheDocument();
    expect(screen.getByText("Комфорт и динамичный образ.")).toBeInTheDocument();
  });
});
