import { LookDetailView } from "@/features/social/view/look-detail-view";

interface LookPageProps {
  params: {
    lookId: string;
  };
}

export default function LookPage({ params }: LookPageProps) {
  return <LookDetailView lookId={params.lookId} />;
}
