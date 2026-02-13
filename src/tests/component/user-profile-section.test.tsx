import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { UserProfileSection } from "@/features/try-on/components/user-profile-section";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";

describe("UserProfileSection", () => {
  beforeEach(() => {
    useTryOnStore.setState({
      profile: {
        heightCm: null,
        weightKg: null,
        gender: null,
        ageYears: null
      }
    });
  });

  it("shows range errors for invalid values", async () => {
    render(<UserProfileSection />);

    const [heightInput, weightInput, ageInput] = screen.getAllByRole("textbox");

    fireEvent.change(heightInput, { target: { value: "99" } });
    fireEvent.blur(heightInput);

    fireEvent.change(weightInput, { target: { value: "400" } });
    fireEvent.blur(weightInput);

    fireEvent.change(ageInput, { target: { value: "5" } });
    fireEvent.blur(ageInput);

    expect(await screen.findByText("Рост 120-230 см")).toBeInTheDocument();
    expect(await screen.findByText("Вес 35-250 кг")).toBeInTheDocument();
    expect(await screen.findByText("Возраст 12-90 лет")).toBeInTheDocument();
  });
});
