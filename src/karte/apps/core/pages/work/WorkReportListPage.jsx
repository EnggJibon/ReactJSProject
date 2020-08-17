import React from 'react';
import {
  Page,
  Button,
  Row,
  Col,
  BlockTitle,
  List,
  Label,
  Toolbar,
  Link,
  Input,
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
import CalendarUtil from '../../../../shared/logics/calendar-util';
import moment from 'moment';
import { connect } from 'react-redux';
import Work from 'karte/apps/core/logics/work';
import { /*clearWorkCopyInfo*/ workCopyInfoAdd } from 'karte/apps/core/reducers/work-reducer';

export class WorkReportListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        sp_work_daily_report: '',
        work_phase: '',
        component_code: '',
        mold_name: '',
        machine_name: '',
        time_unit_minute: '',
        work_start: '',
        work_total_time: '',
        mst_error_record_not_found: '',
        delete_record: '',
        working_date: '',
        copy: '',
        yes: '',
        no: '',
        msg_confirm_delete: ''
        //必要な文言をここに足す
      },

      workReportList: [],
      mstErrorRecordNotFound: '',
      workingDate: moment(new Date()).format('YYYY/MM/DD')
    };
    this.workTotalTime = 0;
  }

  componentDidMount() {
    var me = this;
    const app = me.$f7;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });

        me.workingDateCalendar = app.calendar.create(
          CalendarUtil.getCalendarProperties('#work-report-list-page-working-date', {
            change: function (calendar, value) {
              let workingDate = moment(new Date(value)).format('YYYY/MM/DD');
              me.setState({
                workingDate: workingDate
              });
              me.SearchWorkList(workingDate);
            },
          })
        );
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
    //var me = this;
    // 標準業務時間を取得
    //me.$f7.preloader.show();
    //Work.getStandardWorkTime()
    // .then((response) => {
    //   if (response.mstStandardWorkTime.length > 0) {
    this.SearchWorkList();
    // } else {
    //   me.setState({
    //     workReportList: [],
    //     mstErrorRecordNotFound: me.state.dict.mst_error_record_not_found
    //   });
    // }
    // me.$f7.preloader.hide();
    // })
    // .catch((err) => {
    //   me.$f7.preloader.hide();
    //   var error = err;
    //   me.setState(() => { throw new UnexpectedError(error); });
    // });
  }

  /**
   * 作業開始情報を取得
   */
  SearchWorkList(workingDate) {
    this.workTotalTime = 0;
    var me = this;
    me.$f7.preloader.show();
    Work.searchWorkInfo({
      workingDate: workingDate ? workingDate : this.state.workingDate
    })
      .then((response) => {

        if (response.tblWorks.length > 0) {
          me.setState({
            workReportList: response.tblWorks,
            mstErrorRecordNotFound: ''
          });
        } else {
          me.setState({
            workReportList: [],
            mstErrorRecordNotFound: me.state.dict.mst_error_record_not_found,
          });
        }
        me.$f7.preloader.hide();
      })
      .catch((err) => {
        me.$f7.preloader.hide();
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
  }

  makeList(_workReports) {
    let me = this;
    //return _workReports.length;
    var workReportList = [];
    this.workTotalTime = 0;
    for (var i = 0; i < _workReports.length; i++) {
      if (_workReports[i].locked === '1') {
        continue;
      }

      if (_workReports[i].startDatetime && _workReports[i].endDatetime) {
        let workStartTime = moment(new Date(_workReports[i].startDatetime)).format('YYYY/MM/DD HH:mm');
        let workEndTime = moment(new Date(_workReports[i].endDatetime)).format('YYYY/MM/DD HH:mm');
        let workingTimeMinutes = me.calcCostMinutes(workStartTime, workEndTime);
        _workReports[i].workingTimeMinutes = workingTimeMinutes;
      }

      workReportList.push(this.makeListRow(i, _workReports[i]));
    }

    if (workReportList.length > 0) {
      return (
        <List className={'no-padding margin-bottom84 list '}>
          {workReportList}
        </List>
      );
    } else {
      return (
        <List className={'no-padding no-margin'}>
          {workReportList}
        </List>
      );
    }

  }

  calcCostMinutes(startTime, endTime) {
    if (startTime.length > 16) {
      startTime = startTime.substring(0, 16) + ':00';
    }
    if (endTime.length > 16) {
      endTime = endTime.substring(0, 16) + ':00';
    }
    var endTimeStamp = 0;
    endTimeStamp = endTime ? (new Date(endTime)).getTime() : (new Date()).getTime();
    var minutes = Math.floor((endTimeStamp - (new Date(startTime)).getTime()) / 1000 / 60);
    return minutes;
  }

  /**
   * 削除
   */
  delete(workId) {
    let me = this;
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
                me.SearchWorkList();
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

  /**
   * コピー
   */
  copy(workInfo) {
    var { workCopyInfoAdd } = this.props;
    workCopyInfoAdd(workInfo);
    //    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input?pageName=workDailyReport', { pushState: true });
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input?pageName=workDailyReport');
  }

  makeListRow(index, item) {
    item.startDatetimeStr = item.startDatetimeStr ? moment(new Date(item.startDatetimeStr)).format('MM/DD HH:mm') : '';
    item.endDatetimeStr = item.endDatetimeStr ? moment(new Date(item.endDatetimeStr)).format('MM/DD HH:mm') : '';
    item.machineName = item.mstMachine ? item.mstMachine.machineName : '';
    this.workTotalTime = item.workingTimeMinutes ? this.workTotalTime + item.workingTimeMinutes : this.workTotalTime + 0;
    var card = (
      <ListItem key={index} link={APP_DIR_PATH + '/work-end-input?pageName=workDailyReport&id=' + item['id']} swipeout>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{item.startDatetimeStr + '-' + item.endDatetimeStr}</ListItemCell>
            {item.endDatetime ?
              <ListItemCell style={{ textAlign: 'right' }}>
                {item.workingTimeMinutes + this.state.dict.time_unit_minute}
              </ListItemCell>
              :
              <ListItemCell style={{ textAlign: 'right' }}>
                {this.state.dict.time_unit_minute}
              </ListItemCell>
            }
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
            <ListItemCell>{item.machineName}</ListItemCell>
          </ListItemRow>
        </div>
        <SwipeoutActions right>
          <SwipeoutButton onClick={this.copy.bind(this, item)}>{this.state.dict.copy}</SwipeoutButton>
          <SwipeoutButton close onClick={this.delete.bind(this, item['id'])}>{this.state.dict.delete_record}</SwipeoutButton>
        </SwipeoutActions>
      </ListItem>
    );
    return card;
  }

  touchChangeTime(arg) {
    let workingDate = '';
    if (arg === 'next') {
      workingDate = moment(this.state.workingDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY/MM/DD');
      this.setState({
        workingDate: workingDate
      });
    } else {
      workingDate = moment(this.state.workingDate, 'YYYY/MM/DD').subtract(1, 'days').format('YYYY/MM/DD');
      this.setState({
        workingDate: workingDate
      });
    }

    this.SearchWorkList(workingDate);
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleClear(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  buttonWorkStart() {
    //作業開始画面へ遷移する。
    //this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input?pageName=workDailyReport&workingDate=' + this.state.workingDate, { pushState: true });
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input?pageName=workDailyReport&workingDate=' + this.state.workingDate);
  }

  render() {
    const { workReportList } = this.state;
    return (

      <DocumentTitle title={this.state.dict.sp_work_daily_report}>
        <Page
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          infinite
          infinitePreloader={false}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_work_daily_report}</BlockTitle>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <Block>
              <Row>
                <Col width="30">
                  <Label style={{ textAlign: 'right' }}>{this.state.dict.working_date} </Label>
                </Col>
              </Row>
              <Row>
                <Col width="20">
                  <Button fill small
                    onClick={this.touchChangeTime.bind(this, 'previous')}>{'<'}</Button>
                </Col>
                <Col>
                  <Input inputStyle={{ textAlign: 'center' }}
                    type="text"
                    name="workingDate"
                    value={this.state.workingDate}
                    readonly
                    inputId="work-report-list-page-working-date" />
                </Col>
                <Col width="20">
                  <Button fill small
                    onClick={this.touchChangeTime.bind(this, 'next')}>{'>'}</Button>
                </Col>
              </Row>
            </Block>
          </List>

          {this.makeList(workReportList)}
          <Block className="smallMargin">
            <p>{this.state.mstErrorRecordNotFound}</p>
          </Block>

          <List className='toolbar-bottom-list' style={{ background: '#fff' }}>
            <ListItem >
              <Col width='40'>{this.state.dict.work_total_time}</Col>
              <Col style={{ textAlign: 'right' }}>{this.workTotalTime + this.state.dict.time_unit_minute}</Col>
            </ListItem>
            <ListItem className='my-padding'>
              <Toolbar bottomMd>
                <Link onClick={this.buttonWorkStart.bind(this)}>{this.state.dict.work_start} </Link>
              </Toolbar>
            </ListItem>
          </List>

        </Page>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    workCopyInfo: state.core.work.workCopyInfo
  };
}

function mapDispatchToProps(dispatch) {

  return {
    // clearWorkCopyInfo(value) {
    //   dispatch(clearWorkCopyInfo(value));
    // },

    workCopyInfoAdd(value) {
      dispatch(workCopyInfoAdd(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkReportListPage);