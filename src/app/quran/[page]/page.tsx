import { redirect } from "next/navigation";

export default async function QuranPageRedirect({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  redirect(`/mushaf/${page}`);
}
