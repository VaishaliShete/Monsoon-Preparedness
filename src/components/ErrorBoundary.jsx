import { Component } from 'react'

// React error boundaries must be class components — there is no hook
// equivalent (as of React 19) for catching render-time errors in children.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state" role="alert">
          <h2>Something went wrong</h2>
          <p>The app hit an unexpected error. Please reload the page.</p>
          <button type="button" onClick={this.handleReload}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
