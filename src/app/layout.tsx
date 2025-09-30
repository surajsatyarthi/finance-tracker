import type { Metadata } from "next";
import { Lato, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import Header from '../components/Header';

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
      <body
        className={`${lato.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gradient-to-br from-slate-50 to-gray-100`}
        style={{ fontFamily: 'var(--font-lato), sans-serif' }}
      >
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen">
              <Header />
              <main>
                {children}
              </main>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
