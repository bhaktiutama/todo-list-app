import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import NewListButton from '@/components/NewListButton';
import DuplicateListButton from '@/components/DuplicateListButton';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Todo List App',
  description: 'A shareable todo list application built with Next.js and Go',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
      <head>
        <link rel='stylesheet' href='https://rsms.me/inter/inter.css' />
        {/* Inline script to prevent FOUC (Flash of Unstyled Content) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  let isDark = false;
                  const savedTheme = localStorage.getItem('theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                    isDark = true;
                  }

                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className='bg-gradient-to-br from-slate-200 to-white dark:from-dark-bg dark:to-dark-surface min-h-screen transition-colors duration-200' suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <div className='relative pt-14'>
            {/* Tombol New List, Duplicate, dan ThemeToggle di pojok kanan atas, vertikal dan rapi */}
            <NewListButton className='fixed right-4 top-4 z-50' />
            <DuplicateListButton className='fixed right-4 top-16 z-50' />
            <ThemeToggle className='fixed right-4 top-28 z-50' />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
