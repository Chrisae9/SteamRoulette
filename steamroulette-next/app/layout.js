export const metadata = {
  title: 'SteamRoulette',
  description: 'Random Steam Game Picker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#1a202c', color: '#fff', fontFamily: 'Inter, sans-serif' }}>{children}</body>
    </html>
  );
}