import { redirect } from "next/navigation";

export default async function QuranPageRedirect() {
  redirect("/surahs");
}
