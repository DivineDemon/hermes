import { Button } from "@/components/ui/button";

import { initialSync } from "../(server-actions)/initial-sync";

const Page = () => {
  return (
    <div className="flex w-full items-center justify-center p-5 text-3xl font-bold">
      <Button type="button" onClick={initialSync}>
        Sync Emails
      </Button>
    </div>
  );
};

export default Page;
