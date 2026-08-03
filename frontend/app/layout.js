import './globals.css';
import { CartProvider } from '../hooks/useCart';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'RentEase - Premium Furniture & Appliance Rentals',
  description: 'Rent premium appliances & furniture with customizable monthly tenure options, minimal security deposits, and express delivery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <CartProvider>
          <div className="flex flex-col min-height-screen justify-between min-h-screen">
            <Header />
            <main className="flex-grow pt-24 pb-16 px-4 max-w-7xl mx-auto w-full">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

