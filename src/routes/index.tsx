export default function Home() {
  return (
    <div class="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">Copilot Proxy</h1>
        <p class="text-xl text-neutral-400 mb-8">Welcome to the Copilot Proxy service</p>
        <a 
          href="/admin" 
          class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/admin';
          }}
        >
          Go to Admin Dashboard
        </a>
      </div>
    </div>
  );
}
