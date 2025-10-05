import DashboardPage from "@/components/dashboard";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

const DashboardPages = async () => {
  
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardPage />
  )
}

export default DashboardPages