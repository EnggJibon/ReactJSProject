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
  AccordionContent,
  ListItemRow,
  ListItemCell,
  Checkbox
} from 'framework7-react';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import moment from 'moment';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import Choice from 'karte/shared/master/choice';
import CalendarUtil from '../../../../shared/logics/calendar-util';
import { UnexpectedError } from 'karte/shared/logics/errors';
import Authentication from 'karte/shared/logics/authentication';
import Report from '../../logics/report';
import Machine from '../../../../shared/master/machine';
import System from 'karte/shared/master/system';

export default class MachineListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        machine_daily_report_reference: '',
        machine_report_date: '',
        machineDepartment: '',
        machine_id: '',
        machine_name: '',
        producing_time_minutes: '',
        time_unit_minute: '',
        machine_report_add_downtime: '',
        work_total_time: '',
        shot_count: '',
        close: '',
        delete_record: '',
        explain_machine_only: '',
        msg_error_not_null: '',
        explain_machine_report: '',
        mst_error_record_not_found: '',
        msg_warning_mdr2_prev_days: '',
        yes: '',
        no: '',
        ok: '',
      },
      reportDate: '',
      department: '',
      departmentName: '',
      machineUuid: '',
      machineId: '',
      machineName: '',
      mstMachines: '',
      mstErrorRecordNotFound: '',
      explainMachineOnly: 0,
      reload: '0',
      machineOnlyShow: 0,
      expectedTotalTimeMinutes: '',
      mstMachineVos: [],
    };
    this.departments = [];
    this.count = 0;
    this.continue = true;
  }

  /**
   *
   */
  componentDidMount() {
    var me = this;
    const app = me.$f7;
    DictionaryLoader.getDictionary(this.state.dict)
      .then((value) => {
        me.setState({ dict: value });

        me.toast = app.toast.create({
          text: me.state.dict.explain_machine_report,
          closeButton: true,
          closeButtonText: '<i class="f7-icons">close</i>',
          closeButtonColor: 'white',
        });
        me.toast.open();
      })
      .catch((err) => {
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
      CalendarUtil.getCalendarProperties('#machine-list-page-report-date', {
        change: function (calendar, value) {
          let newDate = moment(new Date(value)).format('YYYY/MM/DD');
          if (me.state.reportDate !== newDate) {
            me.loadMahcineListData(newDate);
          }
          me.setState({
            reportDate: moment(new Date(value)).format('YYYY/MM/DD')
          });
        },
      })
    );
  }

  /**
   *
   * @param arg
   */
  touchChangeTime(arg) {
    let reportDate;
    if (arg === 'next') {
      reportDate = moment(this.state.reportDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY/MM/DD');
      this.setState({
        reportDate: reportDate
      });
    } else {
      reportDate = moment(this.state.reportDate, 'YYYY/MM/DD').subtract(1, 'days').format('YYYY/MM/DD');
      this.setState({
        reportDate: reportDate
      });
    }
    this.loadMahcineListData(reportDate);
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
          onChange: onColChange
        }
      ],
      on: {
        close: function () {
          if (me.state.reload === '1') {
            me.loadMahcineListData();
            me.setState({
              reload: '0'
            });
          }
        }
      }
    });
  }

  /**
   *
   * @param setDefault
   */
  createPickerDepartment(setDefault) {
    var me = this;
    var _values = [0];
    var _displayValues = [''];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.departments.length; i++) {
      let department = me.departments[i];
      _values.push(department.seq);
      _displayValues.push(department.choice);
      //ログインユーザーの所属に等しいものをデフォルトとする
      if (parseInt(me.state.department) === parseInt(department.seq)) {
        defaultValue = department.seq;
        defaultName = department.choice;
      }
    }
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    me.pickerDepartment = me.createPicker('#machine-list-page-department', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        const oldReportDepartment = me.state.department;

        me.setState({ department: value });
        me.setState({ departmentName: displayValue });
        if (parseInt(oldReportDepartment) !== parseInt(value)) {
          me.setState({ reload: '1' });
        } else {
          me.setState({ reload: '0' });
        }
      }
    );

    if (setDefault && defaultValue !== null) {
      me.pickerDepartment.setValue([defaultValue], 0);
      me.setState({ department: defaultValue });
      me.setState({ departmentName: defaultName });
    }
  }

  /**
   * 
   * @param {*} reportDate 
   */
  loadMahcineListData(reportDate, machineId) {
    let me = this;
    me.$f7.preloader.show();

    Report.getMachineList({ //設備一覧データを取得
      department: this.state.department,
      machineId: machineId ? machineId : this.state.machineId,
      orderByMachineName: 'machineName'
    })
      .then((value1) => {
        me.$f7.preloader.hide();
        let mstMachineVos = value1.mstMachineVos;
        if (mstMachineVos.length > 0) {
          let count = 0;
          //初期値セット
          for (let i = 0; i < mstMachineVos.length; i++) {
            mstMachineVos[i].totalDowntimeMinutes = 0;
            mstMachineVos[i].totalOperatingMinutes = 0;
            mstMachineVos[i].totalShotCount = 0;
            mstMachineVos[i].totalTimeMinutes = 0;
            mstMachineVos[i].expectedTotalTimeMinutes = '';

            if (this.state.machineUuid !== '' && mstMachineVos[i].machineUuid !== this.state.machineUuid) {
              count++;
            }
          }
          if (count === mstMachineVos.length) {
            me.setState({
              mstMachines: [],
              bakMstMachines: mstMachineVos,
              mstMachineVos: mstMachineVos
            });
            return;
          }

          Report.getSearchTime({//設備日報データを取得
            reportDate: reportDate ? reportDate : this.state.reportDate,
            machineUuid: this.state.machineUuid
          }).then((value2) => {
            let machineDailyReports = value2.machineDailyReports;
            for (let j = 0; j < machineDailyReports.length; j++) {
              for (let i = 0; i < mstMachineVos.length; i++) {
                if (mstMachineVos[i].machineUuid === machineDailyReports[j].machineUuid) {
                  mstMachineVos[i].totalDowntimeMinutes = machineDailyReports[j].totalDowntimeMinutes;
                  mstMachineVos[i].totalOperatingMinutes = machineDailyReports[j].totalOperatingMinutes;
                  mstMachineVos[i].totalShotCount = machineDailyReports[j].totalShotCount;
                  mstMachineVos[i].totalTimeMinutes = machineDailyReports[j].totalTimeMinutes;
                  mstMachineVos[i].machineDailyReportDetails = machineDailyReports[j].machineDailyReportDetails || [];
                }
              }
            }

            me.setState({
              mstMachines: mstMachineVos,
              bakMstMachines: mstMachineVos,
              mstMachineVos: mstMachineVos
            });

            me.count = 0;
            me.continue = true;
            me.threadCheck(mstMachineVos, machineDailyReports);
          });

        } else {
          me.setState({
            mstMachines: [],
            bakMstMachines: [],
            mstMachineVos: [],
            mstErrorRecordNotFound: me.state.dict.mst_error_record_not_found,
          });
        }
      })
      .catch((err) => {
        let error = err;
        me.setState(() => {
          throw new UnexpectedError(error);
        });
      });
  }

  /**
   * 
   * @param {*} mstMachineVos 
   * @param {*} machineDailyReports 
   */
  threadCheck(mstMachineVos, machineDailyReports) {
    let me = this;
    let checkResult = me.checkTimeMinutes();
    if (checkResult) {

      if (me.continue) {
        let count = me.count;
        me.continue = false;
        if (count === mstMachineVos.length) {
          this.filter(this.state.machineOnlyShow);
        }
        for (let i = 0; i < mstMachineVos.length; i++) {
          let expectedTimeMinutes = 0;
          if (i === count) {
            me.CalculateElapsedTimeMinutes(mstMachineVos[i].machineUuid, function (elapsedTimeMinutes, newMachineDailyReport) {
              if (machineDailyReports.length > 0) {
                for (let j = 0; j < machineDailyReports.length; j++) {
                  if (newMachineDailyReport.length > 0) {
                    for (let l = 0; l < newMachineDailyReport.length; l++) {
                      if (mstMachineVos[i].machineUuid === machineDailyReports[j].machineUuid) {
                        if (newMachineDailyReport[l].machineUuid === machineDailyReports[j].machineUuid) {
                          expectedTimeMinutes = machineDailyReports[j].totalTimeMinutes + newMachineDailyReport[l].totalTimeMinutes;
                          if (elapsedTimeMinutes > expectedTimeMinutes) {
                            let newObj = [...me.state.mstMachineVos];
                            newObj[i].expectedTotalTimeMinutes = '*';
                          } else if (expectedTimeMinutes < 1440) {
                            let newObj = [...me.state.mstMachineVos];
                            newObj[i].expectedTotalTimeMinutes = '*';
                          }
                        } else {
                          let newObj = [...me.state.mstMachineVos];
                          newObj[i].expectedTotalTimeMinutes = '';
                          continue;
                        }
                      } else if (mstMachineVos[i].machineUuid === newMachineDailyReport[l].machineUuid) {
                        let flge = false;
                        let machine = machineDailyReports.find((element) => { return (element.machineUuid === mstMachineVos[i].machineUuid); });
                        if (machine) {
                          flge = true;
                        }
                        if (!flge) {
                          expectedTimeMinutes = newMachineDailyReport[l].totalTimeMinutes;
                          if (elapsedTimeMinutes > expectedTimeMinutes) {
                            let newObj = [...me.state.mstMachineVos];
                            newObj[i].expectedTotalTimeMinutes = '*';
                          }
                        } else {
                          break;
                        }
                      } else {
                        let newObj = [...me.state.mstMachineVos];
                        newObj[i].expectedTotalTimeMinutes = '';
                        continue;
                      }
                    }
                  } else {
                    if (mstMachineVos[i].machineUuid === machineDailyReports[j].machineUuid) {
                      // debugger
                      expectedTimeMinutes = machineDailyReports[j].totalTimeMinutes;
                      if (expectedTimeMinutes < elapsedTimeMinutes) {
                        let newObj = [...me.state.mstMachineVos];
                        newObj[i].expectedTotalTimeMinutes = '*';
                      }
                    } else {
                      let flge = false;
                      let machine = machineDailyReports.find((element) => { return (element.machineUuid === mstMachineVos[i].machineUuid); });
                      if (machine) {
                        flge = true;
                      }
                      if (!flge) {
                        if (elapsedTimeMinutes > expectedTimeMinutes) {
                          let newObj = [...me.state.mstMachineVos];
                          newObj[i].expectedTotalTimeMinutes = '*';
                        }
                      }
                    }
                  }
                }
              }
              else {
                if (newMachineDailyReport && newMachineDailyReport.length > 0) {
                  for (let j = 0; j < newMachineDailyReport.length; j++) {
                    if (mstMachineVos[i].machineUuid === newMachineDailyReport[j].machineUuid) {
                      expectedTimeMinutes = newMachineDailyReport[j].totalTimeMinutes;
                      if (elapsedTimeMinutes > expectedTimeMinutes) {
                        let newObj = [...me.state.mstMachineVos];
                        newObj[i].expectedTotalTimeMinutes = '*';
                      } else {
                        let newObj = [...me.state.mstMachineVos];
                        newObj[i].expectedTotalTimeMinutes = '';
                      }
                    } else {
                      let newObj = [...me.state.mstMachineVos];
                      newObj[i].expectedTotalTimeMinutes = '';
                    }
                  }
                } else {
                  let newObj = [...me.state.mstMachineVos];
                  newObj[i].expectedTotalTimeMinutes = '*';
                }
              }
              if (mstMachineVos.length - 1 === i) {
                me.setState({
                  explainMachineOnly: 1
                });
              }
              me.setState({
                mstMachines: mstMachineVos,
                bakMstMachines: mstMachineVos,
                mstErrorRecordNotFound: ''
              });
              me.count = count + 1;
              me.continue = true;
              me.threadCheck(mstMachineVos, machineDailyReports);
            });
          }
        }
      }
    } else {
      for (let i = 0; i < mstMachineVos.length; i++) {
        let expectedTimeMinutes = 0;
        let elapsedTimeMinutes = 1440;
        let newMachineDailyReport = [];
        if (machineDailyReports.length > 0) {
          for (let j = 0; j < machineDailyReports.length; j++) {
            if (newMachineDailyReport.length > 0) {
              for (let l = 0; l < newMachineDailyReport.length; l++) {
                if (mstMachineVos[i].machineUuid === machineDailyReports[j].machineUuid) {
                  if (newMachineDailyReport[l].machineUuid === machineDailyReports[j].machineUuid) {
                    expectedTimeMinutes = machineDailyReports[j].totalTimeMinutes + newMachineDailyReport[l].totalTimeMinutes;
                    if (elapsedTimeMinutes > expectedTimeMinutes) {
                      let newObj = [...me.state.mstMachineVos];
                      newObj[i].expectedTotalTimeMinutes = '*';
                    } else if (expectedTimeMinutes < 1440) {
                      let newObj = [...me.state.mstMachineVos];
                      newObj[i].expectedTotalTimeMinutes = '*';
                    }
                  } else {
                    let newObj = [...me.state.mstMachineVos];
                    newObj[i].expectedTotalTimeMinutes = '';
                    continue;
                  }
                } else if (mstMachineVos[i].machineUuid === newMachineDailyReport[l].machineUuid) {
                  let flge = false;
                  let machine = machineDailyReports.find((element) => { return (element.machineUuid === mstMachineVos[i].machineUuid); });
                  if (machine) {
                    flge = true;
                  }
                  if (!flge) {
                    expectedTimeMinutes = newMachineDailyReport[l].totalTimeMinutes;
                    if (elapsedTimeMinutes > expectedTimeMinutes) {
                      let newObj = [...me.state.mstMachineVos];
                      newObj[i].expectedTotalTimeMinutes = '*';
                    }
                  } else {
                    break;
                  }
                } else {
                  let newObj = [...me.state.mstMachineVos];
                  newObj[i].expectedTotalTimeMinutes = '';
                  continue;
                }
              }
            } else {
              if (mstMachineVos[i].machineUuid === machineDailyReports[j].machineUuid) {
                // debugger
                expectedTimeMinutes = machineDailyReports[j].totalTimeMinutes;
                if (expectedTimeMinutes < elapsedTimeMinutes) {
                  let newObj = [...me.state.mstMachineVos];
                  newObj[i].expectedTotalTimeMinutes = '*';
                }
              } else {
                let flge = false;
                let machine = machineDailyReports.find((element) => { return (element.machineUuid === mstMachineVos[i].machineUuid); });
                if (machine) {
                  flge = true;
                }
                if (!flge) {
                  if (elapsedTimeMinutes > expectedTimeMinutes) {
                    let newObj = [...me.state.mstMachineVos];
                    newObj[i].expectedTotalTimeMinutes = '*';
                  }
                }
              }
            }
          }
        }
        else {
          if (newMachineDailyReport && newMachineDailyReport.length > 0) {
            for (let j = 0; j < newMachineDailyReport.length; j++) {
              if (mstMachineVos[i].machineUuid === newMachineDailyReport[j].machineUuid) {
                expectedTimeMinutes = newMachineDailyReport[j].totalTimeMinutes;
                if (elapsedTimeMinutes > expectedTimeMinutes) {
                  let newObj = [...me.state.mstMachineVos];
                  newObj[i].expectedTotalTimeMinutes = '*';
                } else {
                  let newObj = [...me.state.mstMachineVos];
                  newObj[i].expectedTotalTimeMinutes = '';
                }
              } else {
                let newObj = [...me.state.mstMachineVos];
                newObj[i].expectedTotalTimeMinutes = '';
              }
            }
          } else {
            let newObj = [...me.state.mstMachineVos];
            newObj[i].expectedTotalTimeMinutes = '*';
          }
        }
        if (mstMachineVos.length - 1 === i) {
          me.setState({
            explainMachineOnly: 1
          });
        }
      }
      me.setState({
        mstMachines: mstMachineVos,
        bakMstMachines: mstMachineVos,
        mstErrorRecordNotFound: ''
      });
      this.filter(this.state.machineOnlyShow);
    }

  }

  checkTimeMinutes() {
    let me = this;
    let newDate = moment(new Date()).format('YYYY/MM/DD');
    if (me.state.reportDate === newDate) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * 
   * @param {*} id 
   * @param {*} fn 
   */
  CalculateElapsedTimeMinutes(id, fn) {
    let me = this;
    // let newDate = moment(new Date()).format('YYYY/MM/DD');
    let elaplsedTimeMinutes = 0;
    // if (me.state.reportDate === newDate) {
    let businessStartDateTime = moment(me.state.reportDate + ' ' + me.state.configValue);
    let currentBusinessDate = moment(new Date());
    if (moment(businessStartDateTime).isAfter(currentBusinessDate)) {
      elaplsedTimeMinutes = businessStartDateTime.diff(currentBusinessDate, 'minute');
    } else if (moment(currentBusinessDate).isAfter(businessStartDateTime)) {
      elaplsedTimeMinutes = currentBusinessDate.diff(businessStartDateTime, 'minute');
    }

    Report.getCollectTime({
      reportDate: me.state.reportDate,
      machineUuid: id,
    }).then((response) => {

      // me.setState({
      //   newMachineDailyReport: response.machineDailyReportDetails
      // });
      fn(elaplsedTimeMinutes, response.machineDailyReportDetails);
    });
    // } else {
    // elaplsedTimeMinutes = 1440;
    // fn(elaplsedTimeMinutes, []);
    // }
    // return elaplsedTimeMinutes;
  }

  /**
   * 
   * @param {*} configValue 
   */
  solveHours(configValue) {
    let configValueStr = (moment().format('YYYY/MM/DD')) + ' ' + (this.state.configValue !== '' ? this.state.configValue : configValue);
    let currentStr = (moment().format('YYYY/MM/DD HH:mm'));
    return ((new Date(configValueStr)).getTime() < (new Date(currentStr)).getTime());
  }

  /**
   *
   */
  onPageInit() {
    let me = this;
    // 業務開始時刻を取得
    System.load(['system.business_start_time'])
      .then((values) => {

        me.setState({
          configValue: values.cnfSystems[0].configValue
        });
        let today = new Date();
        let { reportDate, department } = me.$f7route.query;
        if (reportDate) {
          today = new Date(reportDate);
        }
        if (me.solveHours(values.cnfSystems[0].configValue)) {
          this.setState({
            reportDate: moment(today).format('YYYY/MM/DD')
          });
        } else {
          this.setState({
            reportDate: moment(today).subtract(1, 'days').format('YYYY/MM/DD')
          });
        }

        me.reportDateCalendarCreate();

        Promise.all([
          Authentication.whoAmI(),
          Choice.categories('mst_user.department', {})
        ])
          .then((values) => {
            let responseWho = values[0];
            let responseChoice = values[1];
            me.state.department = (department !== '' && department !== undefined && department !== 'undefined') ? department : responseWho.department;
            me.departments = [...responseChoice.mstChoiceVo];
            me.createPickerDepartment(true);
            me.createMachineAutocomplete();

            me.loadMahcineListData();

          })
          .catch((err) => {
            let error = err;
            me.setState(() => {
              throw new UnexpectedError(error);
            });
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
    this.toast.close();
  }

  /**
   *
   */
  onBackClick() {
    this.continue = false;
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/', { pushState: true });
  }

  /**
   *
   */
  checkprevdays(item) {
    this.toast.close();
    let me = this;
    Report.checkprevdays({
      reportDate: this.state.reportDate,
      machineUuid: item.machineUuid
    }).then(response => {
      if (response.warning) {
        me.$f7.dialog.create({
          title: me.state.dict.application_title,
          text: me.state.dict.msg_warning_mdr2_prev_days.replace('%s', moment(response.date).format('YYYY/MM/DD')),
          buttons: [{
            text: this.state.dict.yes,
            onClick: function () {
              me.$f7router.navigate(APP_DIR_PATH + '/report-detail?machineUuid=' + item.machineUuid +
                '&reportDate=' + me.state.reportDate +
                '&machineName=' + encodeURIComponent(item.machineName) +
                '&machineId=' + encodeURIComponent(item.machineId) +
                '&department=' + item.departmentId, { pushState: true, reloadAll: true });
            }
          }, {
            text: this.state.dict.no,
            onClick: function (dialog) {
              dialog.close();
            }
          }]
        }).open();//machineId
      } else {
        me.$f7router.navigate(APP_DIR_PATH + '/report-detail?machineUuid=' + item.machineUuid
          + '&machineId=' + encodeURIComponent(item.machineId)
          + '&reportDate=' + me.state.reportDate
          + '&machineName=' + encodeURIComponent(item.machineName) +
          '&department=' + item.departmentId, { pushState: true, reloadAll: true });
      }
    }).catch((err) => {
      let error = err;
      me.$f7.preloader.hide();
      me.setState(() => {
        throw new UnexpectedError(error);
      });
    });
  }

  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(event) {
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'department') {
      this.setState({
        department: 0,
        departmentName: '',
      });
    }

    if (event.target.name === 'machineId') {
      this.setState({
        machineUuid: '',
        machineName: '',
      });
    }
    this.loadMahcineListData(undefined, '');
  }

  /**
   * 
   * @param {*} event 
   */
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  /**
 * 設備検索ボタン
 */
  buttonMachineSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch', {props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }

  /**
   * 
   * @param {*} item 
   */
  onMachineSelectedCell(item) {
    this.setState({
      machineUuid: item.machineUuid,
      machineId: item.machineId,
      machineName: item.machineName,
    });

    this.loadMahcineListData(undefined, item.machineId);

  }

  /**
   * 
   * @param {*} machineUuid 
   * @param {*} machineOnlyShow 
   */
  filter(machineOnlyShow) {

    if (machineOnlyShow === 1) {
      let filterObj = this.state.bakMstMachines;
      let newObj = [];
      for (let i = 0; i < filterObj.length; i++) {
        if (filterObj[i].expectedTotalTimeMinutes === '*') {
          newObj.push(filterObj[i]);
        }
      }
      this.setState({
        mstMachines: newObj
      });
    } else if (machineOnlyShow === 0) {
      let filterObj = this.state.bakMstMachines;
      this.setState({
        mstMachines: filterObj
      });
    }
  }

  /**
   * 設備ID
   */
  createMachineAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#machine-list-page-machine-id',
      openIn: 'dropdown',
      valueProperty: 'machineId', //object's "value" property name
      textProperty: 'machineId', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Machine.getMachineLike({
          machineId: query
        })
          .then((response) => {
            let data = response.mstMachineAutoComplete;
            for (var i = 0; i < data.length; i++) {
              results.push(data[i]);
            }
            // Hide Preoloader
            autocomplete.preloaderHide();
            // Render items by passing array with result items
            render(results);
          })
          .catch((err) => {
            var error = err;
            me.setState(() => { throw new UnexpectedError(error); });
          });
      },
      on: {
        change: function (value) {
          let item = {
            machineUuid: value[0].uuid,
            machineId: value[0].machineId,
            machineName: value[0].machineName,
          };
          me.setState(item);
        },
        closed: function (autocomplete) {
          if (me.state.machineName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              machineUuid: '',
              machineId: '',
              machineName: ''
            });
          }
          me.loadMahcineListData();
        }
      },
    });
  }

  /**
     * 設備ID用QRボタン
     */
  buttonMachineQRClick() {
    //QRページを遷移して設備ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMachineQrRead.bind(this) } });
  }

  /**
   * 
   * @param {*} code 
   */
  onMachineQrRead(code) {
    if (code) {
      QRCodeParser.parseMachineID(code).then((response) => {
        if (!response.error && response.mstMachineAutoComplete[0]) {
          let item = {
            machineUuid: response.mstMachineAutoComplete[0].machineUuid,
            machineId: response.mstMachineAutoComplete[0].machineId,
            machineName: response.mstMachineAutoComplete[0].machineName,
          };
          this.setState(item);
          this.loadMahcineListData(undefined, response.mstMachineAutoComplete[0].machineId);
        } else {
          this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found);
        }
      }).catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found);
    }
  }

  /**
   * 
   */
  checkboxChange(event) {
    let machineOnlyShow = event.target.checked ? 1 : 0;
    this.setState({
      machineOnlyShow: machineOnlyShow,
    });
    this.filter(machineOnlyShow);
  }

  /**
   * render
   */
  render() {
    const { mstMachines } = this.state;
    return (
      <DocumentTitle title={this.state.dict.machine_daily_report_reference}>
        <Page
          onPageInit={this.onPageInit.bind(this)}
          infinite
          infinitePreloader={false}
          onPageBeforeOut={this.onPageBeforeOut.bind(this)}
        >
          <AppNavbar
            applicationTitle={this.state.dict.application_title}
            showBack={true}
            backClick={this.onBackClick.bind(this)}>
          </AppNavbar>
          <BlockTitle>{this.state.dict.machine_daily_report_reference}</BlockTitle>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <Block>
              <Row>
                <Col width="30">
                  <Label style={{ textAlign: 'right' }}>{this.state.dict.machine_report_date}</Label>
                </Col>
              </Row>
              <Row>
                <Col width="20">
                  <Button fill small
                    onClick={this.touchChangeTime.bind(this, 'previous')}>{'<'}</Button>
                </Col>
                <Col>
                  <Input inputStyle={{ textAlign: 'center' }} type="text" name="reportDate"
                    value={this.state.reportDate} readonly
                    inputId="machine-list-page-report-date" />
                </Col>
                <Col width="20">
                  <Button fill small
                    onClick={this.touchChangeTime.bind(this, 'next')}>{'>'}</Button>
                </Col>
              </Row>
            </Block>
            <ListItem>
              <Label>{this.state.dict.machineDepartment}</Label>
              <Input type="text" name="department"
                value={this.state.departmentName}
                clearButton
                readonly
                onInputClear={this.handleClear.bind(this)}
                onChange={this.handleChange.bind(this)}
                inputId="machine-list-page-department" />
            </ListItem>
          </List>

          <List accordionList noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll">
            <ListItem accordionItem title="">
              <AccordionContent>
                <List noHairlinesBetween className="no-margin-top no-margin-bottom">
                  <ListItem className="custom-list-item">
                    <Label>{this.state.dict.machine_id}</Label>
                    <Input type="text" name="machineId"
                      value={this.state.machineId}
                      onChange={this.handleChange.bind(this)}
                      onInputClear={this.handleClear.bind(this)}
                      clearButton
                      inputId="machine-list-page-machine-id"
                    />               
                    <div className="btn-absolute">
                      <Button small fill text="QR"
                        onClick={this.buttonMachineQRClick.bind(this)}
                      >
                      </Button>
                    </div>
                  </ListItem>

                  <ListItem>
                    <Label>{this.state.dict.machine_name}</Label>
                  </ListItem>

                  <ListItem className="custom-list-item">
                    <Input>{this.state.machineName}</Input>
                    <div className="btn-absolute">
                      <Button small fill iconF7="search" onClick={this.buttonMachineSearch.bind(this)}>
                      </Button>
                    </div>
                  </ListItem>
                  <ListItem>
                    <Col>
                      <Label><Checkbox className="no-fastclick" onChange={this.checkboxChange.bind(this)} disabled={this.state.explainMachineOnly === 0} style={{ marginRight: 20 }} id="machine-list-page-only-show" />{this.state.dict.explain_machine_only}</Label>
                    </Col>
                  </ListItem>
                </List>
              </AccordionContent>
            </ListItem>
          </List>

          {this.makeList(mstMachines)}
          <Block className="smallMargin">
            <p>{this.state.mstErrorRecordNotFound}</p>
          </Block>
        </Page>
      </DocumentTitle>
    );
  }

  /**
       *
       * @param _reports
   * @returns {*}
        */
  makeList(_reports) {
    var reportList = [];
    for (var i = 0; i < _reports.length; i++) {
      reportList.push(this.makeListRow(i, _reports[i]));
    }
    return (
      <List className={'no-margin no-padding normalFont'}>
        {reportList}
      </List>
    );
  }

  /**
       *
       * @param index
       * @param item
   * @returns {*}
        */
  makeListRow(index, item) {
    var card = (
      <ListItem key={index} link='#' onClick={this.checkprevdays.bind(this, item)}>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{item.machineName}</ListItemCell>
            <ListItemCell style={{
              textAlign: 'right',
              width: '90%'
            }}>{item.expectedTotalTimeMinutes ? item.expectedTotalTimeMinutes : ''}
            </ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.producing_time_minutes + '(' + this.state.dict.time_unit_minute + ')'}</ListItemCell>
            <ListItemCell
              style={{ textAlign: 'right', width: '90%' }}>{item.totalOperatingMinutes + ''}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_report_add_downtime + '(' + this.state.dict.time_unit_minute + ')'}</ListItemCell>
            <ListItemCell
              style={{ textAlign: 'right', width: '90%' }}>{item.totalDowntimeMinutes + ''}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.work_total_time + '(' + this.state.dict.time_unit_minute + ')'}</ListItemCell>
            <ListItemCell
              style={{ textAlign: 'right', width: '90%' }}>{item.totalTimeMinutes + ''}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.shot_count}</ListItemCell>
            <ListItemCell
              style={{ textAlign: 'right', width: '90%' }}>{item.totalShotCount + ''}
            </ListItemCell>
          </ListItemRow>

        </div>
      </ListItem>
    );
    return card;
  }
}