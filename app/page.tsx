"use client";

import { Hero } from "@/components/hero";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

export default function Home() {
  // const router = useRouter();

  // useEffect(() => {
  //   router.push("/dashboard");
  // }, [router]);

  return (
    // <div className="min-h-screen flex items-center justify-center">
    //   <p className="text-muted-foreground">Redirecting to dashboard...</p>
    // </div>
    <>
      <Hero />
    </>
  );
}
