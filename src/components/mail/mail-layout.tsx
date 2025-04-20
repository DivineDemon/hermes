"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TooltipProvider } from "../ui/tooltip";

interface MailLayoutProps {
  navCollapsedSize: number;
  defaultCollapsed: boolean;
  defaultLayout: number[] | undefined;
}

const MailLayout = ({
  navCollapsedSize,
  defaultCollapsed,
  defaultLayout = [20, 32, 48],
}: MailLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          console.log(sizes);
        }}
        className="h-full min-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true);
          }}
          onResize={() => {
            setIsCollapsed(false);
          }}
          className={cn("transition-all duration-300 ease-in-out", {
            "min-w-[50px]": isCollapsed,
          })}
        >
          <div className="flex h-full flex-1 flex-col">
            <div
              className={cn("flex h-[52px] items-center justify-between", {
                "h-[52px]": isCollapsed,
                "px-2": !isCollapsed,
              })}
            >
              Account Switcher
            </div>
            <Separator />
            {/* Sidebar */}
            <div className="flex-1"></div>
            Ask AI
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="INBOX">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="INBOX"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="DONE"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            Search Bar
            <TabsContent value="INBOX">Inbox</TabsContent>
            <TabsContent value="DONE">Done</TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          Threads
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default MailLayout;
