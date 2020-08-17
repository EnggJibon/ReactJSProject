import React from 'react';
import {
  Page,
  Block,
  List,
  ListItem,
} from 'framework7-react';
import Authentication from 'karte/shared/logics/authentication';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import MenuController from 'karte/shared/logics/menu-controller';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import { connect } from 'react-redux';
import {VERSION} from 'karte/shared/logics/version';

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.logoffClick = this.logoffClick.bind(this);
    this.loadMenu = this.loadMenu.bind(this);
    this.state = {
      dict: {
        application_title: '',
        logoff: '',
        return: '',
        main_menu: ''
      },
      userName:'',
      menus: [],
      menuLoaded: false
    };
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    // Tokenが変わっていたらメニューを読み込む
    if (this.props.loginUser.token !== prevProps.loginUser.token && Authentication.isLoggedIn) {
      this.loadMenu();
    }
  }


  loadMenu() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function(values) {
        me.setState({dict: values});
        MenuController.getAvailableMenuList()
          .then(function(values) {
            me.setState({menus: values});
          });
        //.catch(function(err) {
        //});
      });
    //.catch(function(err) {
    //});
    this.checkUsername();
  }

  componentDidMount() {
    if (Authentication.isLoggedIn) {
      this.loadMenu();
    }
  }

  checkUsername(){
    Authentication.whoAmI()
      .then((responseWho) => {
        this.setState({userName: responseWho.userName});
      }
      );
  }

  logoffClick() {
    //var me = this;
    Authentication.logOff()
      .then(() => {
        //me.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {reloadAll: true});
        //Redux Stateをすべてクリアするため、ブラウザをリフレッシュする。
        window.location.href = APP_DIR_PATH + '/login';
      })
      .catch(() => {
        //me.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {reloadAll: true});
        //Redux Stateをすべてクリアするため、ブラウザをリフレッシュする。
        window.location.href = APP_DIR_PATH + '/login';
      });
  }

  render() {
    var menuList = [];
    for (var i = 0; i < this.state.menus.length; i++) {
      menuList.push(
        <ListItem key={i} link={APP_DIR_PATH + this.state.menus[i].urlPath} view="#main-view" panelClose
          title={this.state.menus[i].dictionaryValue}></ListItem>);
    }
    menuList.push(<ListItem key="99999" link="#" view="#main-view" panelClose onClick={this.logoffClick} 
      title={this.state.dict.logoff}></ListItem>);

    return (
      <Page>
        <Block>{this.state.dict.main_menu}</Block>
        <List>
          {menuList}
        </List>
        <Block className="text-align-right">{this.state.userName}</Block>
        <Block className="text-align-right">{VERSION}</Block>
      </Page>
    );
  }

}

function mapStateToProps(state) {
  return {
    loginUser: state.common.loginUser,
  };
}

export default connect(
  mapStateToProps
)(Header);
