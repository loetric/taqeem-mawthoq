import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./sw-register";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "تقييم موثوق - منصة تقييم الأماكن الموثوقة",
  description: "منصة تقييم موثوق لتقييم الأماكن في المملكة العربية السعودية مع ضمان نزاهة التقييمات",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "تقييم موثوق",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "تقييم موثوق",
    title: "تقييم موثوق - منصة تقييم الأماكن الموثوقة",
    description: "منصة تقييم الأماكن الموثوقة",
  },
  twitter: {
    card: "summary",
    title: "تقييم موثوق",
    description: "منصة تقييم الأماكن الموثوقة",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="تقييم موثوق" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/icon-192.png" />
      </head>
      <body
        className={`${tajawal.variable} font-sans antialiased`}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
