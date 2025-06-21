import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FinTrack",
  description: "Budget Tracker App for Your Financial Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <LayoutWrapper 
            geistSans={geistSans.variable} 
            geistMono={geistMono.variable}
          >
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
