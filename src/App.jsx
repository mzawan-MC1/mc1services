import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ErrorBoundary from "@/components/ErrorBoundary"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Pages />
      </ErrorBoundary>
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  )
}

export default App 