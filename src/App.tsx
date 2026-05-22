import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans">
      <div className="glassmorphism max-w-md w-full p-8 rounded-2xl border border-border flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl font-extrabold">N</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-sans text-foreground mb-2">NexHub Intranet</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Phase 1 Foundation Setup Complete. Folder structures, TypeScript interfaces, and seeded data plan are fully configured and ready.
        </p>
        
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => setCount((c) => c + 1)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Vite Hot Reload Count: {count}
          </button>
          
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg border border-border/50 text-left font-mono">
            <div>✓ Tailwind Configured</div>
            <div>✓ HSL CSS Variables Seeded</div>
            <div>✓ TypeScript Entity Interfaces</div>
            <div>✓ Seed Data Layout Structured</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
