"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Card } from "@/common/components/ui/card";
import { Tabs } from "@/common/components/ui/tabs";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { Spinner } from "@/common/components/ui/spinner";
import { paths } from "@/common/constants/paths";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";

type Mode = "login" | "register";

const formSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  displayName: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export const AuthForm = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  const isBusy = useAuthStore((state) => state.isBusy);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const loginWithGoogleToken = useAuthStore((state) => state.loginWithGoogleToken);

  const {
    register: bindField,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (mode === "register" && !values.displayName?.trim()) {
      toast.error("Введите имя");
      return;
    }

    const error =
      mode === "login"
        ? await login({ email: values.email, password: values.password })
        : await register({
            email: values.email,
            password: values.password,
            displayName: values.displayName!
          });

    if (error) {
      toast.error(error);
      return;
    }

    reset();
    toast.success("Успешный вход");
    router.replace(paths.tryOn);
  };

  const onGoogleLogin = async (token: string) => {
    const error = await loginWithGoogleToken(token);
    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Вход через Google выполнен");
    router.replace(paths.tryOn);
  };

  return (
    <Card className="w-full max-w-md animate-reveal">
      <h1 className="font-display text-2xl">Вход в AI Try-On</h1>
      <p className="mt-2 text-sm text-brand-mist/70">
        Используйте email/password или Google, чтобы продолжить.
      </p>

      <div className="mt-5">
        <Tabs
          value={mode}
          onChange={(nextValue) => {
            setMode(nextValue);
            reset();
          }}
          options={[
            { value: "login", label: "Вход" },
            { value: "register", label: "Регистрация" }
          ]}
        />
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-sm text-brand-mist/80" htmlFor="displayName">
              Имя
            </label>
            <Input id="displayName" {...bindField("displayName")} placeholder="Как к вам обращаться" />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-brand-mist/80" htmlFor="email">
            Email
          </label>
          <Input id="email" {...bindField("email")} placeholder="you@example.com" />
          {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-brand-mist/80" htmlFor="password">
            Пароль
          </label>
          <Input
            id="password"
            type="password"
            {...bindField("password")}
            placeholder="Минимум 8 символов"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>
          )}
        </div>

        <Button
          disabled={isBusy}
          type="submit"
          className="w-full"
        >
          {isBusy ? <Spinner /> : mode === "login" ? "Войти" : "Создать аккаунт"}
        </Button>
      </form>

      <div className="my-4 h-px bg-brand-sky/25" />
      <GoogleSignInButton onToken={onGoogleLogin} />
    </Card>
  );
};
