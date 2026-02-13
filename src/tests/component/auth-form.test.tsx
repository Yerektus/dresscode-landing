import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AuthForm } from "@/features/auth/components/auth-form";
import { useAuthStore } from "@/features/auth/stores/auth-store";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock
  })
}));

vi.mock("@/features/auth/components/google-sign-in-button", () => ({
  GoogleSignInButton: () => <div>Google Button</div>
}));

describe("AuthForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    replaceMock.mockReset();
    useAuthStore.setState({
      isBusy: false,
      login: vi.fn(async () => null),
      register: vi.fn(async () => null),
      loginWithGoogleToken: vi.fn(async () => null)
    });
  });

  it("shows registration field when switching tab", () => {
    render(<AuthForm />);

    fireEvent.click(screen.getByRole("tab", { name: "Регистрация" }));

    expect(screen.getByLabelText("Имя")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bad" }
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "12345678" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Войти" }));

    expect(await screen.findByText("Введите корректный email")).toBeInTheDocument();
  });
});
