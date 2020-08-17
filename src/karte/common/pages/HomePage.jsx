import React from 'react';
import DocumentTitle from 'react-document-title';
import {
  Page,
  BlockTitle,
  List,
  ListItem
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import MenuController from 'karte/shared/logics/menu-controller';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import {UnexpectedError} from 'karte/shared/logics/errors';
import AppNavbar from 'karte/shared/components/AppNavbar';

//export default () => (
//export default function Homepage() {
export default class Homepage extends React.Component {
//class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        main_menu: ''
      },
      menus: []
    };
  }

  componentDidMount() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function(values) {
        me.setState({dict: values});
      })
      .catch(function(err) {
        var error = err;
        if (err.errorCode === 'E103') {
          me.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {reloadAll: true});
        }
        else {
          me.setState(() => { throw new UnexpectedError(error); });
        }
      });
    MenuController.getAvailableMenuList()
      .then(function(values) {
        me.setState({menus: values});
      })
      .catch(function(err) {
        var error = err;
        if (err.errorCode === 'E103') {
          me.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {reloadAll: true});
        }
        else {
          me.setState(() => { throw new UnexpectedError(error); });
        }
      });
  }

  render() {
    var menuList = [];
    for (var i = 0; i < this.state.menus.length; i++) {
      menuList.push(<ListItem key={i} link={APP_DIR_PATH + this.state.menus[i].urlPath} title={this.state.menus[i].dictionaryValue}></ListItem>);
    }
    return (
      <DocumentTitle title={this.state.dict.main_menu}>
        <Page>
          <AppNavbar applicationTitle={this.state.dict.application_title}></AppNavbar>
          <BlockTitle>{this.state.dict.main_menu}</BlockTitle>
          <List>
            {menuList}
          </List>
        </Page>
      </DocumentTitle>
    );
  }
}

/*
function mapStateToProps(state) {
  return {
    error: state.error,
  };
}

export default connect(
  mapStateToProps
)(HomePage);

*/