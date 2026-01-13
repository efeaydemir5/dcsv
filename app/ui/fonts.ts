import { Orbitron, Space_Grotesk } from "next/font/google";

export const fontDisplay = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const fontBody = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

