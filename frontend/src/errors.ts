import type { App } from 'vue'
import { useDataStore } from './stores/data'

// Show the error in an overlay on the screen.
const showError = () => {
  const store = useDataStore()
  store.setError({
    message: 'There was a problem with the application itself.',
  })
}

export const registerErrorHandlers = (app: App) => {
  // Errors from Vue components.
  app.config.errorHandler = (err) => {
    showError()
    throw err
  }

  // Generic Javascript errors.
  window.onerror = () => {
    showError()
  }

  // Unhandled reject promises.
  window.addEventListener('unhandledrejection', () => {
    showError()
  })
}
