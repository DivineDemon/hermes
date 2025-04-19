"use server";

import { redirect } from "next/navigation";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { nylas } from "@/lib/nylas";
import { db } from "@/server/db";

import { syncEmailsToDB } from "./sync-emails";

export async function initialSync() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userAccount = await db.account.findMany({
    where: {
      userId: user.id,
    },
  });

  if (!userAccount) {
    redirect("/sign-in");
  }

  try {
    const result = await nylas.messages.list({
      // @ts-ignore
      identifier: userAccount[0].grantId as string,
      queryParams: {
        limit: 5,
      },
    });

    await syncEmailsToDB(result.data, userAccount[0]!.id);
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
