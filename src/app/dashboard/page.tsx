import { getCurrentUser } from "@/lib/firebase/firebase-admin";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  return (
    <main className="container">
      <h1>Dashboard</h1>
    </main>
  );
}
