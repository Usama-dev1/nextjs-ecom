import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../assets/styles/globals.css";
import { APP_DESCRIPTION, APP_TITLE, APP_URL } from "@/lib/constants";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] });
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/lib/auth/context/session.context";
export const metadata: Metadata = {
  title: { template: `%s | ${APP_TITLE}`, default: APP_TITLE },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <SessionProvider>
            {children}
            <Toaster richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
