import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GIZ Bonn • EVA 5.26 Notruf-Dokumentation (Scrollable Tox-GUI)',
  description: 'Moderne, kontinuierlich scrollbare Desktop-GUI für das EVA-Protokoll 5.26 der Informationszentrale gegen Vergiftungen am Universitätsklinikum Bonn.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
