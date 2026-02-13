"use client";

import React from "react";
import { useMemo, useState } from "react";
import { Card } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Select } from "@/common/components/ui/select";
import { profileRanges } from "@/common/constants/profile-ranges";
import { isProfileValid } from "@/common/entities/profile";
import { useTryOnStore } from "@/features/try-on/stores/try-on-store";

type Field = "height" | "weight" | "age" | "gender";

export const UserProfileSection = () => {
  const profile = useTryOnStore((state) => state.profile);
  const updateProfile = useTryOnStore((state) => state.updateProfile);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    height: false,
    weight: false,
    age: false,
    gender: false
  });

  const errors = useMemo(() => {
    const next: Partial<Record<Field, string>> = {};

    if (touched.height) {
      if (profile.heightCm === null) {
        next.height = "Обязательное поле";
      } else if (
        profile.heightCm < profileRanges.height.min ||
        profile.heightCm > profileRanges.height.max
      ) {
        next.height = `Рост ${profileRanges.height.min}-${profileRanges.height.max} см`;
      }
    }

    if (touched.weight) {
      if (profile.weightKg === null) {
        next.weight = "Обязательное поле";
      } else if (
        profile.weightKg < profileRanges.weight.min ||
        profile.weightKg > profileRanges.weight.max
      ) {
        next.weight = `Вес ${profileRanges.weight.min}-${profileRanges.weight.max} кг`;
      }
    }

    if (touched.age) {
      if (profile.ageYears === null) {
        next.age = "Обязательное поле";
      } else if (profile.ageYears < profileRanges.age.min || profile.ageYears > profileRanges.age.max) {
        next.age = `Возраст ${profileRanges.age.min}-${profileRanges.age.max} лет`;
      }
    }

    if (touched.gender && !profile.gender) {
      next.gender = "Выберите пол";
    }

    return next;
  }, [profile, touched]);

  const updateNumber = (key: "heightCm" | "weightKg" | "ageYears", value: string) => {
    const parsed = value.trim() ? Number.parseInt(value, 10) : null;

    updateProfile({
      heightCm: key === "heightCm" ? parsed : profile.heightCm,
      weightKg: key === "weightKg" ? parsed : profile.weightKg,
      ageYears: key === "ageYears" ? parsed : profile.ageYears,
      gender: profile.gender
    });
  };

  return (
    <Card>
      <h2 className="font-display text-xl">Параметры профиля</h2>
      <p className="mt-1 text-sm text-brand-mist/70">Нужны для более точной примерки</p>

      <div className="mt-4 grid gap-3">
        <div>
          <label className="mb-1 block text-sm">Рост (см)</label>
          <Input
            value={profile.heightCm ?? ""}
            onChange={(event) => updateNumber("heightCm", event.target.value.replace(/[^\d]/g, ""))}
            onBlur={() => setTouched((prev) => ({ ...prev, height: true }))}
            inputMode="numeric"
          />
          {errors.height && <p className="mt-1 text-xs text-red-300">{errors.height}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Вес (кг)</label>
          <Input
            value={profile.weightKg ?? ""}
            onChange={(event) => updateNumber("weightKg", event.target.value.replace(/[^\d]/g, ""))}
            onBlur={() => setTouched((prev) => ({ ...prev, weight: true }))}
            inputMode="numeric"
          />
          {errors.weight && <p className="mt-1 text-xs text-red-300">{errors.weight}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Возраст (лет)</label>
          <Input
            value={profile.ageYears ?? ""}
            onChange={(event) => updateNumber("ageYears", event.target.value.replace(/[^\d]/g, ""))}
            onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
            inputMode="numeric"
          />
          {errors.age && <p className="mt-1 text-xs text-red-300">{errors.age}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Пол</label>
          <Select
            value={profile.gender ?? ""}
            onBlur={() => setTouched((prev) => ({ ...prev, gender: true }))}
            onChange={(event) =>
              updateProfile({
                heightCm: profile.heightCm,
                weightKg: profile.weightKg,
                ageYears: profile.ageYears,
                gender: (event.target.value || null) as "male" | "female" | null
              })
            }
          >
            <option value="">Выберите пол</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </Select>
          {errors.gender && <p className="mt-1 text-xs text-red-300">{errors.gender}</p>}
        </div>
      </div>

      {isProfileValid(profile) && <p className="mt-3 text-sm text-violet-400">Профиль заполнен</p>}
    </Card>
  );
};
