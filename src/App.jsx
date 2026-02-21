import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import { NotificationProvider } from './components/ui/notification'
import { Skeleton } from './components/ui/skeleton'

const EditorPage = lazy(() => import('./pages/EditorPage'))
const PreviewPage = lazy(() => import('./pages/PreviewPage'))

function LoadingFallback() {
  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-amber-500 text-2xl mb-3 animate-fade-in">&#10013;</div>
        <div className="text-zinc-400 text-sm tracking-wide animate-fade-in">Loading editor...</div>
        <div className="flex flex-col items-center gap-3 mt-6">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/preview" element={<PreviewPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </ErrorBoundary>
  )
}
