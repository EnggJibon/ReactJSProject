import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  SwipeoutActions,
  SwipeoutButton,
  ListItemRow,
  Block,
  ListItemCell
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import moment from 'moment';
import Work from 'karte/apps/core/logics/work';

export default class WorkEndListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        work_end: '',
        work_phase: '',
        component_code: '',
        mold_name: '',
        machine_name: '',
        mst_error_record_not_found: '',
        delete_record: '',
        yes: '',
        no: '',
        msg_confirm_delete: '',
        msg_error_locked: '',
        //必要な文言をここに足す
      },
      workList: [],
      mstErrorRecordNotFound: ''
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

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    me.$f7.preloader.show();
    Work.getWorkList({
      notFinished: true
    })
      .then((response) => {
        if (response.tblWorks.length > 0) {
          me.setState({
            workList: response.tblWorks,
            mstErrorRecordNotFound: ''
          });
        } else {
          me.setState({
            workList: response.tblWorks,
            mstErrorRecordNotFound: me.state.dict.mst_error_record_not_found,
          });
        }

        me.$f7.preloader.hide();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
  }

  onBackClick() {
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-sub-menu', { pushState: true });
    //this.$f7router.back();
  }

  makeList(_works) {
    //return _works.length;
    var workList = [];
    for (var i = 0; i < _works.length; i++) {
      if (_works[i].locked === '1') {
        continue;
      }
      workList.push(this.makeListRow(i, _works[i]));
    }
    return (
      <List className={'no-margin no-padding normalFont'}>
        {workList}
      </List>
    );
  }

  /**
   * 削除
   */
  delete(workId) {
    let me = this;
    Work.getWork(workId)
      .then((response) => {
        if (response.tblWorks[0].locked === 1) {
          me.$f7.dialog.alert(me.state.dict.msg_error_locked);
          return;
        } else {
          me.$f7.dialog.create({
            title: me.state.dict.application_title,
            text: me.state.dict.msg_confirm_delete,
            buttons: [{
              text: this.state.dict.yes,
              onClick: function () {
                Work.deleteWorkById(workId)
                  .then((response) => {
                    if (response.error) {
                      me.$f7.dialog.alert(response.errorMessage);
                    } else {
                      me.onPageInit();
                    }
                  }).catch((err) => {
                    var error = err;
                    me.setState(() => { throw new UnexpectedError(error); });
                  });
              }
            }, {
              text: this.state.dict.no,
              onClick: function (dialog) {
                dialog.close();
              }
            }]
          }).open();
        }

      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  makeListRow(index, item) {
    let startDatetime = item.startDatetimeStr ? moment(new Date(item.startDatetimeStr)).format('YYYY/MM/DD HH:mm') : '';
    let machineName = item.mstMachine ? item.mstMachine.machineName : '';
    var card = (
      <ListItem key={index} link={APP_DIR_PATH + '/work-end-input?pageName=workEndList&id=' + item['id']} swipeout>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{startDatetime}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.work_phase}</ListItemCell>
            <ListItemCell>{item.workPhaseName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.component_code}</ListItemCell>
            <ListItemCell>{item.componentCode}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.mold_name}</ListItemCell>
            <ListItemCell>{item.moldName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_name}</ListItemCell>
            <ListItemCell>{machineName}</ListItemCell>
          </ListItemRow>
        </div>
        <SwipeoutActions right>
          <SwipeoutButton close onClick={this.delete.bind(this, item['id'])}>{this.state.dict.delete_record}</SwipeoutButton>
        </SwipeoutActions>
      </ListItem>
    );
    return card;
  }

  render() {
    const { workList } = this.state;
    return (

      <DocumentTitle title={this.state.dict.work_end}>
        <Page
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          infinite
          infinitePreloader={false}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.work_end}</BlockTitle>
          {this.makeList(workList)}
          <Block className="smallMargin">
            <p>{this.state.mstErrorRecordNotFound}</p>
          </Block>
        </Page>
      </DocumentTitle>
    );
  }

}