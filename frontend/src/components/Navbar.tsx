import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className='fixed top-0 left-0 w-full z-40 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur'>
      <div className='max-w-3xl mx-auto flex items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-3'>
          <Image src='/logo-landscape.png' alt='Todo List Bin Logo' width={160} height={0} style={{ height: 'auto' }} priority className='block dark:hidden' />
          <Image src='/logo-landscape-dark.png' alt='Todo List Bin Logo Dark' width={160} height={0} style={{ height: 'auto' }} priority className='hidden dark:block' />
        </div>
        <div className='flex items-center gap-4'>
          <Link href='/about' className='font-normal text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors'>
            About
          </Link>
          <Link href='/privacy-policy' className='font-normal text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors'>
            Privacy Policy
          </Link>
          <a href='https://github.com/bhaktiutama/todo-list-app' target='_blank' rel='noopener noreferrer' aria-label='GitHub Repository' className='ml-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center'>
            <svg viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5' aria-hidden='true'>
              <path d='M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z' />
            </svg>
            <span className='sr-only'>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
