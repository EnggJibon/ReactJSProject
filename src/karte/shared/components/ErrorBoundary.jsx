import React from 'react';
//import { Page, Navbar, Block } from 'framework7-react';
//import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import UnexpectedErrorPage from './UnexpectedErrorRenderer';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error) { //, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    this.setState({error: error});
    // You can also log the error to an error reporting service
    //logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <UnexpectedErrorPage error={this.state.error}></UnexpectedErrorPage>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;