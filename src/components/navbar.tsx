import Link from "next/link";

import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Wind } from "lucide-react";

import { cn } from "@/lib/utils";

import MaxWidthWrapper from "./max-width-wrapper";
import ModeToggle from "./mode-toggle";
import { buttonVariants } from "./ui/button";

const Navbar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] h-16 w-full bg-white/10 backdrop-blur-sm transition-all dark:bg-black/10">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="z-40 flex font-semibold">
            <Wind className="size-6 text-primary" />
          </Link>
          <div className="flex h-full items-center space-x-4">
            {user ? (
              <>
                <LogoutLink
                  className={cn(
                    buttonVariants({ size: "sm", variant: "ghost" })
                  )}
                >
                  Sign out
                </LogoutLink>
                <Link
                  href="/mail"
                  className={buttonVariants({
                    size: "sm",
                    className: "flex items-center gap-1",
                  })}
                >
                  Dashboard <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ size: "sm", variant: "ghost" })
                  )}
                >
                  Sign in
                </Link>
                <div className="h-8 w-px bg-gray-200" />
                <Link
                  href="/sign-up"
                  className={buttonVariants({
                    size: "sm",
                    className: "flex items-center gap-1.5",
                  })}
                >
                  Sign up <ArrowRight className="size-4" />
                </Link>
              </>
            )}
            <ModeToggle />
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
