import type { Metadata } from "next";
import { Lato, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { PrivacyProvider } from '../contexts/PrivacyContext';
import PWARegister from '../components/PWARegister';

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal finance tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body
        className={`${lato.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-lato), sans-serif' }}
      >
        <AuthProvider>
          <NotificationProvider>
            <PrivacyProvider>
              <MainShell>
                {children}
              </MainShell>
            </PrivacyProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
