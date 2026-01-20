import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings } from '@/lib/db/site-settings'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    title: {
      default: settings.site_name,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.site_description,
    metadataBase: new URL(siteUrl),
    ...(settings.favicon_url && {
      icons: {
        icon: settings.favicon_url,
      },
    }),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      title: settings.site_name,
      description: settings.site_description,
      siteName: settings.site_name,
      ...(settings.og_image_url && {
        images: [
          {
            url: settings.og_image_url,
            width: 1200,
            height: 630,
            alt: settings.site_name,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_name,
      description: settings.site_description,
      ...(settings.twitter_image_url && {
        images: [settings.twitter_image_url],
      }),
    },
  }
}

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
