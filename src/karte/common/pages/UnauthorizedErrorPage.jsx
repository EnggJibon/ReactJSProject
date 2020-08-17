import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';

import {connect} from 'react-redux';
import {sendError} from 'karte/shared/reducers/common-reducer';

class ErrorPage extends React.Component {
  constructor(props) {
    super(props);
    this.backClick = this.backClick.bind(this);
  }

  backClick() {
    window.location.href = APP_DIR_PATH + '/login';
  }

  
  render() {
    return (
      <Page>
        <Navbar title="Error" backLink="Back" onBackClick={this.backClick}/>
        <Block strong>
          <p>Code:{this.props.error.errorCode}</p>
          <p>Message:{this.props.error.errorMessage}</p>
        </Block>
      </Page>
    );
  }
}

function mapStateToProps(state) {
  return {
    error: state.common.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    sendError(value) {
      dispatch(sendError(value));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorPage);
