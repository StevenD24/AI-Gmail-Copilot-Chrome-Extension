import ExtensionHandler from './components/ExtensionHandler';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Email Copilot</h1>
        <ExtensionHandler />
      </main>
    </div>
  );
}
