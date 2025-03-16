import { type Metadata } from "next";
import { Inter } from "next/font/google";

import "@/assets/css/globals.css";
import ThemeProvider from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hermes",
  description: "Next Gen AI Powered Email Assistant",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", inter.className)}
      suppressHydrationWarning={true}
    >
      <body>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen w-full items-center justify-center overflow-hidden">
              {children}
            </div>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
