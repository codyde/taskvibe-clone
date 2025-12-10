import { createRouter, Link } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Default Not Found Component
function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-(--color-bg-primary) text-(--color-text-primary)">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-(--color-primary)">404</h1>
        <h2 className="text-xl font-medium text-(--color-text-secondary)">
          Page not found
        </h2>
        <p className="text-(--color-text-muted) max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-(--color-primary) hover:bg-(--color-primary)/80 text-white rounded-md transition-colors duration-(--transition-fast)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  )
}

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundComponent,
  })

  return router
}
