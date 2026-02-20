import './globals.css';

export const metadata = {
  title: 'SupplyGuard AI — Supply Chain Disruption Platform',
  description: 'AI-powered supply chain disruption prediction and risk management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#070b14', color: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
