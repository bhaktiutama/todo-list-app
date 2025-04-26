export default function PrivacyPolicyPage() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/30 dark:to-blue-900/30'>
      {/* Background Pattern */}
      <div className='fixed inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none opacity-50 dark:opacity-[0.02]' />
      <div className='relative top-0 left-0 w-full min-h-screen place-items-center p-4 pt-10 z-10'>
        <div className='w-full max-w-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-glass-lg border border-white/20 dark:border-white/10'>
          <div className='relative px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50'>
            <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>Privacy Policy</h1>
          </div>
          <div className='p-6 pt-0 text-slate-700 dark:text-slate-300'>
            <div className='px-8 py-8 text-slate-700 dark:text-slate-300'>
              <p className='mb-2'>
                <strong>Todo List Bin</strong> is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding your information.
              </p>
              <ul className='list-disc pl-5 mb-2'>
                <li>
                  <strong>Data Collection:</strong> We only store the todo lists and tasks you create. No personal information or account registration is required.
                </li>
                <li>
                  <strong>Usage:</strong> Your data is used solely to provide the todo list service. Lists are accessible via unique URLs and, if set, edit tokens.
                </li>
                <li>
                  <strong>Data Retention:</strong> Todo lists are automatically deleted after their expiration period. You can also delete your list at any time if you have the edit token.
                </li>
                <li>
                  <strong>Third-Party Services:</strong> We use Supabase (or Go backend) for data storage. No analytics or tracking scripts are used.
                </li>
                <li>
                  <strong>Security:</strong> All data is transmitted over secure HTTPS connections.
                </li>
              </ul>
              <p className='mb-2'>
                <strong>Your Rights:</strong> You have full control over your todo lists. If you have questions or requests regarding your data, please contact the developer via the project's GitHub repository.
              </p>
              <p>By using Todo List Bin, you agree to this privacy policy. This policy may be updated from time to time; please check back for changes.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
