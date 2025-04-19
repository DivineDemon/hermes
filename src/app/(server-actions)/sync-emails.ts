"use server";

import type { Attachment, EmailName, Message } from "nylas";

import { db } from "@/server/db";

async function upsertAttachment(emailId: string, attachment: Attachment) {
  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id ?? "" },
      update: {
        name: attachment.filename,
        mimeType: attachment.contentType,
        size: attachment.size ?? 0,
        inline: attachment.isInline,
        contentId: attachment.contentId,
        content: attachment.contentDisposition,
        contentLocation: attachment.contentDisposition,
      },
      create: {
        name: attachment.filename,
        mimeType: attachment.contentType,
        size: attachment.size as number,
        inline: attachment.isInline as boolean,
        contentId: attachment.contentId,
        content: attachment.contentDisposition,
        contentLocation: attachment.contentDisposition,
        emailId,
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to upsert attachment for email ${emailId}: ${(error as Error).message}`
    );
  }
}

async function upsertEmailAddress(address: EmailName, accountId: string) {
  try {
    const emailAddr = address.email;
    const existingAddresses = await db.emailAddress.findUnique({
      where: { accountId_address: { accountId, address: emailAddr } },
    });

    if (existingAddresses) {
      return await db.emailAddress.update({
        where: {
          id: existingAddresses.id,
        },
        data: {
          name: address.name,
          raw: address.email,
        },
      });
    } else {
      return db.emailAddress.create({
        data: {
          address: address.email as string,
          name: address.name ?? "",
          raw: address.email,
          accountId,
        },
      });
    }
  } catch (error: Error | unknown) {
    throw new Error((error as Error).message);
  }
}

async function upsertEmail(email: Message, accountId: string) {
  try {
    let emailLabelType: "INBOX" | "SENT" | "DRAFT" = "INBOX";

    if (
      email.folders.includes("INBOX") ||
      email.folders.includes("IMPORTANT")
    ) {
      emailLabelType = "INBOX";
    } else if (email.folders.includes("SENT")) {
      emailLabelType = "SENT";
    } else if (email.folders.includes("DRAFT")) {
      emailLabelType = "DRAFT";
    }

    const addressesToUpsert = new Map();
    for (const address of [
      email.from,
      ...email.to,
      ...(email.cc as EmailName[]),
      ...(email.bcc as EmailName[]),
      ...(email.replyTo as EmailName[]),
    ]) {
      addressesToUpsert.set("address", address);
    }

    const upsertedAddresses: Awaited<ReturnType<typeof upsertEmailAddress>>[] =
      [];

    for (const address of addressesToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId);
      upsertedAddresses.push(upsertedAddress);
    }

    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        .map((address) => [address!.address, address])
    );

    const fromAddr = (email.from ?? [])[0]?.email;
    const fromAddress = fromAddr ? addressMap.get(fromAddr) : undefined;
    if (!fromAddress) {
      console.warn(`Missing from address for email ${email.id}`);
      return;
    }

    const toAddresses = email.to
      .map((address) => addressMap.get(address.email))
      .filter(Boolean);
    const ccAddresses = email.cc
      ?.map((address) => addressMap.get(address.email))
      .filter(Boolean);
    const bccAddresses = email.bcc
      ?.map((address) => addressMap.get(address.email))
      .filter(Boolean);
    const replyToAddresses = email.replyTo
      ?.map((address) => addressMap.get(address.email))
      .filter(Boolean);

    const participants = Array.from(
      new Set([
        fromAddress.id,
        ...toAddresses.map((a) => a?.id),
        ...ccAddresses!.map((a) => a?.id),
        ...bccAddresses!.map((a) => a?.id),
      ])
    );

    const thread = await db.thread.upsert({
      where: {
        id: email.threadId,
      },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.date),
        done: false,
        // @ts-expect-error Type 'undefined' is not assignable to type 'string'.
        participantIds: participants,
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject!,
        done: false,
        draftStatus: emailLabelType === "DRAFT",
        inboxStatus: emailLabelType === "INBOX",
        sentStatus: emailLabelType === "SENT",
        lastMessageDate: new Date(email.date),
        // @ts-expect-error Type 'undefined' is not assignable to type 'string'.
        participantIds: participants,
      },
    });

    await db.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.date),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.date),
        receivedAt: new Date(email.date),
        internetMessageId: email.id,
        subject: email.subject,
        sysLabels: email.folders,
        keywords: email.folders,
        sysClassifications: email.folders,
        sensitivity: "NORMAL",
        meetingMessageMethod: "OTHER",
        fromId: fromAddress.id,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses!.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses!.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses!.map((a) => ({ id: a!.id })) },
        hasAttachments: email.attachments?.length !== 0,
        // @ts-expect-error Index signature for type 'string' is missing in type 'MessageHeaders'.
        internetHeaders: email.headers,
        body: email.body,
        bodySnippet: email.snippet,
        // @ts-expect-error 'email.replyTo' is possibly 'undefined'.
        inReplyTo: email.replyTo[0]?.email,
        references: "",
        threadIndex: email.threadId,
        nativeProperties: email.metadata as any,
        folderId: "",
        omitted: [],
        emailLabel: emailLabelType,
      },
      create: {
        threadId: thread.id,
        createdTime: new Date(email.date),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.date),
        receivedAt: new Date(email.date),
        internetMessageId: email.id,
        subject: email.subject ?? "",
        sysLabels: email.folders,
        keywords: email.folders,
        sysClassifications: email.folders,
        sensitivity: "NORMAL",
        meetingMessageMethod: "OTHER",
        fromId: fromAddress.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses!.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses!.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses!.map((a) => ({ id: a!.id })) },
        hasAttachments: email.attachments?.length !== 0,
        // @ts-expect-error Index signature for type 'string' is missing in type 'MessageHeaders'.
        internetHeaders: email.headers,
        body: email.body,
        bodySnippet: email.snippet,
        // @ts-expect-error 'email.replyTo' is possibly 'undefined'.
        inReplyTo: email.replyTo[0]?.email,
        references: "",
        threadIndex: email.threadId,
        nativeProperties: email.metadata as any,
        folderId: "",
        omitted: [],
        emailLabel: emailLabelType,
      },
    });

    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: "asc" },
    });

    let threadFolderType = "SENT";
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === "INBOX") {
        threadFolderType = "INBOX";
        break;
      } else if (threadEmail.emailLabel === "DRAFT") {
        threadFolderType = "DRAFT";
      }
    }
    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      },
    });

    for (const attachment of email.attachments!) {
      await upsertAttachment(email.id, attachment);
    }
  } catch (error: Error | unknown) {
    throw new Error((error as Error).message);
  }
}

export async function syncEmailsToDB(emails: Message[], accountId: string) {
  try {
    await Promise.all(emails.map((email) => upsertEmail(email, accountId)));
  } catch (error: Error | unknown) {
    throw new Error((error as Error).message);
  }
}
