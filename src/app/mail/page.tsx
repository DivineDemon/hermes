import MailLayout from "@/components/mail/mail-layout";

const Page = () => {
  return (
    <MailLayout
      defaultCollapsed={false}
      defaultLayout={[20, 32, 40]}
      navCollapsedSize={4}
    />
  );
};

export default Page;
