import { redirect } from "next/navigation";
import { type ReactNode } from "react";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import Navbar from "@/components/navbar";

const Layout = async ({ children }: { children: ReactNode }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
