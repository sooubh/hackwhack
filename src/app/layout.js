import './globals.css';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'SupplyGuard AI — Supply Chain Disruption Platform',
  description: 'AI-powered supply chain disruption prediction and risk management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#070b14', color: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>
        <DataProvider>
          {children}
        </DataProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px'
            }
          }}
        />
      </body>
    </html>
  );
}
