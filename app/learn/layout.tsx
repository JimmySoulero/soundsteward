import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn — SoundSteward",
  description:
    "Master the 12 major keys before learning the Nashville Number System.",
};

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
