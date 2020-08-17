import React from 'react';
import DocumentTitle from 'react-document-title';
import {
  Page,
  Navbar,
  NavTitle,
  Link,
  Input,
  Label,
  Block,
  //  BlockTitle,
  NavLeft,
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

export default class PasswordResetPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userid: '',
      langId: '',
      errorMessage: '',
      dict: {
        application_title: '',
        user_id: '',
        msg_send_initial_password: '',
        msg_sent_initial_password: '',
        send: ''
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.setDictionary = this.setDictionary.bind(this);
    this.showConfirmMassage = this.showConfirmMassage.bind(this);
    //クエリパラメータで指定された言語を取得
    var lang = '';
    var query = this.$f7route.query;
    if (query.lang) {
      lang = query.lang;
    }
    this.state.langId = lang;
  }

  componentDidMount() {
    this.setDictionary(this.state.langId);
  }

  setDictionary(_lang) {
    var me = this;
    //ログイン画面用文言取得
    DictionaryLoader.getDictionaryBeforeLogin(_lang)
      .then(function(values) {
        me.setState({dict: values});
      })
      .catch(function(err) {
        me.setState(() => { throw new UnexpectedError(err); });
      });
  }

  onPageAfterIn() {
    Dom7('#password-reset-page-userid').focus();
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  sendClick() {
    if (this.state.userid === '') {
      Dom7('#password-reset-page-userid').focus();
      return;
    }
    var me = this;
    Authentication.resetPassword(this.state.userid)
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
    this.$f7.dialog.alert(this.state.dict.msg_sent_initial_password, function () {
      me.$f7.views.main.router.navigate(APP_DIR_PATH + '/login?lang=' + me.state.langId, {pushState: true});
    });
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.application_title}>
        <Page onPageAfterIn={this.onPageAfterIn.bind(this)}>
          <Navbar>
            <NavLeft><Link iconF7="arrow_left" href={APP_DIR_PATH+'/login?lang='+this.state.langId}/></NavLeft>
            <NavTitle>{this.state.dict.application_title}</NavTitle>
          </Navbar>
          {//<BlockTitle>{this.state.dict.reset_password}</BlockTitle>
          }
          <Block>
            <p>{this.state.dict.msg_send_initial_password}</p>
          </Block>
          <List form>
            <ListItem>
              <Label>{this.state.dict.user_id}</Label>
              <Input inputId="password-reset-page-userid" name="userid" type="text" clearButton onInputClear={this.handleChange} 
                onChange={this.handleChange} required validate></Input>
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
                <Button fill text={this.state.dict.send} onClick={this.sendClick.bind(this)}></Button>
              </Col>
            </Row>
          </Block>
        </Page>
      </DocumentTitle>
    );
  
  }
}

