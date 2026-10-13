import { Metadata } from "next";
import Dashboard from "../components/Dashboard";

export const metadata: Metadata = {
  title: "تطبيق أُنس | لوحة المتابعة اليومية",
  description: "مواقيت الصلاة، أذكار الصباح والمساء، السبحة الإلكترونية، والقرآن الكريم في تطبيق أُنس.",
};

export default function AppPage() {
  return <Dashboard />;
}
