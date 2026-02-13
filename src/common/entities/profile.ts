import { profileRanges } from "@/common/constants/profile-ranges";

export type UserGender = "male" | "female";

export interface UserProfile {
  heightCm: number | null;
  weightKg: number | null;
  gender: UserGender | null;
  ageYears: number | null;
}

export const emptyProfile: UserProfile = {
  heightCm: null,
  weightKg: null,
  gender: null,
  ageYears: null
};

export const isProfileComplete = (profile: UserProfile): boolean => {
  return (
    profile.heightCm !== null &&
    profile.weightKg !== null &&
    profile.gender !== null &&
    profile.ageYears !== null
  );
};

export const isProfileValid = (profile: UserProfile): boolean => {
  if (!isProfileComplete(profile)) {
    return false;
  }

  return (
    profile.heightCm! >= profileRanges.height.min &&
    profile.heightCm! <= profileRanges.height.max &&
    profile.weightKg! >= profileRanges.weight.min &&
    profile.weightKg! <= profileRanges.weight.max &&
    profile.ageYears! >= profileRanges.age.min &&
    profile.ageYears! <= profileRanges.age.max
  );
};
