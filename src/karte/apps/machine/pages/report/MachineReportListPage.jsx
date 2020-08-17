import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  Button,
  Block,
  Row,
  Col,
  SwipeoutActions,
  SwipeoutButton,
  ListItemRow,
  ListItemCell,
  Link,
  Toolbar,
  Popover
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import { connect } from 'react-redux';
import { updateMachineReportInfo, clearMachineReport } from 'karte/apps/machine/reducers/machine-report-reducer';
import { /*clearWorkCopyInfo*/ workCopyInfoAdd } from 'karte/apps/core/reducers/work-reducer';
import moment from 'moment';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import Work from 'karte/apps/core/logics/work';
import Report from 'karte/apps/machine/logics/report';
import Authentication from 'karte/shared/logics/authentication';
import System from 'karte/shared/master/system';

export class MachineReportListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        machine_name: '',
        machine_daily_report_reference: '',
        machine_report_date: '',
        operating_flg: '',
        machine_report_work: '',
        component_code: '',
        mold_name: '',
        time_unit_minute: '',
        work_user_name: '',
        producing_time_minutes: '',
        close: '',
        mst_error_record_not_found: '',
        work_total_time: '',
        save: '',
        work_start: '',
        production_start: '',
        machine_report_add_downtime: '',
        time_change: '',
        operating_flg_off: '',
        operating_flg_on: '',
        delete_record: '',
        copy: '',
        msg_confirm_save_modification: '',
        msg_error_locked: '',
        msg_confirm_delete: '',
        msg_record_updated: '',
        yes: '',
        no: '',
        msg_error_end: '',
        machine_report_error_total_time: '',
        machine_report_warning_total_time: ''
        //必要な文言をここに足す
      },

      reportDate: '',
      department: '',
      machineDailyReports: [],
      mstErrorRecordNotFound: '',
      machineUuid: '',
      isChanged: '0',
      isDelete: '0',
      reportPersonUuid: '',
      isAdded: '1',
      businessStartTime: '',
    };

    this.workTotalTime = 0;
    this.totalTimeMinute = 0;
    this.totalDowntimeMinutes = 0;
    this.totalOperatingMinutes = 0;

  }

  /**
   * 
   */
  componentDidMount() {

    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.reportDateCalendarCreate();

        // 業務開始時刻を取得
        System.load(['system.business_start_time'])
          .then((values) => {
            me.setState({
              configValue: values.cnfSystems[0].configValue,
            });
          });
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => {
          throw new UnexpectedError(error);
        });
      });
    Authentication.whoAmI()
      .then(function (value) {
        me.setState({ reportPersonUuid: value.userUuid });
      }).catch(function (err) {
        var error = err;
        me.setState(() => {
          throw new UnexpectedError(error);
        });
      });
  }

  /**
   * componentWillReceiveProps
   * @param {*} newProps 
   */
  UNSAFE_componentWillReceiveProps(newProps) {
    if ('1' === newProps.reportInfo.isChanged) {
      this.setState({
        isChanged: '1',
        added: newProps.reportInfo.added,
        reportDate: newProps.reportInfo.reportDate,
        department: newProps.reportInfo.department,
        machineDailyReports: newProps.reportInfo
      });
    } else {
      this.setState({
        reportDate: newProps.reportInfo.reportDate,
        department: newProps.reportInfo.department,
        machineDailyReports: newProps.reportInfo
      });
    }
  }

  /**
   * 
   * @param {*} reportDate 
   */
  getSearchTime(reportDate) {
    if (reportDate === undefined || reportDate === '') {
      return;
    }

    let me = this;
    this.workTotalTime = 0;
    let { machineUuid, department } = me.$f7route.query;
    me.$f7.preloader.show();
    Promise.all([Report.getSearchTime({
      machineUuid: machineUuid,
      reportDate: reportDate,
      department: department !== 'undefined' ? department : ''
    }), Report.getSearchTimeCollect({
      machineUuid: machineUuid,
      reportDate: reportDate
    })]).then(res => {

      let dailyreport2 = [];
      let collect = [];

      if (res[0].machineDailyReports.length > 0) {
        dailyreport2.push(res[0].machineDailyReports[0]);
        this.setState({
          isAdded: '0'
        });
        for (let key in dailyreport2[0].machineDailyReportDetails) {
          let value = dailyreport2[0].machineDailyReportDetails[key];
          if (value.detailType === 1) {
            dailyreport2[0].machineDailyReportDetails[key].workEndFlg = 1;
          }
          dailyreport2[0].machineDailyReportDetails[key]['apiFlg'] = value['id'] ? 1 : 0;
        }
      }
      if (res[1]) {
        let collectData = res[1];
        let currentBusinessDateTime = moment().format('YYYY/MM/DD');
        let endDatetimeStr = (moment().add(1, 'days').format('YYYY/MM/DD')) + ' ' + this.state.configValue;
        endDatetimeStr = (moment(endDatetimeStr).format('YYYY/MM/DD HH:mm:ss'));
        let endDatetime = moment(new Date(endDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss');

        for (let key in collectData.machineDailyReportDetails) {
          let value = collectData.machineDailyReportDetails[key];
          collectData.machineDailyReportDetails[key].added = true;
          if (value.endDatetimeStr !== '') {
            endDatetimeStr = value.endDatetimeStr;
            endDatetime = value.endDatetime;
          }
          if (new Date(reportDate).getTime() < new Date(currentBusinessDateTime).getTime()) {
            collectData.machineDailyReportDetails[key]['endDatetime'] = endDatetime;
            collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
          } else if (new Date(reportDate).getTime() === new Date(currentBusinessDateTime).getTime()) {
            if (value.productionEndFlg !== 1 && value.detailType === 2) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            } else if (value.workEndFlg !== 1 && value.detailType === 1) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            } else if (value.workEndFlg !== 0 && value.detailType === 1) {
              collectData.machineDailyReportDetails[key].endDatetime = endDatetime;
              collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
              collectData.machineDailyReportDetails[key].added = true;
              collectData.machineDailyReportDetails[key].modified = true;
            } else {
              collectData.machineDailyReportDetails[key].endDatetime = endDatetime;
              collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            }
          } else {
            if (value.productionEndFlg !== 1 && value.detailType === 2) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            } else if (value.workEndFlg !== 1 && value.detailType === 1) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
            } else {
              collectData.machineDailyReportDetails[key].endDatetime = endDatetime;
              collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
            }
          }
        }
        collect.push(collectData);
      }

      let item = {};
      if (dailyreport2[0] && collect[0]) {
        let machineDailyReportDetails = dailyreport2[0].machineDailyReportDetails.concat(collect[0].machineDailyReportDetails);
        item = Object.assign(dailyreport2[0], collect[0]);
        item.machineDailyReportDetails = machineDailyReportDetails;
      } else if (collect[0]) {
        item = collect[0];
      } else if (dailyreport2[0]) {
        item = dailyreport2[0];
      }
      item.reportDate = reportDate;
      item.department = department;
      item.machineName = this.state.machineName;
      item.machineId = this.state.machineId;

      me.setState({
        machineDailyReports: item,
        department: department
      });
      if (item.machineDailyReportDetails.length === 0) {
        me.setState({
          mstErrorRecordNotFound: me.state.dict.mst_error_record_not_found,
        });
      } else {
        me.setState({
          mstErrorRecordNotFound: ''
        });
      }

      me.$f7.preloader.hide();

    }).catch((err) => {
      let error = err;
      me.setState(() => {
        throw new UnexpectedError(error);
      });
    });
  }

  /**
   * 
   */
  reportDateCalendarCreate() {
    var me = this;
    const app = me.$f7;
    me.reportDateCalendar = app.calendar.create(
      CalendarUtil.getCalendarProperties('#machine-list-page-register-date', {
        change: function (calendar, value) {
          if (me.state.isChanged === '1') {
            me.$f7.dialog.create({
              title: me.state.dict.application_title,
              text: me.state.dict.msg_confirm_save_modification,
              buttons: [{
                text: me.state.dict.yes,
                onClick: function () {
                  let newDate = moment(new Date(value)).format('YYYY/MM/DD');
                  if (me.state.reportDate !== newDate) {
                    me.getSearchTime(newDate);
                    me.setState({
                      reportDate: newDate,
                      isChanged: '0'
                    });
                  }
                }
              }, {
                text: me.state.dict.no,
                onClick: function (dialog) {
                  me.setState({
                    reportDate: me.state.reportDate
                  });
                  dialog.close();
                }
              }]
            }).open();
          } else {
            let newDate = moment(new Date(value)).format('YYYY/MM/DD');
            if (me.state.reportDate !== newDate) {
              me.getSearchTime(newDate);
              me.setState({
                reportDate: newDate
              });
            }
          }
        },
      })
    );
  }

  /**
   * 
   */
  onPageInit() {
    let me = this;
    let { machineUuid, machineId, reportDate, machineName, reload, department, isChanged } = me.props.reportInfo;
    if (reload) {
      me.$f7route.query = { machineId: machineId, machineUuid: machineUuid, reportDate: reportDate, machineName: machineName, department: department };
      me.UNSAFE_componentWillReceiveProps(me.props);
      if (reload === '3') {
        me.updateData(reportDate, me.props);
        me.setState({
          isChanged: isChanged
        });
      } else {
        me.setState({
          isChanged: reload === '1' ? '1' : '0'
        });
      }

      me.setState({
        machineId,
        machineUuid,
        reportDate,
        machineName,
        department
      });
      me.props.reportInfo.reload = undefined;
    } else {
      let { machineUuid, reportDate, machineName, machineId, department } = me.$f7route.query;
      me.setState({
        machineId,
        machineUuid,
        reportDate,
        department,
        machineName
      });
      me.getSearchTime(reportDate);
    }
  }

  updateData(reportDate, props) {
    if (reportDate === undefined || reportDate === '') {
      return;
    }

    let me = this;
    this.workTotalTime = 0;
    let { machineUuid, department } = me.$f7route.query;
    Promise.all([Report.getSearchTime({
      machineUuid: machineUuid,
      reportDate: reportDate,
      department: department !== 'undefined' ? department : ''
    }), Report.getSearchTimeCollect({
      machineUuid: machineUuid,
      reportDate: reportDate
    })]).then(res => {

      let dailyreport2 = [];
      let collect = [];

      if (res[0].machineDailyReports.length > 0) {
        dailyreport2.push(res[0].machineDailyReports[0]);
        this.setState({
          isAdded: '0'
        });
        for (let key in dailyreport2[0].machineDailyReportDetails) {
          let value = dailyreport2[0].machineDailyReportDetails[key];
          if (value.detailType === 1) {
            dailyreport2[0].machineDailyReportDetails[key].workEndFlg = 1;
          }
          
          dailyreport2[0].machineDailyReportDetails[key]['apiFlg'] = value['id'] ? 1 : 0;
        }
      }

      if (res[1]) {
        let collectData = res[1];
        let currentBusinessDateTime = moment().format('YYYY/MM/DD');
        let endDatetimeStr = (moment().add(1, 'days').format('YYYY/MM/DD')) + ' ' + this.state.configValue;
        endDatetimeStr = (moment(endDatetimeStr).format('YYYY/MM/DD HH:mm:ss'));
        let endDatetime = moment(new Date(endDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss');

        for (let key in collectData.machineDailyReportDetails) {
          let value = collectData.machineDailyReportDetails[key];
          collectData.machineDailyReportDetails[key].added = true;
          if (value.endDatetimeStr !== '') {
            endDatetimeStr = value.endDatetimeStr;
            endDatetime = value.endDatetime;
          }
          if (new Date(reportDate).getTime() < new Date(currentBusinessDateTime).getTime()) {
            collectData.machineDailyReportDetails[key]['endDatetime'] = endDatetime;
            collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
          } else if (new Date(reportDate).getTime() === new Date(currentBusinessDateTime).getTime()) {
            if (value.productionEndFlg !== 1 && value.detailType === 2) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            } else if (value.workEndFlg !== 1 && value.detailType === 1) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            } else if (value.workEndFlg !== 0 && value.detailType === 1) {
              collectData.machineDailyReportDetails[key].endDatetime = endDatetime;
              collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
              collectData.machineDailyReportDetails[key].added = true;
              collectData.machineDailyReportDetails[key].modified = true;
            } else {
              collectData.machineDailyReportDetails[key].endDatetime = endDatetime;
              collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            }
          } else {
            if (value.productionEndFlg !== 1 && value.detailType === 2) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
              collectData.machineDailyReportDetails[key].added = false;
              collectData.machineDailyReportDetails[key].modified = false;
            } else if (value.workEndFlg !== 1 && value.detailType === 1) {
              collectData.machineDailyReportDetails[key].endDatetime = null;
              collectData.machineDailyReportDetails[key].endDatetimeStr = '';
              collectData.machineDailyReportDetails[key].durationMinitues = 0;
              collectData.machineDailyReportDetails[key].durationTime = '0';
            } else {
              collectData.machineDailyReportDetails[key].endDatetime = endDatetime;
              collectData.machineDailyReportDetails[key].endDatetimeStr = endDatetimeStr;
            }
          }
        }
        collect.push(collectData);
      }

      let item = {};
      if (dailyreport2[0] && collect[0]) {
        let machineDailyReportDetails = dailyreport2[0].machineDailyReportDetails.concat(collect[0].machineDailyReportDetails);
        item = Object.assign(dailyreport2[0], collect[0]);
        item.machineDailyReportDetails = machineDailyReportDetails;
      } else if (collect[0]) {
        item = collect[0];
      } else if (dailyreport2[0]) {
        item = dailyreport2[0];
      }

      item.reportDate = reportDate;
      item.department = department;
      item.machineName = this.state.machineName;
      item.machineId = this.state.machineId;
      let machineDailyReportDetails = props.reportInfo.machineDailyReportDetails;
      for (let key in machineDailyReportDetails) {
        let value = machineDailyReportDetails[key];
        if (value['detailType'] === 3 && value['added'] === true) {
          item.machineDailyReportDetails.push(value);
          continue;
        }

        if (value['modified'] === true || value['added'] === true) {
          for (let index in item.machineDailyReportDetails) {
            let itemVal = item.machineDailyReportDetails[index];
            if (itemVal['detailType'] === 1 && itemVal['workId'] === value['workId']) {
              item.machineDailyReportDetails[index] = value;
              break;
            }
            if (itemVal['detailType'] === 2 && itemVal['productionId'] === value['productionId']) {
              item.machineDailyReportDetails[index] = value;
              break;
            }
            if (itemVal['detailType'] === 3 && itemVal['id'] === value['id']) {
              item.machineDailyReportDetails[index] = value;
              break;
            }
          }
        }
      }

      me.setState({
        machineDailyReports: item,
        department: department
      });
      if (item.machineDailyReportDetails.length === 0) {
        me.setState({
          mstErrorRecordNotFound: me.state.dict.mst_error_record_not_found,
        });
      } else {
        me.setState({
          mstErrorRecordNotFound: ''
        });
      }
    }).catch((err) => {
      let error = err;
      me.setState(() => {
        throw new UnexpectedError(error);
      });
    });
  }

  /**
   * 
   */
  onPageBeforeRemove() {
  }

  /**
   * 
   */
  onPageBeforeOut() {
  }

  /**
   * 
   */
  onBackClick() {
    let me = this;
    let department = me.state.department;
    if (department === '') {
      department = me.props.reportInfo.department;
    }
    if (department === undefined) {
      department = '';
    }
    if (this.state.isChanged === '1') {
      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: me.state.dict.msg_confirm_save_modification,
        buttons: [{
          text: this.state.dict.yes,
          onClick: function () {
            me.$f7.views.main.router.navigate(APP_DIR_PATH + '/report?reportDate=' + me.state.reportDate + '&department=' + department, { reloadAll: true });
          }
        }, {
          text: this.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();
    } else {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/report?reportDate=' + me.state.reportDate + '&department=' + department, { reloadAll: true });
    }
  }

  /**
   * 
   */
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  /**
   * 
   * @param {*} arg 
   */
  touchChangeTime(arg) {
    let me = this;
    if (this.state.isChanged === '1') {
      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: me.state.dict.msg_confirm_save_modification,
        buttons: [{
          text: this.state.dict.yes,
          onClick: function () {

            let reportDate;
            if (arg === 'next') {
              reportDate = moment(me.state.reportDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY/MM/DD');
            } else {
              reportDate = moment(me.state.reportDate, 'YYYY/MM/DD').subtract(1, 'days').format('YYYY/MM/DD');
            }
            me.setState({
              reportDate: reportDate,
              isChanged: '0'
            });
            me.getSearchTime(reportDate);
          }
        }, {
          text: this.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();
    } else {
      let reportDate;
      if (arg === 'next') {
        reportDate = moment(me.state.reportDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY/MM/DD');
      } else {
        reportDate = moment(me.state.reportDate, 'YYYY/MM/DD').subtract(1, 'days').format('YYYY/MM/DD');
      }
      me.setState({
        reportDate: reportDate
      });
      me.getSearchTime(reportDate);
    }

  }

  /**
   * 
   */
  render() {

    let machineDailyReportDetails = this.state.machineDailyReports.machineDailyReportDetails ? this.state.machineDailyReports.machineDailyReportDetails : [];
    let reportDate = moment(new Date(this.state.reportDate)).format('YYYY/MM/DD');
    return (
      <DocumentTitle title={this.state.dict.machine_daily_report_reference}>
        <Page
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          infinite
          infinitePreloader={false}
          onPageBeforeOut={this.onPageBeforeOut.bind(this)}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true}
            backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.machine_daily_report_reference}</BlockTitle>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <Block>
              <Row>
                <Col>{this.state.dict.machine_name}</Col>
                <Col>{decodeURIComponent(this.state.machineName)}</Col>
              </Row>
              <br />
              <Row>
                <Col width="30">
                  <Label style={{ textAlign: 'right' }}>{this.state.dict.machine_report_date} </Label>
                </Col>
              </Row>
              <Row>
                <Col width="20">
                  <Button fill small color="blue" onClick={this.touchChangeTime.bind(this, 'previous')}>{'<'}</Button>
                </Col>
                <Col>
                  <Input inputStyle={{ textAlign: 'center' }}
                    type="text"
                    name="registerDate"
                    value={reportDate} readonly
                    inputId="machine-list-page-register-date" />
                </Col>
                <Col width="20">
                  <Button fill small color="blue" onClick={this.touchChangeTime.bind(this, 'next')} >{'>'}</Button>
                </Col>
              </Row>

            </Block>
          </List>
          {this.makeList(machineDailyReportDetails)}

          <Block className="smallMargin">
            <p>{this.state.mstErrorRecordNotFound}</p>
          </Block>
          <List className='toolbar-bottom-list normalFont backgroundWhite'>
            <ListItem >
              <div slot="inner" className="no-margin no-padding noFlexShrink">
                <ListItemRow>
                  <ListItemCell>{this.state.dict.producing_time_minutes}</ListItemCell>
                  <ListItemCell style={{ textAlign: 'right' }}>{this.totalOperatingMinutes + this.state.dict.time_unit_minute}</ListItemCell>
                  <ListItemCell></ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell>{this.state.dict.machine_report_add_downtime}</ListItemCell>
                  <ListItemCell style={{ textAlign: 'right' }}>{this.totalDowntimeMinutes + this.state.dict.time_unit_minute}</ListItemCell>
                  <ListItemCell></ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell>{this.state.dict.work_total_time}</ListItemCell>
                  <ListItemCell style={{ textAlign: 'right' }}>{this.totalTimeMinute + this.state.dict.time_unit_minute}</ListItemCell>
                  <ListItemCell style={{ textAlign: 'right' }}>{(this.totalTimeMinute - 1440) + this.state.dict.time_unit_minute}</ListItemCell>
                </ListItemRow>
              </div>
            </ListItem>
            <ListItem className='my-padding'>
              <Toolbar bottomMd>
                <Link onClick={this.save.bind(this)}>{this.state.dict.save}</Link>
                <Link popoverOpen=".popover-menu"><i className="f7-icons">more</i></Link>
              </Toolbar>
            </ListItem>
          </List>
          <Popover className="popover-menu">
            <List>
              <ListItem link='#' onClick={this.menuButton.bind(this, 1)} className='popover-close' title={this.state.dict.work_start} />
              <ListItem link='#' onClick={this.menuButton.bind(this, 2)} className='popover-close' title={this.state.dict.production_start} />
              <ListItem link='#' onClick={this.menuButton.bind(this, 3)} className='popover-close' title={this.state.dict.machine_report_add_downtime} />
            </List>
          </Popover>
        </Page>
      </DocumentTitle>
    );
  }

  /**
   * Picker作成共通処理
   * @param {*} elementName
   * @param {*} _values
   * @param {*} _displayValues
   * @param {*} onColChange
   */
  createPicker(elementName, _values, _displayValues, onColChange) {
    var me = this;
    const app = me.$f7;
    return app.picker.create({
      inputEl: elementName,
      formatValue: function (values, displayValues) {
        return displayValues[0];
      },
      routableModals: false, //URLを変更しない
      toolbarCloseText: me.state.dict.close,
      cols: [
        {
          textAlign: 'center',
          values: _values,
          displayValues: _displayValues,
          onChange: onColChange,
        }
      ],
    });
  }

  /**
   *停止時間登録画面へ遷移する。
   */
  menuButton(type) {
    if (type === 1) {
      this.props.updateMachineReportInfo(this.state.machineDailyReports);
      this.$f7router.navigate(APP_DIR_PATH + '/work-start-input?pageName=reportDetail&machineUuid='
        + this.state.machineUuid + '&workingDate='
        + this.state.reportDate + '&machineName='
        + encodeURIComponent(this.state.machineName) + '&machineId='
        + encodeURIComponent(this.$f7route.query.machineId) + '&department=' + this.state.department);
    }
    if (type === 2) {
      this.props.updateMachineReportInfo(this.state.machineDailyReports);
      this.$f7router.navigate(APP_DIR_PATH + '/production-start?pageName=reportDetail&machineUuid='
        + this.state.machineUuid + '&productionDate='
        + this.state.reportDate + '&machineName='
        + encodeURIComponent(this.state.machineName) + '&machineId='
        + encodeURIComponent(this.$f7route.query.machineId) + '&department=' + this.state.department);
    }
    if (type === 3) {
      let editIndex = this.state.machineDailyReports.machineDailyReportDetails.length;
      this.props.updateMachineReportInfo(this.state.machineDailyReports);
      // optFlg:1 add,2 edit 3 delete
      this.$f7router.navigate(APP_DIR_PATH + '/report-stop-time-register?optFlg=1&editIndex=' + editIndex);
    }
  }

  /**
   * 
   * @param {*} item 
   * @param {*} index 
   */
  timeChange(item, index) {
    var me = this;

    let workingTimeMinutes = 0;
    if (item.startDatetimeStr && item.endDatetimeStr) {
      let startDatetimeStr = moment(new Date(item.startDatetimeStr)).format('YYYY/MM/DD HH:mm');
      let endDatetimeStr = moment(new Date(item.endDatetimeStr)).format('YYYY/MM/DD HH:mm');
      workingTimeMinutes = me.calcCostMinutes(startDatetimeStr, endDatetimeStr);
    }
    me.createPickerTime(item.durationMinitues, workingTimeMinutes, index);
    me.pickerTime.open();
  }

  sentData() {
    let me = this;
    // 機械日報テーブルへデータを保存する。画面は遷移しない。
    let machineDailyReports = JSON.parse(JSON.stringify(me.state.machineDailyReports));
    machineDailyReports.reportDate = moment(new Date(machineDailyReports.reportDate)).format('YYYY-MM-DDTHH:mm:ss');
    machineDailyReports.reportPersonUuid = me.state.reportPersonUuid;
    machineDailyReports.modified = machineDailyReports['id'] !== undefined ? true : false;
    machineDailyReports.added = machineDailyReports['id'] === undefined ? true : false;
    machineDailyReports.totalDefectCountOther = 0;

    let machineDailyReportDetails = [];
    for (let key in machineDailyReports.machineDailyReportDetails) {
      let value = machineDailyReports.machineDailyReportDetails[key];
      if (value['apiFlg'] === 1) {
        machineDailyReportDetails.push(value);
      } else {
        if (value['added'] === true || value['modified'] === true || value['deleted'] === true) {
          machineDailyReportDetails.push(value);
        }
      }
    }
    if (machineDailyReportDetails.length < 1) {
      return;
    } else {
      machineDailyReports.machineDailyReportDetails = machineDailyReportDetails;
    }

    for (let key in machineDailyReports.machineDailyReportDetails) {
      let value = machineDailyReports.machineDailyReportDetails[key];
      machineDailyReports.machineDailyReportDetails[key].startDatetime = moment(new Date(value.startDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss');
      machineDailyReports.machineDailyReportDetails[key].endDatetime = value.endDatetimeStr !== '' ? moment(new Date(value.endDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss') : '';
      machineDailyReports.machineDailyReportDetails[key].reportDate = moment(new Date(value.reportDate)).format('YYYY-MM-DDTHH:mm:ss');
      if (value['deleted'] && value['added']) {
        machineDailyReports.machineDailyReportDetails[key].deleted = false;
        machineDailyReports.machineDailyReportDetails[key].added = false;
      }
      if (value['detailType'] !== 3 && machineDailyReports.added) {
        machineDailyReports.machineDailyReportDetails[key].added = true;
        machineDailyReports.machineDailyReportDetails[key].modified = false;
      }
    }

    me.$f7.preloader.show();
    Report.updateDailyReport(machineDailyReports)
      .then((response) => {
        me.$f7.preloader.hide();
        if (response.error) {
          me.$f7.dialog.alert(response.errorMessage);
        } else {
          me.$f7.dialog.alert(this.state.dict.msg_record_updated, function () {
            //画面情報を最新化
            let query = {
              machineUuid: machineDailyReports.machineUuid,
              machineId: machineDailyReports.machineId,
              machineName: machineDailyReports.machineName,
              department: machineDailyReports.department,
              reportDate: moment(new Date(machineDailyReports.reportDate)).format('YYYY/MM/DD'),
            };
            let params = Object.keys(query).map(function (key) {
              if (query[key]) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
              } else {
                return '';
              }
            }).join('&');
            me.$f7router.navigate(APP_DIR_PATH + '/report-detail?' + params, { pushState: true, reloadAll: true });
          });

          this.setState({
            isChanged: '0'
          });
        }
      })
      .catch((err) => {
        me.$f7.preloader.hide();
        if (err.error) {
          me.$f7.dialog.alert(err.errorMessage);
        } else {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        }

      });
  }
  /**
   * 
   * @param {*} item 
   */
  save() {
    var me = this;
    if (me.totalTimeMinute > 1440) {
      me.$f7.dialog.alert(this.state.dict.machine_report_error_total_time);
      return false;
    } else if (me.totalTimeMinute < 1440) {
      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: me.state.dict.machine_report_warning_total_time,
        buttons: [{
          text: me.state.dict.yes,
          onClick: function () {
            me.sentData();
          }
        }, {
          text: me.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();
    } else {
      me.sentData();
    }
  }

  /**
   * 
   * @param {*} item 
   * @param {*} index 
   */
  delete(index, item) {
    let me = this;
    let { workId } = item;
    let newMachineDailyReports = me.state.machineDailyReports;
    // let added = newMachineDailyReports.machineDailyReportDetails[index].added;
    if (newMachineDailyReports.machineDailyReportDetails[index].detailType === 3) {//停止時間とき
      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: me.state.dict.msg_confirm_delete,
        buttons: [{
          text: me.state.dict.yes,
          onClick: function () {
            Report.deletedowntimeById(newMachineDailyReports.machineDailyReportDetails[index].id)
              .then(function (response) {
                if (response.error) {
                  me.$f7.dialog.alert(response.errorMessage);
                } else {
                  newMachineDailyReports.machineDailyReportDetails.splice(index, 1);
                  me.setState({
                    machineDailyReports: newMachineDailyReports
                  });
                }
              })
              .catch((err) => {
                var error = err;
                me.setState(() => { throw new UnexpectedError(error); });
              });
          }
        }, {
          text: me.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();

    } else {
      Work.getWork(workId)
        .then((response) => {//作業の時
          if (response.tblWorks[0].locked === 1) {
            me.$f7.dialog.alert(me.state.dict.msg_error_locked);
            return;
          } else {
            me.$f7.dialog.create({
              title: me.state.dict.application_title,
              text: me.state.dict.msg_confirm_delete,
              buttons: [{
                text: me.state.dict.yes,
                onClick: function () {
                  Work.deleteWorkById(workId)
                    .then((response) => {
                      if (response.error) {
                        me.$f7.dialog.alert(response.errorMessage);
                      } else {
                        newMachineDailyReports.machineDailyReportDetails.splice(index, 1);
                        me.setState({
                          machineDailyReports: newMachineDailyReports
                        });
                      }
                    })
                    .catch((err) => {
                      var error = err;
                      me.setState(() => { throw new UnexpectedError(error); });
                    });
                }
              }, {
                text: me.state.dict.no,
                onClick: function (dialog) {
                  dialog.close();
                }
              }]
            }).open();
          }
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }

  }

  /**
   * 
   * @param {*} item 
   * @param {*} index 
   */
  copy(index, item) {

    let me = this;
    // 作業の場合のコピーは作業日報画面の挙動と同じ。
    // 停止時間のコピーはすべての値を引き継ぎ、停止時間登録画面へ遷移。
    // どちらの場合も、未保存のデータがあるときは保存を促すメッセージを出力してから遷移する。
    // (遷移先で日付を変更される可能性があるため)
    if (this.state.isChanged === '1') {
      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: me.state.dict.msg_confirm_save_modification,
        buttons: [{
          text: me.state.dict.yes,
          onClick: function () {
            if (item.detailType === 1) {
              // 作業の場合のコピーは作業日報画面の挙動と同じ。
              Work.getWork(item.workId)
                .then((works) => {//作業の時
                  var { workCopyInfoAdd } = me.props;
                  workCopyInfoAdd(works.tblWorks[0]);
                  me.$f7router.navigate(APP_DIR_PATH + '/work-start-input?pageName=workCopy&department=' + me.state.department, { pushState: true, reloadAll: false });
                });
            } else if (item.detailType === 3) {

              let editIndex = me.state.machineDailyReports.machineDailyReportDetails.length;
              me.props.updateMachineReportInfo(me.state.machineDailyReports);
              // optFlg:1 add,2 edit ,3 delete ,4 copy
              me.$f7router.navigate(APP_DIR_PATH + '/report-stop-time-register?optFlg=4&currentItmeIndex=' + index + '&editIndex=' + editIndex, { pushState: true, reloadAll: false });

            }
          }
        }, {
          text: me.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();

    } else {

      if (item.detailType === 1) {
        // 作業の場合のコピーは作業日報画面の挙動と同じ。
        Work.getWork(item.workId)
          .then((works) => {//作業の時
            var { workCopyInfoAdd } = this.props;
            workCopyInfoAdd(works.tblWorks[0]);
            me.$f7router.navigate(APP_DIR_PATH + '/work-start-input?pageName=workCopy&department=' + me.state.department, { pushState: true, reloadAll: false });
          });
      } else if (item.detailType === 3) {

        let editIndex = this.state.machineDailyReports.machineDailyReportDetails.length;
        this.props.updateMachineReportInfo(this.state.machineDailyReports);
        // optFlg:1 add,2 edit ,3 delete ,4 copy
        this.$f7router.navigate(APP_DIR_PATH + '/report-stop-time-register?optFlg=4&currentItmeIndex=' + index + '&editIndex=' + editIndex, { pushState: true, reloadAll: false });
      }
    }
  }

  /**
   *
   * @param setDefault
   */
  createPickerTime(defaultVal, durationMinitues, index) {
    var me = this;
    if (me.pickerTime) {
      me.pickerTime.destroy();
    }
    var _values = [0];
    var _displayValues = ['0' + me.state.dict.time_unit_minute];
    var defaultValue = defaultVal;
    for (let i = 1; i <= durationMinitues; i++) {
      _values.push(i);
      _displayValues.push(i + me.state.dict.time_unit_minute);
    }

    let newMachineDailyReports = this.state.machineDailyReports;
    me.pickerTime = me.createPicker('#machine-report-list-page-time-unit-minute_' + index, _values, _displayValues,
      //Col Change Callback
      (picker, value) => {
        if (parseInt(newMachineDailyReports.machineDailyReportDetails[index].durationMinitues) !== parseInt(value)) {
          newMachineDailyReports.machineDailyReportDetails[index].durationMinitues = parseInt(value);
          newMachineDailyReports.machineDailyReportDetails[index].modified = true;
          me.setState({
            isChanged: '1',
            machineDailyReports: newMachineDailyReports
          });
        }
      }
    );
    // if (item.durationMinitues !== 0) {
    me.pickerTime.setValue([defaultValue], 0);
    // }
  }

  /**
   * 
   * @param {*} startTime 
   * @param {*} endTime 
   */
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
   * アイテム選択時
   * optFlg:1 add,2 edit 3 delete
   * @param {*} item 
   * @param {*} index 
   */
  itemLinkbuttonClick(item, index) {
    if (item.detailType === 1) {
      if (item.workEndFlg === 1) {
        this.$f7.dialog.alert(this.state.dict.msg_error_end);
        return;
      } else {
        let query = this.$f7route.query;
        let params = Object.keys(query).map(function (key) {
          if (query[key]) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
          } else {
            return '';
          }
        }).join('&');
        let data = this.state.machineDailyReports;
        this.props.updateMachineReportInfo(data);
        this.$f7router.navigate(APP_DIR_PATH + '/work-end-input?pageName=reportDetail&id=' + item.workId + '&' + params);
      }

    } else if (item.detailType === 2) {

      let data = this.state.machineDailyReports;
      this.props.updateMachineReportInfo(data);

      this.$f7router.navigate(APP_DIR_PATH + '/report-production-count-register?optFlg=2&editIndex=' + index, { pushState: true });

    } else if (item.detailType === 3) { //停止時間

      let data = this.state.machineDailyReports;
      //data.machineDailyReportDetails[index].modified = true;
      data.isChanged = '0';
      this.props.updateMachineReportInfo(data);
      this.$f7router.navigate(APP_DIR_PATH + '/report-stop-time-register?optFlg=2&editIndex=' + index, { pushState: true });
    }

  }

  /**
   * 
   * @param {*} _reports 
   */
  makeList(_reports) {
    this.workTotalTime = 0;
    let me = this;
    let reportList = [];
    let tempTotalDownTime = 0;
    let tempTotalDurationTime = 0;
    for (var i = 0; i < _reports.length; i++) {
      if (_reports[i].deleted) {
        continue;
      }
      if (_reports[i].operatingFlg === 0) {//off
        tempTotalDownTime += parseInt(_reports[i].durationMinitues);
      } else {
        tempTotalDurationTime += parseInt(_reports[i].durationMinitues);
      }
      reportList.push(this.makeListRow(i, _reports[i]));
    }

    me.totalOperatingMinutes = tempTotalDurationTime;
    me.totalDowntimeMinutes = tempTotalDownTime;
    me.totalTimeMinute = tempTotalDurationTime + tempTotalDownTime;


    if (reportList.length > 0) {
      return (
        <List className={'no-padding margin-bottom99 list'}>
          {reportList}
        </List>
      );
    } else {
      return (
        <List className={'no-padding no-margin'}>
          {reportList}
        </List>
      );
    }

  }

  /**
   * 
   * @param {*} index 
   * @param {*} item 
   */
  makeListRow(index, item) {
    this.workTotalTime = item.workingTimeMinutes ? this.workTotalTime + item.workingTimeMinutes : this.workTotalTime + 0;
    item.reportDate = this.state.reportDate;
    return (
      <ListItem //1作業、２生産、３停止
        link='#' onClick={this.itemLinkbuttonClick.bind(this, item, index)}
        swipeout key={index} >
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{moment(item.startDatetimeStr).format('MM/DD HH:mm')}</ListItemCell>
            <ListItemCell>{item.endDatetimeStr ? moment(item.endDatetimeStr).format('MM/DD HH:mm') : ' '}</ListItemCell>
            <ListItemCell style={{ textAlign: 'right' }}>{item.durationMinitues + this.state.dict.time_unit_minute}
              <input type="hidden"
                name="timeUnitMinute"
                value={item.durationMinitues + this.state.dict.time_unit_minute}
                readOnly
                disabled
                id={'machine-report-list-page-time-unit-minute_' + index} />
            </ListItemCell>
          </ListItemRow>

          <ListItemRow>
            <ListItemCell>{this.state.dict.operating_flg}</ListItemCell>
            <ListItemCell>{item.operatingFlg === 0 ? this.state.dict.operating_flg_off : this.state.dict.operating_flg_on}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_report_work}</ListItemCell>
            {/* レコードが作業、生産のときは工程名称、停止時間のときは停止理由。 */}
            <ListItemCell>{item.detailType === 1 || item.detailType === 2 ? item.work ? item.work : '' : item.work}  </ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.component_code}</ListItemCell>
            <ListItemCell>{item.firstComponentCode}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.mold_name}</ListItemCell>
            <ListItemCell>{item.moldName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.work_user_name}</ListItemCell>
            <ListItemCell>{item.workerName}</ListItemCell>
          </ListItemRow>

        </div>

        {/* レコードが作業1または停止時間3のときのみコピーメニューを表示。 
            レコードが作業または停止時間のときのみ削除メニューを表示。*/}
        {
          item.detailType === 1 || item.detailType === 3 ?
            <SwipeoutActions right>
              <SwipeoutButton onClick={this.timeChange.bind(this, item, index)}  >{this.state.dict.time_change}</SwipeoutButton>
              <SwipeoutButton close onClick={this.delete.bind(this, index, item)}>{this.state.dict.delete_record}</SwipeoutButton>
              <SwipeoutButton onClick={this.copy.bind(this, index, item)}>{this.state.dict.copy}</SwipeoutButton>
            </SwipeoutActions>
            :
            <SwipeoutActions right>
              <SwipeoutButton onClick={this.timeChange.bind(this, item, index)}  >{this.state.dict.time_change}</SwipeoutButton>
            </SwipeoutActions>
        }
      </ListItem>
    );
  }
}

function mapStateToProps(state) {
  return {
    reportInfo: state.machine.machineReport.reportInfo
  };
}

function mapDispatchToProps(dispatch) {
  return {

    updateMachineReportInfo(value) {
      dispatch(updateMachineReportInfo(value));
    },

    clearMachineReport(value) {
      dispatch(clearMachineReport(value));
    },

    workCopyInfoAdd(value) {
      dispatch(workCopyInfoAdd(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineReportListPage);