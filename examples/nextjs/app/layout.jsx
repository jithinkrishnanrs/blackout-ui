import { BlackoutProvider } from './BlackoutProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BlackoutProvider options={{ radius: 220 }}>{children}</BlackoutProvider>
      </body>
    </html>
  );
}
