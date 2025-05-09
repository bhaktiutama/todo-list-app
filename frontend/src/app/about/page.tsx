export default function AboutPage() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-200 via-purple-50/40 to-blue-50/40 dark:from-slate-900 dark:via-purple-900/30 dark:to-blue-900/30'>
      {/* Background Pattern */}
      <div className='fixed inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none opacity-50 dark:opacity-[0.02]' />
      <div className='relative top-0 left-0 w-full min-h-screen place-items-center p-4 pt-10 z-10'>
        <div className='w-full max-w-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
          <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
            <h1 className='text-3xl font-bold text-center text-slate-900 dark:text-white'>Welcome to Todo List Bin</h1>
          </div>
          <div className='p-6 md:p-8 text-slate-700 dark:text-slate-300'>
            {/* Hero Section */}
            <section className='text-center mb-12'>
              <p className='text-lg md:text-xl leading-relaxed mb-8'>Life is full of things to do—big or small. TodoList Bin helps you organize them all, from daily chores to personal goals. Write down tasks, track progress, and start taking action. Whether it's a quick reminder or a big project, your to-do list is where it begins. Small steps add up. Start today, and see how your list helps you move forward.</p>
              <a href='/' className='inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all text-lg'>
                Create Your First List
              </a>
            </section>

            {/* Features Section */}
            <section className='mb-12'>
              <h2 className='text-2xl font-semibold text-center mb-8 text-slate-800 dark:text-slate-100'>Key Features</h2>
              <div className='grid md:grid-cols-3 gap-8'>
                {[
                  {
                    icon: (
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-8 h-8 mb-3 text-blue-500 dark:text-blue-400'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' />
                      </svg>
                    ),
                    title: 'Instant & Shareable',
                    description: 'Create todo lists instantly and share them via unique URLs.',
                  },
                  {
                    icon: (
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-8 h-8 mb-3 text-blue-500 dark:text-blue-400'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' />
                      </svg>
                    ),
                    title: 'Real-time Collaboration',
                    description: 'Collaborate in real-time with team members.',
                  },
                  {
                    icon: (
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-8 h-8 mb-3 text-blue-500 dark:text-blue-400'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M16.5 3l4.5 4.5m0 0L16.5 12m4.5-4.5H3' />
                      </svg>
                    ),
                    title: 'Drag & Drop Reorder',
                    description: 'Reorder tasks easily with drag-and-drop functionality.',
                  },
                  {
                    icon: (
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-8 h-8 mb-3 text-blue-500 dark:text-blue-400'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    ),
                    title: 'Set Expiration',
                    description: 'Set expiration for lists to keep things tidy and manageable.',
                  },
                  {
                    icon: (
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-8 h-8 mb-3 text-blue-500 dark:text-blue-400'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.16 14.55a2.25 2.25 0 01-1.591.659H1.5V19.5h3.075a4.506 4.506 0 001.757-.355L7.5 18.44M9.75 3.104c.617.117 1.212.268 1.77.453m-.542 16.004c1.757.355 3.724.355 5.481 0l1.217-1.217a2.25 2.25 0 00.659-1.591V5.459a2.25 2.25 0 00-.659-1.591L15.84 2.21a2.25 2.25 0 00-1.591-.659H9.75M9.75 3.104C7.112 3.615 5.062 4.95 3.498 6.745M19.5 19.5h3.075a4.506 4.506 0 001.757-.355L22.5 18.44m-2.25-12.036c.617.117 1.212.268 1.77.453m0 0A9.007 9.007 0 0022.5 6.745M14.25 14.55l1.632 1.632a2.25 2.25 0 001.591.659h3.075V15h-3.075a4.506 4.506 0 00-1.757.355L14.25 14.55m-3.075-9.8a2.25 2.25 0 00-1.591.659L7.95 7.05a2.25 2.25 0 00-.659 1.591v5.714' />
                      </svg>
                    ),
                    title: 'Modern UI & Dark Mode',
                    description: 'Modern, responsive UI with seamless dark mode support.',
                  },
                  {
                    icon: (
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-8 h-8 mb-3 text-blue-500 dark:text-blue-400'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' />
                      </svg>
                    ),
                    title: 'Privacy-First',
                    description: 'No login, no tracking. Your data is yours, respected and protected.',
                  },
                ].map((feature, index) => (
                  <div key={index} className='p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/30 dark:border-slate-700/50 flex flex-col items-center text-center'>
                    {feature.icon}
                    <h3 className='text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100'>{feature.title}</h3>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Why Choose Us Section */}
            <section className='mb-12 py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl px-6 md:px-8'>
              <h2 className='text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-slate-100'>Our Mission</h2>
              <p className='text-center text-md md:text-lg leading-relaxed'>
                <strong>Todo List Bin</strong> is a modern, shareable todo list app inspired by Pastebin. It allows you to quickly create, manage, and share task lists online—no registration required. Todo List Bin was built to make sharing and collaborating on tasks as simple and fast as possible. Whether you're planning a project, sharing a checklist, or just jotting down ideas, Todo List Bin is here to help.
              </p>
            </section>

            {/* Tech Stack Section */}
            <section className='text-center'>
              <h2 className='text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100'>Powered By</h2>
              <p className='text-md text-slate-600 dark:text-slate-400'>Next.js, TypeScript, Tailwind CSS, Supabase (or Go backend), React DnD.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
