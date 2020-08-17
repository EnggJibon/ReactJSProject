import React from 'react';
import DocumentTitle from 'react-document-title';
import {
  Page,
  Navbar,
  NavTitle,
  Input,
  Label,
  Block,
  List,
  ListItem,
  Row,
  Col,
  Button
} from 'framework7-react';
import {Dom7} from 'framework7';
import Authentication from 'karte/shared/logics/authentication';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import {UnexpectedError} from 'karte/shared/logics/errors';
import {sendLoginUser} from 'karte/shared/reducers/common-reducer';
import { connect } from 'react-redux';

class ChangeInitialPasswordPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPassword: '',
      userId: '',
      newPassword: '',
      errorMessage: '',
      dict: {
        application_title: '',
        change_password: '',
        save: '',
        cancel: '',
        current_password: '',
        new_password: '',
        ok: '',
        confirm: '',
        msg_password_updated: '',
        msg_change_initial_password: '',
        user_id: '',
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.setDictionary = this.setDictionary.bind(this);
    this.showConfirmMassage = this.showConfirmMassage.bind(this);
  }

  setDictionary() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function(values) {
        me.setState({dict: values});
      })
      .catch(function(err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  componentDidMount() {
    //ページリロードによりStoreからログインユーザー情報が消えていたらログオフしてログイン画面に戻す
    if (!this.props.loginUser.userId ||this.props.loginUser.userId === '') {
      Authentication.logOff();
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {pushState: true});
      return;
    }
    this.setDictionary();

  }

  onPageInit() {
  }

  onPageAfterIn() {
    Dom7('#change-initial-password-current-password').focus();
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  saveClick() {
    if (this.state.currentPassword === '') {
      Dom7('#change-initial-password-current-password').focus();
      return;
    }
    if (this.state.newPassword === '') {
      Dom7('#change-initial-password-new-password').focus();
      return;
    }
    var me = this;
    Authentication.changePassword(this.props.loginUser.userId, this.state.currentPassword, this.state.newPassword)
      .then((res) => {
        if (res.error) {
          me.setState({errorMessage: res.errorMessage});
        }
        else {
          me.showConfirmMassage();
        }
      })
      .catch((err) => {
        me.setState(() => { throw new UnexpectedError(err); });
      }); 
  }

  showConfirmMassage() {
    var me = this;
    this.$f7.dialog.alert(this.state.dict.msg_password_updated, function () {
      me.$f7.views.main.router.navigate(APP_DIR_PATH + '/', {pushState: true}); //@TODO Redirect to requested page
    });
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.application_title}>
        <Page onPageAfterIn={this.onPageAfterIn.bind(this)} onPageInit={this.onPageInit.bind(this)}>
          <Navbar>
            <NavTitle>{this.state.dict.application_title}</NavTitle>
          </Navbar>
          <Block>
            <p>{this.state.dict.msg_change_initial_password}</p>
          </Block>
          <List form>
            <ListItem>
              <Label>{this.state.dict.current_password}</Label>
              <Input inputId="change-initial-password-current-password" name="currentPassword" type="password" 
                clearButton onInputClear={this.handleChange} 
                onChange={this.handleChange} required validate></Input>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.new_password}</Label>
              <Input inputId="change-initial-password-new-password" name="newPassword" type="password" 
                clearButton onInputClear={this.handleChange} onChange={this.handleChange} required validate></Input>
            </ListItem>
          </List>
          <Block>
            <Row>
              <Col>
                <p className="errorMessage">{this.state.errorMessage}</p>
              </Col>
            </Row>
            <Row>
              <Col width="33">
                <Button fill text={this.state.dict.save} onClick={this.saveClick.bind(this)}></Button>
              </Col>
            </Row>
          </Block>
        </Page>
      </DocumentTitle>
    );
  
  }
}

function mapDispatchToProps(dispatch) {
  return {
    //Common Storeへログインユーザー情報の送信
    sendLogin(value) {
      dispatch(sendLoginUser(value));
    },
  };
}

function mapStateToProps(state) {
  return {
    //Common Storeからログイン情報を取得
    loginUser: state.common.loginUser,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeInitialPasswordPage);