import { notFound, redirect } from "next/navigation";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import Heading from "@/components/heading";
import LoadingSpinner from "@/components/loading-spinner";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RadialGradient from "@/components/ui/radial-gradient";
import { api } from "@/trpc/server";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return notFound();
  }

  const checkUser = await api.user.findUser();

  if (checkUser) {
    redirect("/mail");
  }

  const response = await api.user.syncUser({
    id: user.id,
    email: user.email!,
    imageUrl: user.picture!,
    firstName: user.given_name!,
    lastName: user.family_name!,
  });

  if (response) {
    redirect("/api/auth");
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-grid-black/[0.5] dark:bg-grid-white/[0.2]">
      <RadialGradient />
      <MaxWidthWrapper className="flex flex-col items-center justify-center gap-5">
        <LoadingSpinner />
        <Heading>Creating your Account...</Heading>
        <p className="max-w-prose text-center text-base/7 text-muted-foreground">
          Just a moment while we set things up for you. You will be asked to
          authenticate your email for access to your Calendar.
        </p>
      </MaxWidthWrapper>
    </div>
  );
};

export default Page;
