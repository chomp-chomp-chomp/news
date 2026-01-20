import type { Metadata } from "next";
import "./globals.css";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Newsletter Platform";
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Subscribe to quality newsletters curated by experts";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ogImage = process.env.NEXT_PUBLIC_OG_IMAGE;

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    siteName,
    ...(ogImage && {
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    }),
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    ...(ogImage && {
      images: [ogImage],
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
