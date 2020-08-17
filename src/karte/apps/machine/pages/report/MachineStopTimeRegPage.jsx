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
  Col
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Report from 'karte/apps/machine/logics/report';
import { connect } from 'react-redux';
import { updateMachineReportInfo, clearMachineReport } from 'karte/apps/machine/reducers/machine-report-reducer';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import moment from 'moment';
import System from 'karte/shared/master/system';

class MachineStopTimeReg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        machine_daily_report_reference: '',
        machine_report_add_downtime: '',
        machine_name: '',
        machine_report_date: '',
        production_start_time: '',
        production_end_time: '',
        duration_minutes: '',
        downtime_reason: '',
        machine_inventory_remarks: '',
        ok: '',
        cancel: '',
        msg_error_not_null: '',
        msg_error_producint_work_datetime_order: '',
        msg_error_next_day_actual_work_datetime_order: '',
        msg_error_work_datetime_order: '',

      },
      required:'',
      machineName: '',
      reportDate: '',
      startDatetimeStr: '',
      endDatetimeStr: '',
      costMinutes: 0,
      downtimeReason: '',
      machineDowntimeId: '',
      downtimeComment: '',

      businessStartTime: '',
      editIndex: 0,
      modified: false,

      msgStartDatetime: '',
      msgEndDatetime: '',
      msgStopReason: ''

    };

    // 業務開始時刻を取得
    System.load(['system.business_start_time'])
      .then((values) => {
        this.setState({
          businessStartTime: values.cnfSystems[0].configValue
        });
      });

    this.mstMachineDowntimes = [];
    this.machineReportInfo = props.reportInfo;
    this.backMachineReportInfo = JSON.parse(JSON.stringify(this.machineReportInfo));//キャンセル時用

  }

  /**
   * 
   * @param {*} reportDate 
   */
  getSearchTime(reportDate) {

    let me = this;
    me.$f7.preloader.show();

    Promise.all([Report.getSearchTime({
      machineUuid: me.state.machineUuid,
      reportDate: reportDate
    }), Report.getSearchTimeCollect({
      machineUuid: me.state.machineUuid,
      reportDate: reportDate
    })]).then(res => {

      let dailyreport2 = [];
      let collect = [];

      if (res[0].machineDailyReports.length > 0) {
        dailyreport2.push(res[0].machineDailyReports[0]);
      }

      if (res[1]) {
        collect.push(res[1]);
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

      item.reportDate = this.state.reportDate;
      item.machineName = this.state.machineName;
      if (item.machineDailyReportDetails.length === 0) {
        item.machineDailyReportDetails[0] = {
          startDatetimeStr: '',
          endDatetimeStr: '',
          added: true,
          modified: false,
          deleted: false,
          detailType: 3,
          machineDailyReportProdDetails: [],
          downtimeComment: '',
          durationMinitues: 0,
          machineDowntimeId: '',
          reportId: this.machineReportInfo.id,
          work: '',
          reportDate: this.machineReportInfo.reportDate,
          operatingFlg: 0,
          disposedShotCount: 0,
          productionEndFlg: 0,
          shotCount: 0,
          workEndFlg: 0
        };
      }
      this.machineReportInfo = item;
      this.setState({
        editIndex: item.machineDailyReportDetails.length === 0 ? 0 : item.machineDailyReportDetails.length - 1
      });

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
  componentDidMount() {

    if (this.machineReportInfo.length === 0) {
      this.$f7router.navigate(APP_DIR_PATH + '/report', { reloadAll: true });
      return;
    }

    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(res => {
        me.setState({ dict: res });

      }).catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

  }

  /**
   * 
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
    });
  }

  /**
   * 
   */
  reportDateCalendarCreate() {
    var me = this;
    const app = me.$f7;
    me.reportDateCalendar = app.calendar.create(
      CalendarUtil.getCalendarProperties('#machine-stop-time-reg-report-date', {
        change: function (calendar, value) {
          let newDate = moment(new Date(value)).format('YYYY/MM/DD');
          if (me.state.reportDate !== newDate) {
            me.setState({
              reportDate: newDate
            });

            me.getSearchTime(newDate);
            if (me.state.startDatetimeStr === '' && me.state.endDatetimeStr === '') {
              me.createPickerTime();
            } else {
              let startDatetimeStr = '';
              let endDatetimeStr = '';
              if (me.state.startDatetimeStr !== '') {
                let oldTime = new Date(me.state.startDatetimeStr);
                startDatetimeStr = moment(new Date(newDate)).format('YYYY/MM/DD ') + oldTime.getHours() + ':' + oldTime.getMinutes() + ':00';
              } else {
                startDatetimeStr = moment(new Date(newDate)).format('YYYY/MM/DD ') + me.state.businessStartTime;
              }
              if (me.state.endDatetimeStr !== '') {
                let oldTime = new Date(me.state.endDatetimeStr);
                endDatetimeStr = moment(new Date(newDate)).add(1, 'days').format('YYYY/MM/DD ') + oldTime.getHours() + ':' + oldTime.getMinutes() + ':00';
              } else {
                endDatetimeStr = moment(new Date(newDate)).add(1, 'days').format('YYYY/MM/DD ') + me.state.businessStartTime;
              }

              startDatetimeStr = moment(new Date(startDatetimeStr)).format('YYYY/MM/DD HH:mm');
              endDatetimeStr = moment(new Date(endDatetimeStr)).format('YYYY/MM/DD HH:mm');
              if(me.state.startDatetimeStr !== ''){
                me.startTimePicker.setValue(me.converDateStrToArr(startDatetimeStr), 0);
              }
              if(me.state.endDatetimeStr !== ''){
                me.endTimePicker.setValue(me.converDateStrToArr(endDatetimeStr), 0);
              }
              let costMinutes = 0;
              if(me.state.startDatetimeStr !== '' && me.state.endDatetimeStr !== ''){
                costMinutes = me.calcCostMinutes(startDatetimeStr, endDatetimeStr);
              }

              me.setState({
                reportDate: newDate,
                startDatetimeStr: me.state.startDatetimeStr === '' ? '' : moment(new Date(startDatetimeStr)).format('YYYY/MM/DD HH:mm'),
                endDatetimeStr: me.state.endDatetimeStr === '' ? '' : moment(new Date(endDatetimeStr)).format('YYYY/MM/DD HH:mm'),
                costMinutes: (me.state.startDatetimeStr === '' || me.state.endDatetimeStr === '') ? 0 : costMinutes
              });
            }
          }
        },
      })
    );
  }

  /**
     * ページ初期処理
     */
  onPageInit() {
    if (this.machineReportInfo.length === 0) {
      this.$f7router.navigate(APP_DIR_PATH + '/report', { reloadAll: true });
      return;
    }

    let editIndex = parseInt(this.$f7route.query.editIndex);
    this.setState({
      editIndex: editIndex
    });

    // 停止時間追加とき、各項目を初期化
    let modified = false;
    if (1 === parseInt(this.$f7route.query.optFlg) || 4 === parseInt(this.$f7route.query.optFlg)) {
      this.setState({
        modified: modified
      });

      if (4 === parseInt(this.$f7route.query.optFlg)) {
        let currentItmeIndex = parseInt(this.$f7route.query.currentItmeIndex);
        let addItem = {
          startDatetimeStr: moment(new Date(this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].startDatetimeStr)).format('YYYY/MM/DD HH:mm'),
          endDatetimeStr: moment(new Date(this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].endDatetimeStr)).format('YYYY/MM/DD HH:mm'),
          added: true,
          modified: false,
          deleted: false,
          detailType: 3,
          machineDailyReportProdDetails: [],
          downtimeComment: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].downtimeComment,
          durationMinitues: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].durationMinitues,
          machineDowntimeId: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].machineDowntimeId,
          reportId: this.machineReportInfo.id,
          work: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].work,
          reportDate: this.machineReportInfo.reportDate,
          operatingFlg: 0,
          disposedShotCount: 0,
          productionEndFlg: 0,
          shotCount: 0,
          workEndFlg: 0,
        };
        this.machineReportInfo.machineDailyReportDetails.push(addItem);
        this.setState({
          downtimeComment: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].downtimeComment,
          durationMinitues: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].durationMinitues,
          machineDowntimeId: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].machineDowntimeId,
          downtimeReason: this.machineReportInfo.machineDailyReportDetails[currentItmeIndex].work
        });
      } else {
        let addItem = {
          startDatetimeStr: '',
          endDatetimeStr: '',
          added: true,
          modified: false,
          deleted: false,
          detailType: 3,
          machineDailyReportProdDetails: [],
          downtimeComment: '',
          durationMinitues: 0,
          machineDowntimeId: '',
          reportId: this.machineReportInfo.id,
          work: '',
          reportDate: this.machineReportInfo.reportDate,
          operatingFlg: 0,
          disposedShotCount: 0,
          productionEndFlg: 0,
          shotCount: 0,
          workEndFlg: 0,
        };
        this.machineReportInfo.machineDailyReportDetails.push(addItem);
      }

    } else {
      modified = true;
      this.setState({
        modified: modified,
        downtimeComment: this.machineReportInfo.machineDailyReportDetails[editIndex].downtimeComment,
      });
      this.machineReportInfo.machineDailyReportDetails[editIndex].modified = true;
    }

    var me = this;
    let startDatetimeStr = '';
    let endDatetimeStr = '';
    if (modified || 4 === parseInt(this.$f7route.query.optFlg)) { //編集の時
      startDatetimeStr = moment(new Date(this.machineReportInfo.machineDailyReportDetails[editIndex].startDatetimeStr)).format('YYYY/MM/DD HH:mm');
      endDatetimeStr = moment(new Date(this.machineReportInfo.machineDailyReportDetails[editIndex].endDatetimeStr)).format('YYYY/MM/DD HH:mm');
    }
    me.setState({
      reportDate: moment(new Date(this.machineReportInfo.reportDate)).format('YYYY/MM/DD'),
      machineName: this.machineReportInfo.machineName,
      machineUuid: this.machineReportInfo.machineUuid,
      startDatetimeStr: startDatetimeStr,
      endDatetimeStr: endDatetimeStr
    });

    Report.downtime({ 'orderByDowntimeCode': 'downtimeCode' })
      .then(res => {
        me.mstMachineDowntimes = res.mstMachineDowntimes;

        if (!this.state.modified) {//追加の時作成
          me.reportDateCalendarCreate();
        }

        DictionaryLoader.getDictionary(this.state.dict)
          .then(res => {
            me.setState({ dict: res });
            me.createPickerTime();
            me.createPickerStopReason(true);
          });

      });
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  /**
   * 
   * @param {*} setDefault 
   */
  createPickerStopReason(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];

    var defaultValue = null;
    var defaultName = null;
    let editIndex = this.state.editIndex;
    for (var i = 0; i < me.mstMachineDowntimes.length; i++) {
      let mstMachineDowntime = me.mstMachineDowntimes[i];
      _values.push(mstMachineDowntime.id);
      _displayValues.push(mstMachineDowntime.downtimeReason);
      if (this.machineReportInfo.machineDailyReportDetails[editIndex].machineDowntimeId === mstMachineDowntime.id) {
        defaultValue = mstMachineDowntime.id;
        defaultName = mstMachineDowntime.downtimeReason;
      }
    }
    if (me.pickerReason) {
      me.pickerReason.destroy();
    }
    me.pickerReason = me.createPicker('#machine-stop-time-reg-stop-reason', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValues) => {
        // if (this.machineReportInfo.machineDailyReportDetails[editIndex].machineDowntimeId !== value) {
        me.setState({ machineDowntimeId: value });
        me.setState({ downtimeReason: displayValues });
        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex]['machineDowntimeId'] = value;
        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex]['work'] = displayValues;
        // }
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerReason.setValue([defaultValue], 0);
      me.setState({ machineDowntimeId: defaultValue });
      me.setState({ downtimeReason: defaultName });
    }
  }

  /**
   * 
   */
  convertDateArrToStr(arr) {
    var newArr = [...arr];
    var front = newArr.splice(0, 3);
    front = front.map(function (ele) {
      if (ele < 10) {
        ele = '0' + String(ele);
      }
      return ele;
    });

    var back = newArr;
    back = back.map(function (ele) {
      if (ele < 10) {
        ele = '0' + String(ele);
      }
      return ele;
    });
    return front.join('/') + ' ' + back.join(':');
  }

  /**
   * 
   * @param {*} str 
   */
  converDateStrToArr(str) {
    var arr = [];
    var front = str.split(' ')[0];
    var back = str.split(' ')[1];
    arr = front.split('/').concat(back.split(':'));
    arr = arr.map(function (item) {
      return parseInt(item);
    });
    return arr;
  }

  /**
   * 
   */
  createPickerTime() {
    var me = this;
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
    if (this.endTimePicker) {
      this.endTimePicker.destroy();
    }
    const f7app = this.$f7;
    //init datetime picker
    this.startTimePicker = CalendarUtil.createDateTimePicker(f7app, this.state.dict.close, '#machine-stop-time-reg-start-time');
    this.endTimePicker = CalendarUtil.createDateTimePicker(f7app, this.state.dict.close, '#machine-stop-time-reg-end-time');

    // 業務開始時刻
    var businessStartTime = this.state.businessStartTime;

    if (this.state.modified || 4 === parseInt(this.$f7route.query.optFlg)) {//edit
      this.startTimePicker.setValue(this.converDateStrToArr(this.state.startDatetimeStr), 0);
      this.endTimePicker.setValue(this.converDateStrToArr(this.state.endDatetimeStr), 0);
    } else {//add
      //開始登録時の時刻をセット
      //新規登録のときの初期値はブランクだが、ピッカーを開いたときの初期選択値は日付で指定されている営業日の業務開始時刻。
      var startTime = moment(this.state.reportDate + ' ' + businessStartTime).format('YYYY/MM/DD HH:mm');
      this.startTimePicker.setValue(this.converDateStrToArr(startTime), 0);
      // 終了時刻、新規登録のときの初期値はブランクだが、ピッカーを開いたときの初期選択値は開始時刻。
      // 開始時刻がブランクのときは日付で指定されている営業日の業務開始時刻<div className="">
      var endTime;
      if (this.state.startDatetimeStr === '') {
        endTime = moment(this.state.reportDate + ' ' + businessStartTime).format('YYYY/MM/DD HH:mm');
      } else {
        endTime = moment(this.state.startDatetimeStr).format('YYYY/MM/DD HH:mm');
      }
      this.endTimePicker.setValue(this.converDateStrToArr(endTime), 0);
      this.setState({
        startDatetimeStr: '',
        endDatetimeStr: '',
      });
    }

    // 時間計算
    if (this.state.startDatetimeStr !== '' && this.state.endDatetimeStr !== '') {
      this.setState({
        costMinutes: me.calcCostMinutes(this.state.startDatetimeStr, this.state.endDatetimeStr)
      });
    }

    //start date  
    this.startTimePicker.on('change', function (picker, value) {
      me.setState({
        startDatetimeStr: me.convertDateArrToStr(value),
      });
      
      if (me.state.endDatetimeStr !== '') {
        let minutes = me.calcCostMinutes(me.convertDateArrToStr(value), me.state.endDatetimeStr);
        me.setState({
          costMinutes: minutes
        });

        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr = me.convertDateArrToStr(value);
        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr = me.state.endDatetimeStr;
        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = minutes;
      }

      if (me.state.endDatetimeStr === '') {
        var endTime = moment(me.convertDateArrToStr(value)).format('YYYY/MM/DD HH:mm');
        me.endTimePicker.setValue(me.converDateStrToArr(endTime), 0);
        me.setState({
          endDatetimeStr: ''
        });
      }
    });

    // end date
    this.endTimePicker.on('change', function (picker, value) {
      me.setState({
        endDatetimeStr: me.convertDateArrToStr(value) + ''
      });
      if (me.state.startDatetimeStr !== '') {
        let minutes = me.calcCostMinutes(me.state.startDatetimeStr, me.convertDateArrToStr(value));
        me.setState({
          costMinutes: minutes
        });

        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr = me.state.startDatetimeStr;
        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr = me.convertDateArrToStr(value);
        me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = minutes;
      }
    });
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
   * ページ終了処理
   */
  onPageBeforeRemove() {

  }

  /**
   * 
   * @param {*} str 
   */
  calcDays(str) {

    var momentObj = moment(this.state.reportDate, 'YYYY/MM/DD');
    var newDate = '';
    if (str === 'subtr') {
      newDate = momentObj.subtract(1, 'days').format('YYYY/MM/DD');
    } else if (str === 'plus') {
      newDate = momentObj.add(1, 'days').format('YYYY/MM/DD');
    }

    this.getSearchTime(newDate);

    let startDatetimeStr = '';
    let endDatetimeStr = '';
    if (this.state.startDatetimeStr !== '') {
      let oldTime = new Date(this.state.startDatetimeStr);
      startDatetimeStr = moment(new Date(newDate)).format('YYYY/MM/DD ') + oldTime.getHours() + ':' + oldTime.getMinutes();
    } else {
      startDatetimeStr = moment(new Date(newDate)).format('YYYY/MM/DD ') + this.state.businessStartTime;
    }
    if (this.state.endDatetimeStr !== '') {
      let oldTime = new Date(this.state.endDatetimeStr);
      endDatetimeStr = moment(new Date(newDate)).add(1, 'days').format('YYYY/MM/DD ') + oldTime.getHours() + ':' + oldTime.getMinutes();
    } else {
      endDatetimeStr = moment(new Date(newDate)).add(1, 'days').format('YYYY/MM/DD ') + this.state.businessStartTime;
    }

    startDatetimeStr = moment(new Date(startDatetimeStr)).format('YYYY/MM/DD HH:mm');
    endDatetimeStr = moment(new Date(endDatetimeStr)).format('YYYY/MM/DD HH:mm');

    this.startTimePicker.setValue(this.converDateStrToArr(startDatetimeStr), 0);
    this.endTimePicker.setValue(this.converDateStrToArr(endDatetimeStr), 0);

    let costMinutes = this.calcCostMinutes(startDatetimeStr, endDatetimeStr);
    this.setState({
      reportDate: newDate,
      startDatetimeStr: this.state.startDatetimeStr === '' ? '' : moment(new Date(startDatetimeStr)).format('YYYY/MM/DD HH:mm'),
      endDatetimeStr: this.state.endDatetimeStr === '' ? '' : moment(new Date(endDatetimeStr)).format('YYYY/MM/DD HH:mm'),
      costMinutes: (this.state.startDatetimeStr === '' || this.state.endDatetimeStr === '') ? 0 : costMinutes
    });

  }

  /**
   * 
   * @param {*} event 
   */
  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.name === 'downtimeComment') {
      this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].downtimeComment = event.target.value;
    }
  }

  /**
   * 
   * @param {*} event 
   */
  onClear(event) {
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'downtimeComment') {
      this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].downtimeComment = '';
    }
    if (event.target.name === 'downtimeReason') {
      this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].work = '';
      this.createPickerStopReason(false);
    }
  }

  /**
     * 戻る
     */
  onBackClick() {
    this.backMachineReportInfo.reload = '2';
    this.props.updateMachineReportInfo(this.backMachineReportInfo);
    this.$f7router.navigate(APP_DIR_PATH + '/report-detail', { pushState: false, reloadAll: true });
  }

  /**
   * 
   */
  onCancel() {
    this.backMachineReportInfo.reload = '2';
    this.props.updateMachineReportInfo(this.backMachineReportInfo);
    this.$f7router.navigate(APP_DIR_PATH + '/report-detail', { pushState: false, reloadAll: true });
  }

  /**
   * 
   */
  okButton() {
    let me = this;

    if (this.state.startDatetimeStr === '') {
      this.setState({ msgStartDatetime: this.state.dict.msg_error_not_null });
      return;
    } else {
      this.setState({ msgStartDatetime: '' });
    }

    if (this.state.endDatetimeStr === '') {
      this.setState({ msgEndDatetime: this.state.dict.msg_error_not_null });
      return;
    } else {
      this.setState({ msgEndDatetime: '' });
    }

    if (this.state.downtimeReason === '') {
      this.setState({ msgStopReason: this.state.dict.msg_error_not_null });
      return;
    } else {
      this.setState({ msgStopReason: '' });
    }

    let reportDate = new Date(me.state.reportDate + ' ' + me.state.businessStartTime);
    let startDatetimeStr = new Date(me.state.startDatetimeStr + ':00');
    if (startDatetimeStr.getTime() < reportDate.getTime()) {
      me.setState({
        msgStartDatetime: me.state.dict.msg_error_producint_work_datetime_order//
      });
      return;
    } else {
      me.setState({
        msgStartDatetime: ''
      });
    }

    let endDatetimeStr = new Date(me.state.endDatetimeStr + ':00');
    reportDate = new Date(moment(reportDate).add(1, 'days'));//reportDate.add(1, 'days');

    if (endDatetimeStr.getTime() > reportDate.getTime()) {
      me.setState({
        msgEndDatetime: me.state.dict.msg_error_next_day_actual_work_datetime_order //msg_error_next_day_actual_work_datetime_order msg_error_work_datetime_order
      });
      return;
    } else {
      me.setState({
        msgEndDatetime: ''
      });
    }

    if (startDatetimeStr.getTime() > endDatetimeStr.getTime()) {
      me.setState({
        msgStartDatetime: me.state.dict.msg_error_work_datetime_order//msg_error_work_datetime_order
      });
      return;
    } else {
      me.setState({
        msgStartDatetime: ''
      });
    }
    this.machineReportInfo.isChaged = '1';
    this.machineReportInfo.added = me.backMachineReportInfo.added ? true : me.state.modified ? false : true;
    this.machineReportInfo.reload = '1';
    this.props.updateMachineReportInfo(this.machineReportInfo);
    // this.$f7router.back();
    this.$f7router.navigate(APP_DIR_PATH + '/report-detail', { pushState: false, reloadAll: true });
  }

  /**
   * 
   */
  render() {
    let reportDate = moment(new Date(this.state.reportDate)).format('YYYY/MM/DD');
    return (
      <DocumentTitle title={this.state.dict.machine_daily_report_reference}>
        <Page
          id="machine-stop-time-reg'"
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          infinitePreloader={false}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.machine_report_add_downtime}</BlockTitle>
          <Block>
            <Row>
              <Col width="40">{this.state.dict.machine_name}</Col>
              <Col width="60">{this.state.machineName}</Col>
            </Row>
            <Row>
              <Col width="30">
                <Label style={{ textAlign: 'right' }}>{this.state.dict.machine_report_date} </Label>
              </Col>
            </Row>
            <Row style={{ alignItems: 'center' }}>
              <Col width="20">
                <Button fill
                  small
                  color="blue"
                  disabled={this.state.modified}
                  onClick={() => this.calcDays('subtr')}>{'<'}</Button>
              </Col>
              <Col>
                <Input
                  inputStyle={{ textAlign: 'center' }}
                  type="text"
                  name="reportDate"
                  value={reportDate}
                  readonly
                  inputId='machine-stop-time-reg-report-date' />
              </Col>
              <Col width="20">
                <Button fill small
                  disabled={this.state.modified}
                  color="blue"
                  onClick={() => this.calcDays('plus')}>{'>'}</Button>
              </Col>
            </Row>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.production_start_time + this.state.required}</Label>
                <Input type="text"
                  name="startDatetimeStr"
                  readonly
                  errorMessage={this.state.msgStartDatetime}
                  errorMessageForce={this.state.msgStartDatetime !== ''}
                  inputId="machine-stop-time-reg-start-time"
                  value={this.state.startDatetimeStr} />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.production_end_time + this.state.required}</Label>
                <Input type="text"
                  name="endDatetimeStr"
                  readonly
                  errorMessage={this.state.msgEndDatetime}
                  errorMessageForce={this.state.msgEndDatetime !== ''}
                  inputId="machine-stop-time-reg-end-time"
                  value={this.state.endDatetimeStr} />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.duration_minutes}</Label>
                <Input type="number" name="workingTimeMinutes" value={this.state.costMinutes}
                  readonly
                  inputId="machine-stop-time-reg-working-time-minutes" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.downtime_reason + this.state.required}</Label>
                <Input type="text" name="downtimeReason"
                  readonly
                  clearButton
                  value={this.state.downtimeReason}
                  onInputClear={this.onClear.bind(this)}
                  errorMessage={this.state.msgStopReason}
                  errorMessageForce={this.state.msgStopReason !== ''}
                  inputId="machine-stop-time-reg-stop-reason" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.machine_inventory_remarks}</Label>
                <Input
                  type="textarea"
                  name="downtimeComment"
                  clearButton
                  value={this.state.downtimeComment}
                  onInputClear={this.onClear.bind(this)}
                  inputId="machine-stop-time-reg-remarks"
                  onChange={this.onChange.bind(this)}
                  maxlength={200} />
              </ListItem>
            </List>
          </Block>
          <Block>
            <Row>
              <Col width="50">
                <Button fill text={this.state.dict.ok} onClick={this.okButton.bind(this)}></Button>
              </Col>
              <Col width="50">
                <Button fill raised onClick={this.onCancel.bind(this)} text={this.state.dict.cancel} ></Button>
              </Col>
            </Row>
          </Block>
        </Page>
      </DocumentTitle >
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
    }

  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineStopTimeReg);