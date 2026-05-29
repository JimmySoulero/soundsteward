import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FeedbackCenter } from "@/components/feedback/FeedbackCenter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoundSteward — Learn the Nashville Number System",
  description:
    "Modern music theory for musicians, worship teams, producers, and songwriters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-text">
        {children}
        <FeedbackCenter />
      </body>
    </html>
  );
}
