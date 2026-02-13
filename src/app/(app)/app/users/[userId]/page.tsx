import { ProfileView } from "@/features/social/view/profile-view";

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return <ProfileView profileId={params.userId} />;
}
