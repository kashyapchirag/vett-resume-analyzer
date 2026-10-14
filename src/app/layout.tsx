import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vett | Resume & Job Description Analyzer",
  description:
    "A minimal tool to compare your resume against a job description and get an explainable Estimated ATS Match Score.",
};

const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('vett-theme');
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = saved === 'dark' || (saved !== 'light' && systemDark) ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col app-background antialiased">
        {children}
      </body>
    </html>
  );
}
