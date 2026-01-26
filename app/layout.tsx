import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { RoleProvider } from "@/lib/RoleContext";
import { ToastProvider } from "@/lib/ToastContext"; // Added ToastProvider import
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { SettingsProvider } from "@/lib/SettingsContext";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import SkipLink from "@/components/a11y/SkipLink";
import MaintenanceMode from "@/components/MaintenanceMode";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Academic Excellence Portal",
  description: "Browse and submit achievements across various categories.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CS Excellence",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(outfit.className, "min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased")} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RoleProvider>
              <ToastProvider> {/* Wrapped children with ToastProvider */}
                <SettingsProvider>
                  <NotificationProvider>
                    <MaintenanceMode>
                      <SkipLink />
                      <InstallPrompt />
                      <Navbar />
                      <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
                        {children}
                      </main>
                      <Footer />
                    </MaintenanceMode>
                  </NotificationProvider>
                </SettingsProvider>
              </ToastProvider>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
