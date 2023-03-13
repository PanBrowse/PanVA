import type { App } from 'vue'

import { useGlobalStore } from './stores/global'
import type { AppError } from './types'

// Show the error in an overlay on the screen.
export const showError = (error: AppError) => {
  const store = useGlobalStore()
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

  // Apparently there are many errors that are picked up that aren't that important.
  // Since they don't impact the user, let's ignore them for now.

  // Generic Javascript errors.
  // window.onerror = () => {
  //   showError(defaultError)
  // }

  // Unhandled reject promises.
  // window.addEventListener('unhandledrejection', () => {
  //   showError(defaultError)
  // })
}
