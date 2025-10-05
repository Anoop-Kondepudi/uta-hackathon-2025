import React from 'react'
import LiveMangoPage from '@/components/livemango'
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

const LiveMangoPages = async () => {
  
  const session = await auth0.getSession();
  const user = session?.user;
  
  if (!user) {
    redirect("/auth/login");
  }
  
  return (
    <LiveMangoPage />
  )
}

export default LiveMangoPages