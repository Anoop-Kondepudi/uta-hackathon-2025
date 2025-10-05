import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import DetectorPage from "@/components/detector";

const DetectorPages = async () => {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DetectorPage />
  )
}

export default DetectorPages