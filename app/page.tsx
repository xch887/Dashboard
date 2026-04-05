import { redirect } from "next/navigation";
import { appHomeHref } from "@/lib/nav-config";

export default function Home() {
  redirect(appHomeHref);
}
