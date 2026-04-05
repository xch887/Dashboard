import type { Metadata } from "next";
import { AssistantWorkspace } from "@/components/dashboard/assistant-workspace";

export const metadata: Metadata = {
  title: "Intelligence",
};

export default function AssistantPage() {
  return <AssistantWorkspace />;
}
