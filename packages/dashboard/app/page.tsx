import Link from 'next/link';
import { ArrowRight, Terminal, Cpu, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              &gt;_ GenesisAI
            </span>
          </div>
          <div className="items-center space-x-6">
            <span className="text-sm text-gray-400 px-3 py-1 bg-green-900/20 text-green-400 rounded-full border border-green-900/50">
              System Operational
            </span>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Get Started &rarr;
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 border border-blue-500/20 bg-blue-500/10 px-3 py-1 rounded-full text-blue-400 text-xs font-medium uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
            <span>Docker-Native Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            From Prompt to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Production</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
            GenesisAI converts natural language into full-stack microservices. Describe your idea, and let our AI agents build, deploy, and document it for you.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="bg-white text-black px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
            >
              Start Building for Free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Visual */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="font-mono text-sm text-gray-300 space-y-2">
              <p className="text-purple-400">➜  ~ <span className="text-white">genesis create "chat app"</span></p>
              <p className="text-gray-500">[AI] Analyzing requirements...</p>
              <p className="text-gray-500">[AI] Generating Dockerfile...</p>
              <p className="text-gray-500">[AI] Deploying to Swarm cluster...</p>
              <p className="text-green-400">✔ Deployed successfully at https://chat-app.genesis.dev</p>
              <p className="animate-pulse">_</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-24 border-t border-white/5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-12 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
            <Terminal className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Docker Native</h3>
            <p className="text-gray-400">Built on Docker Swarm for simplicity and performance. No Kubernetes complexity required.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
            <Cpu className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Powered</h3>
            <p className="text-gray-400">Intelligent agents handle the build pipelines, Dockerfile generation, and optimization.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-colors">
            <Shield className="w-10 h-10 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure by Default</h3>
            <p className="text-gray-400">Automatic SSL, isolated build environments, and encrypted secrets management.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
