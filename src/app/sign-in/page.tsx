import { isUserAuthenticated } from "@/lib/firebase/firebase-admin";
import { redirect } from "next/navigation";
import SignInForm from "./components/SignInForm";

export default async function SignInPage() {
  if (await isUserAuthenticated()) redirect("/dashboard");

  return (
    <main className="container">
      <SignInForm />
    </main>
  );
}
