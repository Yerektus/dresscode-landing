import { redirect } from "next/navigation";
import { paths } from "@/common/constants/paths";

export default function LegacyTryOnPage() {
  redirect(paths.tryOn);
}
