import type { App } from 'vue'
import { useDataStore } from './stores/data'
import type { AppError } from './types'

// Show the error in an overlay on the screen.
export const showError = (error: AppError) => {
  const store = useDataStore()
  store.setError(error)
}

export const registerErrorHandlers = (app: App) => {
  const defaultError = {
    message: 'There was a problem with the application itself.',
  }

  // Errors from Vue components.
  app.config.errorHandler = (error) => {
    showError(defaultError)
    throw error
  }

  // Generic Javascript errors.
  // window.onerror = (error) => {
  //   const err = error.toString()

  //   if (err === 'ResizeObserver loop completed with undelivered notifications.')
  //     return

  //   showError(defaultError)
  // }

  // Unhandled reject promises.
  // window.addEventListener('unhandledrejection', () => {
  //   showError(defaultError)
  // })
}
