export default function AboutPage() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/30 dark:to-blue-900/30'>
      {/* Background Pattern */}
      <div className='fixed inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none opacity-50 dark:opacity-[0.02]' />
      <div className='relative min-h-screen grid place-items-center p-4'>
        <div className='w-full max-w-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
          <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
            <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>About Todo List Bin</h1>
          </div>
          <div className='p-6 pt-0 text-slate-700 dark:text-slate-300'>
            <div className='px-8 py-8 text-slate-700 dark:text-slate-300'>
              <p className='mb-2'>
                <strong>Todo List Bin</strong> is a modern, shareable todo list app inspired by Pastebin. It allows you to quickly create, manage, and share task lists online—no registration required.
              </p>
              <ul className='list-disc pl-5 mb-2'>
                <li>Create todo lists instantly and share them via unique URLs</li>
                <li>Collaborate in real-time with team members</li>
                <li>Reorder tasks easily with drag-and-drop</li>
                <li>Set expiration for lists to keep things tidy</li>
                <li>Modern, responsive UI with dark mode support</li>
                <li>Privacy-first: no login, no tracking, your data is yours</li>
              </ul>
              <p className='mb-2'>
                <strong>Tech Stack:</strong> Next.js, TypeScript, Tailwind CSS, Supabase (or Go backend), React DnD.
              </p>
              <p>Todo List Bin was built to make sharing and collaborating on tasks as simple and fast as possible. Whether you're planning a project, sharing a checklist, or just jotting down ideas, Todo List Bin is here to help.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
