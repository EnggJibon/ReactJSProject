import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import {
  Page,
  Navbar,
  NavTitle,
  Link,
  Input,
  Label,
  Block,
  BlockTitle,
  List,
  ListItem,
  Row,
  Col,
  Button
} from 'framework7-react';
import { Dom7 } from 'framework7';
import Authentication from 'karte/shared/logics/authentication';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { sendLoginUser } from 'karte/shared/reducers/common-reducer';
import { connect } from 'react-redux';
import { UnexpectedError } from 'karte/shared/logics/errors';
import Cookies from 'universal-cookie';
import { VERSION } from 'karte/shared/logics/version';
import { jsonAgent, PHP_BASE_URL } from 'karte/shared/logics/api-agent';
import chinaIcpLogo from 'image/china_icp.png';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userid: '',
      password: '',
      errorMessage: '',
      redirectToReferrer: false,
      dict: {
        application_title: '',
        login: '',
        user_id: '',
        password: '',
        forgot_password: ''
      },
      langId: '',
      langName: '',
      langChanged: false,
      chinaIcpNumber: '',
      chinaIcpUrl: '',
      chinaAuthNumber: '',
      chinaAuthUrl: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.loginClick = this.loginClick.bind(this);
    this.setLangName = this.setLangName.bind(this);
    this.createLangPicker = this.createLangPicker.bind(this);
    this.setDictionary = this.setDictionary.bind(this);
  }

  componentDidMount() {
    var me = this;
    //言語取得
    DictionaryLoader.getLanguages()
      .then((res) => {
        var defLang;
        for (var i = 0; i < res.mstLanguages.length; i++) {
          const language = res.mstLanguages[i];
          if (language.systemDefault === 1) {
            defLang = language.id;
          }
        }
        me.languages = res.mstLanguages;
        //言語Picker作成
        me.createLangPicker();
        var lang = '';
        //クエリパラメータで言語が指定されていればそれを優先
        var query = me.$f7route.query;
        if (query.lang) {
          lang = query.lang;
          me.setState({ langChanged: true });
          me.pickerLang.setValue([lang]);
        }
        else {
          //CookieにLANGが残っていればそれを使用
          const cookieLang = me.getCookieLang();
          if (cookieLang) {
            lang = cookieLang;
            me.setState({ langChanged: true });
            me.pickerLang.setValue([lang]);
          }
          else {
            //Cookieにもクエリパラメータもなければシステムデフォルト言語を使用
            lang = defLang;
          }
        }
        me.setState({ langId: lang });
        me.setLangName();
        me.setDictionary(lang);
      })
      .catch((err) => {
        me.setState(() => { throw new UnexpectedError(err); });
      });

    //中国ICP番号をPHPから取得
    jsonAgent
      .get(PHP_BASE_URL + 'Z0004_ChinaIcp.php')
      .then(res => {
        me.setState({ chinaIcpNumber: res.body.chinaIcpNumber });
        me.setState({ chinaIcpUrl: res.body.chinaIcpUrl });
        me.setState({ chinaAuthNumber: res.body.chinaAuthNumber });
        me.setState({ chinaAuthUrl: res.body.chinaAuthUrl });
      });
  }

  getCookieLang() {
    const cookies = new Cookies();
    return cookies.get('LANG');
  }

  setDictionary(_lang) {
    var me = this;
    //ログイン画面用文言取得
    DictionaryLoader.getDictionaryBeforeLogin(_lang)
      .then(function (values) {
        me.setState({ dict: values });
      })
      .catch(function (err) {
        me.setState(() => { throw new UnexpectedError(err); });
      });
  }

  setLangName() {
    var me = this;
    var selectedLangId = me.state.langId;
    var language = me.languages.find((language) => { return (language.id === selectedLangId); });
    me.setState({ langName: language.lang });
  }

  onPageAfterIn() {
    Dom7('#login-page-userid').focus();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  loginClick() {
    if (this.state.userid === '') {
      Dom7('#login-page-userid').focus();
      return;
    }
    if (this.state.password === '') {
      Dom7('#login-page-password').focus();
      return;
    }
    var me = this;
    Authentication.login(this.state.userid, this.state.password, this.state.langChanged ? this.state.langId : '')
      .then(function (result) {
        if (!result.error) {
          let loginUser = {
            userId: me.state.userid,
            token: result.token,
          };
          me.props.sendLogin(loginUser);
          if (result.initialPassword) {
            //初期パスワードのときはパスワード変更ページへ
            me.$f7.views.main.router.navigate(APP_DIR_PATH + '/init-password-change', { pushState: true });
          }
          else {
            me.$f7.views.main.router.navigate(APP_DIR_PATH + '/', { pushState: true }); //@TODO 要求されたURLへのリダイレクト
          }
        }
        else {
          me.setState({
            errorMessage: result.errorMessage,
          });
        }
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  createLangPicker() {
    var me = this;
    var _values = [];
    var _displayValues = [];
    for (var i = 0; i < me.languages.length; i++) {
      let language = me.languages[i];
      _values.push(language.id);
      _displayValues.push(language.lang);
    }
    me.pickerLang = me.createPicker('#picker-lang', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        const oldLangId = me.state.LangId;
        me.setState({ langId: value });
        me.setState({ langName: displayValue });
        if (oldLangId !== value) {
          DictionaryLoader.clearCashe();
          me.setState({ langChanged: true });
          me.setDictionary(me.state.langId);
        }
      }
    );
  }

  createPicker(elementName, _values, _displayValues, onColChange) {
    var me = this;
    const app = me.$f7;
    return app.picker.create({
      inputEl: elementName,
      formatValue: function (values, displayValues) {
        return displayValues[0];
      },
      routableModals: false, //URLを変更しない
      toolbarCloseText: 'Close',
      cols: [
        {
          textAlign: 'center',
          values: _values,
          displayValues: _displayValues,
          onChange: onColChange
        }
      ],
    });
  }

  clickLang() {
    if (this.pickerLang) {
      this.pickerLang.open();
    }
  }

  onPageBeforeRemove() {
    if (this.pickerLang) {
      this.pickerLang.destroy();
    }
  }

  render() {
    //const { redirectToReferrer } = this.state;
    //if (this.state.redirectToReferrer === true) {
    //  return <Redirect to='/' />;
    //}
    var chinaIcpLink = '';
    if (this.state.chinaIcpNumber !== '') {
      chinaIcpLink =
        <Fragment>
          <Block className="text-align-right no-margin-top no-margin-bottom">
            <img src={chinaIcpLogo} alt="Logo" />
            <Link external target="_blank" href={this.state.chinaAuthUrl}>{this.state.chinaAuthNumber}</Link>
          </Block>
          <Block className="text-align-right no-margin-top">
            <Link external target="_blank" href={this.state.chinaIcpUrl}>{this.state.chinaIcpNumber}</Link>
          </Block>
        </Fragment>;
    }
    return (
      <DocumentTitle title={this.state.dict.application_title}>
        <Page onPageAfterIn={this.onPageAfterIn.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <Navbar>
            <NavTitle>{this.state.dict.application_title}</NavTitle>
          </Navbar>
          <Block className="text-align-right smallMargin no-margin-bottom">
            <Link onClick={this.clickLang.bind(this)}>{this.state.langName}</Link>
          </Block>
          <BlockTitle>{this.state.dict.login}</BlockTitle>
          <List form>
            <ListItem>
              <Label>{this.state.dict.user_id}</Label>
              <Input inputId="login-page-userid" name="userid" type="text" clearButton onInputClear={this.handleChange} onChange={this.handleChange} required validate></Input>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.password}</Label>
              <Input inputId="login-page-password" name="password" type="password" clearButton onInputClear={this.handleChange} onChange={this.handleChange} required validate></Input>
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
                <Button fill text={this.state.dict.login} onClick={this.loginClick}></Button>
              </Col>
            </Row>
          </Block>
          <Block>
            <Row>
              <Col>
                <Link href={APP_DIR_PATH + '/password-reset?lang=' + this.state.langId}>{this.state.dict.forgot_password}</Link>
              </Col>
            </Row>
          </Block>
          <Block className="text-align-right">{VERSION}</Block>
          {chinaIcpLink}
        </Page>
      </DocumentTitle>
    );

  }
}

function mapDispatchToProps(dispatch) {
  return {
    sendLogin(value) {
      dispatch(sendLoginUser(value));
    },
  };
}
/*
function mapStateToProps(state) {
  return {
    error: state.error,
  };
}
*/

export default connect(
  null,
  mapDispatchToProps
)(LoginPage);