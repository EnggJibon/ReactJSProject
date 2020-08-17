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
import Work from 'karte/apps/core/logics/work';

export default class WorkSubMenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        sp_work: '',
        work_start: '',
        work_end: '',
        close: '',
        cancel: '',
        yes: '',
        no: '',
        ok: '',
        sp_work_daily_report: '',
        msg_warning_uncompleted_work: ''
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
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/', { pushState: true });
  }

  check() {
    var me = this;
    Work.getWorkList({
      notFinished: true
    })
      .then((response) => {
        if (response.tblWorks.length > 0) {
          me.$f7.dialog.create({
            title: me.state.dict.application_title,
            text: me.state.dict.msg_warning_uncompleted_work,
            buttons: [{
              text: this.state.dict.yes,
              onClick: function () {
                me.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-end-list', { pushState: true });
              }
            }, {
              text: this.state.dict.no,
              onClick: function (dialog) {
                dialog.close();
                me.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input', { pushState: true });
              }
            }]
          }).open();
        } else {
          me.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input', { pushState: true });
        }
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_work}>
        <Page>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_work}</BlockTitle>
          <List>
            <ListItem key={1} link={'#'} onClick={this.check.bind(this)} title={this.state.dict.work_start}></ListItem>
            <ListItem key={2} link={APP_DIR_PATH + '/work-end-list'} title={this.state.dict.work_end}></ListItem>
            <ListItem key={3} link={APP_DIR_PATH + '/work-daily-report-list'} title={this.state.dict.sp_work_daily_report}></ListItem>
          </List>
        </Page>
      </DocumentTitle>
    );
  }

}