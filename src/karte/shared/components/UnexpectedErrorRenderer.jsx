import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';

//import store from 'karte/shared/logics/store';
//import {connect} from 'react-redux';
//import {sendError} from 'karte/shared/logics/store';
//export default function ErrorPage() {
export default class UnexpectedErrorRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.backClick = this.backClick.bind(this);
  }

  backClick() {
    //this.$f7.views.main.router.navigate(APP_DIR_PATH + '/login');
    window.location.href = APP_DIR_PATH + '/login';
    // this.props.sendError({
    //   error: false,
    //   errorCode: '',
    //   errorMessage: ''
    // });
  }

  
  render() {
    return (
      <Page>
        { //<Navbar title="Error" backLink="Back" backLinkUrl={APP_DIR_PATH+'/login'} reloadAll={true}/>
        }
        <Navbar title="Error" backLink="Back" onBackClick={this.backClick}/>
        <Block strong>
          <p>Code:{this.props.error.errorCode}</p>
          <p>Message:{this.props.error.message}</p>
        </Block>
      </Page>
    );
  }
}

/*
function mapStateToProps(state) {
  return {
    error: state.error,
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
*/
