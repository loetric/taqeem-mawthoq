import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "تقييم موثوق - منصة تقييم الأماكن الموثوقة",
  description: "منصة تقييم موثوق لتقييم الأماكن في المملكة العربية السعودية مع ضمان نزاهة التقييمات",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
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
      </head>
      <body
        className={`${cairo.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
