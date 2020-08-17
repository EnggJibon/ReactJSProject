import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';

export default class IssueSubMenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        sp_issue_report: '',
        issue_input: '',
        issue_list: '',
        //必要な文言をここに足す
      },
      menus: []
    };
  }

  componentDidMount() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  onBackClick() {
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/', {pushState: true});
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_issue_report}>
        <Page>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_issue_report}</BlockTitle>
          <List>
            <ListItem key={1} link={APP_DIR_PATH + '/issue-register'} title={this.state.dict.issue_input}></ListItem>
            <ListItem key={2} link={APP_DIR_PATH + '/issue-list'} title={this.state.dict.issue_list}></ListItem>
          </List>
        </Page>
      </DocumentTitle>
    );
  }

}