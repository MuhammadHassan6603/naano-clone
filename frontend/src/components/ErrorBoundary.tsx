import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/Button'
import { ErrorState } from './ui/Feedback'

type State = { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected error while rendering', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <ErrorState
        title="Something broke on this page"
        message="Reloading usually fixes it. Your bookings and balances are safe: they live on the server, not in this page."
        action={<Button onClick={() => window.location.reload()}>Reload the page</Button>}
      />
    )
  }
}
