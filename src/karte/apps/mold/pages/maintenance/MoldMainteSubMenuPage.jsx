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

export default class MoldMainteSubMenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        sp_mold_maintenance: '',
        sp_mold_maintenance_start: '',
        sp_mold_maintenance_end: '',
        sp_regular_maintenance_proposal_list: '',
      },
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
      <DocumentTitle title={this.state.dict.sp_mold_maintenance}>
        <Page>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_mold_maintenance}</BlockTitle>
          <List>
            <ListItem key={1} link={APP_DIR_PATH + '/mold-mainte-start'} title={this.state.dict.sp_mold_maintenance_start}></ListItem>
            <ListItem key={2} link={APP_DIR_PATH + '/mold-mainte-recommend'} title={this.state.dict.sp_regular_maintenance_proposal_list}></ListItem>
            <ListItem key={3} link={APP_DIR_PATH + '/mold-mainte-end'} title={this.state.dict.sp_mold_maintenance_end}></ListItem>
          </List>
        </Page>
      </DocumentTitle>
    );
  }

}