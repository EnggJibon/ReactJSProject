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
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  Icon
} from 'framework7-react';

import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import System from 'karte/shared/master/system';
import moment from 'moment';
import { connect } from 'react-redux';
import { updateMachineReportInfo, clearMachineReport } from 'karte/apps/machine/reducers/machine-report-reducer';
import SigmaGunshi from '../../logics/sigma-gunshi';

class MachineProductionCountPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        machine_name: '',
        sp_daily_report: '',
        production_end: '',
        machine_report_date: '',
        production_start_time: '',
        production_end_time: '',
        duration_minutes: '',
        disposed_shot_count: '',
        shot_count: '',
        component_code: '',
        count_per_shot: '',
        defect_count: '',
        complete_count: '',
        production_start_user: '',
        work_phase: '',
        mold_id: '',
        mold_name: '',
        direction_code: '',
        component_name: '',
        procedure_code: '',
        close: '',
        next: '',
        registration: '',
        cancel: '',
        ok: '',
        yes: '',
        msg_error_not_null: '',
        msg_error_over_length_with_item: '',
        msg_error_producint_work_datetime_order: '',
        msg_error_work_datetime_order: '',
        msg_error_next_day_actual_work_datetime_order: '',
        msg_error_num_over_zero: '',
        lot_number: '',
        //必要な文言をここに足す
      },

      //表示のみ項目
      required:'',
      userName: '',
      directionCode: '',
      moldId: '',
      moldName: '',
      workPhase: '',
      machineName: '',

      startDatetimeStr: '',
      endDatetimeStr: '',
      durationMinitues: 0,
      disposedShotCount: 0,
      shotCount: 0,
      completeCount: 0,


      msgStartDatetime: '',
      msgEndDatetime: '',
      msgModalStartDatetime: '',
      msgModalEndDatetime: '',

      businessStartTime: '',
      accordionBasicOpened: false,
      machineDailyReportProdDetails: [],
      modalIsOpen: false,
      editIndex: 0,
      productionEndFlg: 0,
    };

    this.status = false;
    this.checkResult = false;
    this.productionLots = [];
    this.pickerProductionLots = {};
    this.shotCountStartDateTime= moment(new Date()).format('YYYY/MM/DDHH:mm:ss');
    this.shotCountEndDateTime= moment(new Date()).format('YYYY/MM/DDHH:mm:ss');
    this.machineReportInfo = props.reportInfo;

    this.backMachineReportInfo = JSON.parse(JSON.stringify(this.machineReportInfo));//キャンセル時用

  }

  /**
   * 
   */
  componentDidMount() {

    if (this.machineReportInfo.length === 0) {
      this.$f7router.navigate(APP_DIR_PATH + '/report', { reloadAll: true });
      return;
    }

    this.setState({
      editIndex: parseInt(this.$f7route.query.editIndex)
    });

    var me = this;
    Promise.all([
      DictionaryLoader.getDictionary(this.state.dict),
      System.load(['system.business_start_time'])
    ]).then(res => {

      let machineDailyReportDetail = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex];
      let machineDailyReportProdDetails = machineDailyReportDetail.machineDailyReportProdDetails;
      let lotNumber = '';
      if (machineDailyReportDetail['lotNumber'] !== undefined) {
        lotNumber = machineDailyReportDetail['lotNumber'];
      }
      for (var key in machineDailyReportProdDetails) {
        let value = machineDailyReportProdDetails[key];
        if ((value['material01Id'] !== undefined && value['material01Id'] !== '') ||
          (value['material02Id'] !== undefined && value['material02Id'] !== '') ||
          (value['material03Id'] !== undefined && value['material03Id'] !== '')) {
          this.status = true;
        }
        machineDailyReportProdDetails[key]['lotNumber'] = lotNumber;
        if (value['componentLotNumberList']) {
          me.productionLots.push(value['componentLotNumberList']);
        } else {
          me.productionLots.push([]);
        }
      }

      let endDatetimeStr = machineDailyReportDetail.endDatetimeStr === '' ? '' : moment(new Date(machineDailyReportDetail.endDatetimeStr)).format('YYYY/MM/DD HH:mm');

      let newDate = moment(new Date()).format('YYYY/MM/DD');
      if (machineDailyReportDetail.endDatetimeStr === '') {
        if (new Date(me.machineReportInfo.reportDate).getTime() === new Date(newDate).getTime()) {
          endDatetimeStr = moment(new Date()).format('YYYY/MM/DD HH:mm');
        } else if (new Date(me.machineReportInfo.reportDate).getTime() > new Date(newDate).getTime()) {
          endDatetimeStr = (moment(new Date(me.machineReportInfo.reportDate)).add(1, 'days').format('YYYY/MM/DD')) + ' ' + res[1].cnfSystems[0].configValue;
        }
      }

      me.setState({
        businessStartTime: res[1].cnfSystems[0].configValue,
        dict: res[0],
        reportDate: me.machineReportInfo.reportDate,
        startDatetimeStr: moment(new Date(machineDailyReportDetail.startDatetimeStr)).format('YYYY/MM/DD HH:mm'),
        endDatetimeStr: moment(new Date(endDatetimeStr)).format('YYYY/MM/DD HH:mm'),
        durationMinitues: machineDailyReportDetail.durationMinitues,
        userName: machineDailyReportDetail.workerName,
        disposedShotCount: machineDailyReportDetail.disposedShotCount,
        directionCode: machineDailyReportDetail.directionCode,
        shotCount: machineDailyReportDetail.shotCount,
        moldId: machineDailyReportDetail.moldId,
        moldName: machineDailyReportDetail.moldName,
        workPhase: machineDailyReportDetail.work,
        machineName: me.machineReportInfo.machineName,

        machineDailyReportProdDetails,
        productionEndFlg: parseInt(machineDailyReportDetail.productionEndFlg)
      }, () => {
        me.loadCalendar();
        me.loadLotNumber();
      });



    }).catch((err) => {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }


  /**
   * componentWillReceiveProps
   * @param {*} newProps 
   */
  UNSAFE_componentWillReceiveProps(newProps) {
    this.machineReportInfo = newProps.reportInfo;
    this.setState({
      machineDailyReportProdDetails: newProps.reportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails
    });
  }

  /**
   * 
   */
  loadCalendar(startTimeId, endTimeId) {

    var me = this;
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
    if (this.endTimePicker) {
      this.endTimePicker.destroy();
    }
    const app = this.$f7;
    this.startTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, startTimeId ? startTimeId : '#machine-production-count-page-start-time');

    var startDatetimeStr = moment(new Date(this.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr)).format('YYYY/MM/DD HH:mm');

    let endDatetimeStr = me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr === '' ? '' : moment(new Date(this.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr)).format('YYYY/MM/DD HH:mm');

    if (me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr === '') {
      let newDate = moment(new Date()).format('YYYY/MM/DD');
      if (new Date(me.state.reportDate).getTime() === new Date(newDate).getTime()) {
        endDatetimeStr = moment(new Date()).format('YYYY/MM/DD HH:mm');
      } else if (new Date(me.state.reportDate).getTime() > new Date(newDate).getTime()) {
        endDatetimeStr = (moment(new Date(me.state.reportDate)).add(1, 'days').format('YYYY/MM/DD')) + ' ' + this.state.businessStartTime;
      }
    }

    me.setState({
      durationMinitues: me.calcCostMinutes(startDatetimeStr, endDatetimeStr)
    });
    me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(startDatetimeStr, endDatetimeStr);

    this.startTimePicker.setValue(this.converDateStrToArr(startDatetimeStr), 0);
    this.startTimePicker.on('change', function (picker, value) {

      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr = moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(startDatetimeStr).getSeconds())).format('YYYY/MM/DD HH:mm');
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(me.convertDateArrToStr(value), me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr);
      me.setState({
        msgStartDatetime: '',
        msgModalStartDatetime: '',
        startDatetimeStr: moment(me.convertDateArrToStr(value)).format('YYYY/MM/DD HH:mm'),
        durationMinitues: me.calcCostMinutes(me.convertDateArrToStr(value), me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr)
      });

    });

    //終了日付に現在時刻をデフォルトセット
    this.endTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, endTimeId ? endTimeId : '#machine-production-count-page-end-time');
    me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr = endDatetimeStr;
    this.endTimePicker.setValue(this.converDateStrToArr(endDatetimeStr), 0);

    this.endTimePicker.on('change', function (picker, value) {
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr = moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(endDatetimeStr).getSeconds())).format('YYYY/MM/DD HH:mm');
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr, me.convertDateArrToStr(value));
      me.setState({
        msgEndDatetime: '',
        msgModalEndDatetime: '',
        endDatetimeStr: moment(me.convertDateArrToStr(value)).format('YYYY/MM/DD HH:mm'),
        durationMinitues: me.calcCostMinutes(me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr, me.convertDateArrToStr(value))
      });

    });
  }

  /**
   * 
   */
  onPageInit() {

    if (this.machineReportInfo.length === 0) {
      this.$f7router.navigate(APP_DIR_PATH + '/report', { reloadAll: true });
      return;
    }
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  /**
   * 
   */
  onBackClick() {

    this.backMachineReportInfo.reload = '2';
    this.props.updateMachineReportInfo(this.backMachineReportInfo);
    let query = {
      machineUuid: this.backMachineReportInfo.machineUuid,
      machineId: this.backMachineReportInfo.machineId,
      machineName: this.backMachineReportInfo.machineName,
      reportDate: this.backMachineReportInfo.reportDate,
      department: this.backMachineReportInfo.department,
    };
    let params = Object.keys(query).map(function (key) {
      if (query[key]) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
      } else {
        return '';
      }
    }).join('&');
    this.$f7router.navigate(APP_DIR_PATH + '/report-detail?' + params, { pushState: true, reloadAll: true });
  }

  /**
   * 
   */
  onPageBeforeRemove() {

    let me = this;
    if (me.startDatetimeCalendar) {
      me.startDatetimeCalendar.destroy();
    }
    if (me.endDatetimeCalendar) {
      me.endDatetimeCalendar.destroy();
    }
  }

  /**
   * 
   * @param {*} item 
   * @param {*} event 
   */
  handleChange(item, event) {


    if (!isNaN(Number(item))) {
      let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
      machineDailyReportProdDetails[item][event.target.name] = event.target.value;
      if (event.target.name === 'countPerShot') {
        machineDailyReportProdDetails[item]['completeCount'] = Number(this.state.shotCount) * event.target.value - Number(machineDailyReportProdDetails[item].defectCount);
      }
      if (event.target.name === 'defectCount') {
        machineDailyReportProdDetails[item]['completeCount'] = Number(this.state.shotCount) * Number(machineDailyReportProdDetails[item].countPerShot) - event.target.value;
      }
      this.setState({
        machineDailyReportProdDetails: machineDailyReportProdDetails
      });

    } else {
      this.setState({ [item.target.name]: item.target.value });
      if (item.target.name === 'shotCount') {
        // 完成数 = ショット数 * 取り数 - 不良数
        let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
        for (let key in machineDailyReportProdDetails) {
          let value = machineDailyReportProdDetails[key];
          machineDailyReportProdDetails[key]['completeCount'] = Number(item.target.value) * Number(value.countPerShot) - Number(value.defectCount);
        }
        this.setState({
          machineDailyReportProdDetails: machineDailyReportProdDetails
        });
      }
    }
  }

  /**
   * 
   * @param {*} item 
   * @param {*} event 
   */
  handleClear(item, event) {
    if (!isNaN(Number(item))) {
      let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
      machineDailyReportProdDetails[item][event.target.name] = '';
      if (event.target.name === 'countPerShot') {
        machineDailyReportProdDetails[item]['completeCount'] = Number(this.state.shotCount) * 0 - Number(machineDailyReportProdDetails[item].defectCount);
      }
      if (event.target.name === 'defectCount') {
        machineDailyReportProdDetails[item]['completeCount'] = Number(this.state.shotCount) * Number(machineDailyReportProdDetails[item].countPerShot) - 0;
      }
      this.setState({
        machineDailyReportProdDetails: machineDailyReportProdDetails
      });
    } else {
      this.setState({ [item.target.name]: '' });
      if (item.target.name === 'shotCount') {
        let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
        for (let key in machineDailyReportProdDetails) {
          let value = machineDailyReportProdDetails[key];
          machineDailyReportProdDetails[key]['completeCount'] = 0 * Number(value.countPerShot) - Number(value.defectCount);
        }
        this.setState({
          machineDailyReportProdDetails: machineDailyReportProdDetails
        });
      }
    }
  }

  /**
   * 不良数登録
   * @param {*} index 
   */
  buttonDefectCount(index) {
    this.props.updateMachineReportInfo(this.machineReportInfo);
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/report-defect-register?currentComponentCodeIndex=' + index + '&editIndex=' + this.state.editIndex, { pushState: true });
  }

  /**
   * 生産実績に材料情報がひとつもないときはこのボタンを「登録」
   */
  buttonRegistration() {
    this.checkData();
    if (this.checkResult) {
      return;
    }
    this.openModal();
  }

  /**
   * 
   */
  openModal() {
    this.setState({ modalIsOpen: true });
  }

  /**
   * 
   */
  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  /**
   * 
   */
  afterOpenModal() {
    var me = this;
    if (this.startTimePickerModal) {
      this.startTimePickerModal.destroy();
    }
    if (this.startTimePickerModal) {
      this.endTimePickerModal.destroy();
    }
    const app = this.$f7;
    this.startTimePickerModal = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#machine-production-count-page-modal-start-time');

    var startDatetimeStr = moment(new Date(this.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr)).format('YYYY/MM/DD HH:mm');
    let endDatetimeStr = me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr === '' ? '' : moment(new Date(this.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr)).format('YYYY/MM/DD HH:mm');

    if (me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr === '') {
      let newDate = moment(new Date()).format('YYYY/MM/DD');
      if (new Date(me.state.reportDate).getTime() === new Date(newDate).getTime()) {
        endDatetimeStr = moment(new Date()).format('YYYY/MM/DD HH:mm');
      } else if (new Date(me.state.reportDate).getTime() > new Date(newDate).getTime()) {
        endDatetimeStr = (moment(new Date(me.state.reportDate)).add(1, 'days').format('YYYY/MM/DD')) + ' ' + this.state.businessStartTime;
      }
    }

    me.setState({
      durationMinitues: me.calcCostMinutes(startDatetimeStr, endDatetimeStr)
    });
    me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(startDatetimeStr, endDatetimeStr);

    this.startTimePickerModal.setValue(this.converDateStrToArr(startDatetimeStr), 0);
    this.startTimePickerModal.on('change', function (picker, value) {
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr = moment(new Date(me.convertDateArrToStr(value))).format('YYYY-MM-DDTHH:mm');
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(me.convertDateArrToStr(value), me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr);
      me.setState({
        msgStartDatetime: '',
        msgModalStartDatetime: '',
        startDatetimeStr: moment(me.convertDateArrToStr(value)).format('YYYY/MM/DD HH:mm'),
        durationMinitues: me.calcCostMinutes(me.convertDateArrToStr(value), me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr)
      });

    });

    //終了日付に現在時刻をデフォルトセット
    this.endTimePickerModal = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#machine-production-count-page-modal-end-time');
    this.endTimePickerModal.setValue(this.converDateStrToArr(endDatetimeStr), 0);
    this.endTimePickerModal.on('change', function (picker, value) {

      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr = moment(new Date(me.convertDateArrToStr(value))).format('YYYY-MM-DDTHH:mm');
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr, me.convertDateArrToStr(value));
      me.setState({
        msgEndDatetime: '',
        msgModalEndDatetime: '',
        endDatetimeStr: moment(me.convertDateArrToStr(value)).format('YYYY/MM/DD HH:mm'),
        durationMinitues: me.calcCostMinutes(me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr, me.convertDateArrToStr(value))
      });

    });
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
   * @param {*} arr 
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

  getShotCountFromLog(){
    var me = this;
    me.shotCountStartDateTime= moment(me.state.startDatetimeStr).format('YYYY/MM/DD HH:mm:ss');
    me.shotCountEndDateTime = moment(me.state.endDatetimeStr).format('YYYY/MM/DD HH:mm:ss');
    SigmaGunshi.loadShotCountFromLog({
      machineId: me.backMachineReportInfo.machineId,
      startDateTime: me.shotCountStartDateTime,
      endDateTime: me.shotCountEndDateTime
    })
      .then((response) =>{
        me.setState({shotCount: response.shotCount});
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * 
   */
  buttonOk() {

    //開始登録時の時刻をセット
    var businessStartTime = this.state.businessStartTime;
    if (businessStartTime.length === 0) {
      businessStartTime = '08:00:00';
    } else if (businessStartTime.length === 4) {
      businessStartTime = '0' + businessStartTime + ':00';
    }

    var reportStartTime = new Date(moment(this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].reportDate).format('YYYY/MM/DD ' + businessStartTime));
    var reportEndTime = new Date(moment(this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].reportDate).add(1, 'days').format('YYYY/MM/DD ' + businessStartTime));

    // 業務開始時刻より前、業務終了時間より後の値は許容しない。
    let checkDate = new Date(moment(this.state.startDatetimeStr).format('YYYY/MM/DD HH:mm:00'));
    if (checkDate.getTime() < reportStartTime.getTime()) {
      this.setState({
        msgModalStartDatetime: this.state.dict.msg_error_producint_work_datetime_order,
      });

      return;
    } else {
      this.setState({
        msgModalStartDatetime: ''
      });
    }

    let checkEndDate = new Date(moment(this.state.endDatetimeStr).format('YYYY/MM/DD HH:mm:00'));
    if (checkDate.getTime() > reportEndTime.getTime() || checkDate.getTime() > checkEndDate.getTime()) {
      this.setState({
        msgModalStartDatetime: this.state.dict.msg_error_work_datetime_order,
      });

      return;
    } else {
      this.setState({
        msgModalStartDatetime: ''
      });
    }

    // 業務開始時刻より前、業務終了時間より後の値は許容しない。
    if (checkEndDate.getTime() > reportEndTime.getTime()) {
      this.setState({
        msgModalEndDatetime: this.state.dict.msg_error_next_day_actual_work_datetime_order,
      });
      return;
    } else {
      this.setState({
        msgModalEndDatetime: ''
      });
    }

    let id = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].id;
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].added = id ? false : true;
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].modified = id ? true : false;
    this.machineReportInfo.reload = '1';
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].shotCount = parseInt(this.state.shotCount);
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].disposedShotCount = parseInt(this.state.disposedShotCount);
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].productionEndFlg = parseInt(this.state.productionEndFlg);
    this.props.updateMachineReportInfo(this.machineReportInfo);

    this.$f7router.navigate(APP_DIR_PATH + '/report-detail', { pushState: false, reloadAll: true });
  }

  /**
   * 材料使用量登録画面へ遷移する。
   */
  nextSubmit() {
    this.pressedNext = true;

    let nextPropsMachineReportInfo = this.machineReportInfo;
    let machineDailyReportDetails = nextPropsMachineReportInfo.machineDailyReportDetails[this.state.editIndex];
    machineDailyReportDetails.startDatetimeStr = moment(new Date(this.state.startDatetimeStr)).format('YYYY/MM/DD HH:mm:ss');
    machineDailyReportDetails.endDatetimeStr = moment(new Date(this.state.endDatetimeStr)).format('YYYY/MM/DD HH:mm:ss');
    machineDailyReportDetails.disposedShotCount = parseInt(this.state.disposedShotCount);
    machineDailyReportDetails.durationMinitues = parseInt(this.state.durationMinitues);
    machineDailyReportDetails.shotCount = parseInt(this.state.shotCount);
    machineDailyReportDetails.completeCount = parseInt(this.state.completeCount);
    machineDailyReportDetails.modified = true;

    machineDailyReportDetails.machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    this.props.updateMachineReportInfo(nextPropsMachineReportInfo);
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/report-end-material?editIndex=' + this.state.editIndex, { pushState: true, reloadAll: false });
  }
  buttonNext() {
    let me = this;
    this.checkData();
    if (this.checkResult) {
      return;
    }
    me.nextSubmit();
  }

  /**
   * 
   */
  checkData() {
    var reg = /(\w*)%s(.*)%s(.*)/g;

    this.checkResult = false;
    if (this.state.startDatetimeStr.trim() === '') {
      this.setState({ errorMessageMainteStartTime: this.state.dict.msg_error_not_null });
      this.checkResult = true;
      return;
    } else {
      this.setState({ errorMessageMainteStartTime: '' });
    }

    if (this.state.endDatetimeStr.trim() === '') {
      this.setState({ errorMessageMainteEndTime: this.state.dict.msg_error_not_null });
      this.checkResult = true;
      return;
    } else {
      this.setState({ errorMessageMainteEndTime: '' });
    }

    if (this.state.disposedShotCount !== '' && !/^[0-9]+$/.test(this.state.disposedShotCount)) {
      this.setState({ errorMessageDisposedShotCount: this.state.dict.msg_error_num_over_zero });
      this.checkResult = true;
      return;
    } else {
      this.setState({ errorMessageDisposedShotCount: '' });
    }

    if (this.state.disposedShotCount > 999999999) {
      this.setState({ errorMessageDisposedShotCount: this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.disposed_shot_count + '$29$3') });
      this.checkResult = true;
      return;
    } else {
      this.setState({ errorMessageDisposedShotCount: '' });
    }

    if (this.state.shotCount === '') {
      this.setState({ errorMessageShotCount: this.state.dict.msg_error_not_null });
      this.checkResult = true;
      return;
    } else {
      this.setState({ errorMessageShotCount: '' });
    }

    if (this.state.shotCount !== '' && !/^[0-9]+$/.test(this.state.shotCount)) {
      this.setState({ errorMessageShotCount: this.state.dict.msg_error_num_over_zero });
      this.checkResult = true;
      return;
    } else {
      this.setState({ errorMessageShotCount: '' });
    }

    if (this.state.shotCount > 999999999) {
      this.setState({ errorMessageShotCount: this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.shot_count + '$29$3') });
      this.checkResult = true;
      return;
    } else {
      this.setState({ errorMessageShotCount: '' });
    }

    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    for (let key in machineDailyReportProdDetails) {
      let value = machineDailyReportProdDetails[key];

      if (value.countPerShot === '') {
        machineDailyReportProdDetails[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_not_null;
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageCountPerShot'] = '';
      }

      if (value.countPerShot !== '' && !/^[0-9]+$/.test(value.countPerShot)) {
        machineDailyReportProdDetails[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_num_over_zero;
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageCountPerShot'] = '';
      }

      if (value.countPerShot > 999999999) {
        machineDailyReportProdDetails[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.count_per_shot + '$29$3');
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageCountPerShot'] = '';
      }

      if (value.defectCount === '') {
        machineDailyReportProdDetails[key]['errorMessageDefectCount'] = this.state.dict.msg_error_not_null;
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageDefectCount'] = '';
      }

      if (value.defectCount !== '' && !/^[0-9]+$/.test(value.defectCount)) {
        machineDailyReportProdDetails[key]['errorMessageDefectCount'] = this.state.dict.msg_error_num_over_zero;
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageDefectCount'] = '';
      }

      if (value.defectCount > 999999999) {
        machineDailyReportProdDetails[key]['errorMessageDefectCount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.defect_count + '$29$3');
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageDefectCount'] = '';
      }
      value.completeCount = this.state.shotCount * value.countPerShot - value.defectCount;
      if (value.completeCount === '') {
        machineDailyReportProdDetails[key]['errorMessageCompleteCount'] = this.state.dict.msg_error_not_null;
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageCompleteCount'] = '';
      }

      if (value.completeCount !== '' && !/^[0-9]+$/.test(value.completeCount)) {
        machineDailyReportProdDetails[key]['errorMessageCompleteCount'] = this.state.dict.msg_error_num_over_zero;
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageCompleteCount'] = '';
      }

      if (value.completeCount > 999999999) {
        machineDailyReportProdDetails[key]['errorMessageCompleteCount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.complete_count + '$29$3');
        this.checkResult = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageCompleteCount'] = '';
      }
    }

    //開始登録時の時刻をセット
    var businessStartTime = this.state.businessStartTime;
    if (businessStartTime.length === 0) {
      businessStartTime = '08:00:00';
    } else if (businessStartTime.length === 4) {
      businessStartTime = '0' + businessStartTime + ':00';
    }

    var reportStartTime = new Date(moment(this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].reportDate).format('YYYY-MM-DD ' + businessStartTime));
    var reportEndTime = new Date(moment(this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].reportDate).add(1, 'days').format('YYYY-MM-DD ' + businessStartTime));

    // 業務開始時刻より前、業務終了時間より後の値は許容しない。
    let checkDate = new Date(moment(this.state.startDatetimeStr).format('YYYY-MM-DDTHH:mm:00'));
    if (checkDate.getTime() < reportStartTime.getTime()) {
      this.setState({
        msgStartDatetime: this.state.dict.msg_error_producint_work_datetime_order
      });
      this.checkResult = true;
      return;
    } else {
      this.setState({
        msgStartDatetime: ''
      });
    }

    let checkEndDate = new Date(moment(this.state.endDatetimeStr).format('YYYY-MM-DDTHH:mm:00'));
    if (checkDate.getTime() > reportEndTime.getTime() || checkDate.getTime() > checkEndDate.getTime()) {
      this.setState({
        msgStartDatetime: this.state.dict.msg_error_work_datetime_order
      });
      this.checkResult = true;
      return;
    } else {
      this.setState({
        msgStartDatetime: ''
      });
    }

    // 業務開始時刻より前、業務終了時間より後の値は許容しない。
    if (checkEndDate.getTime() > reportEndTime.getTime()) {
      this.setState({
        msgEndDatetime: this.state.dict.msg_error_next_day_actual_work_datetime_order
      });
      this.checkResult = true;
      return;
    } else {
      this.setState({
        msgEndDatetime: ''
      });
    }

    this.setState({
      machineDailyReportProdDetails: machineDailyReportProdDetails,
    });
  }

  /**
   * 
   */
  checkboxClick() {
    if (this.state.productionEndFlg === 0) {
      this.setState({
        productionEndFlg: 1
      });
    } else {
      this.setState({
        productionEndFlg: 0
      });
    }
  }
  /**
   * ロット番号
   * @param {*} setDefault 
   * @param {*} index 
   */
  loadLotNumber() {
    for (let key in this.productionLots) {
      this.createPickerLotNumber(true, parseInt(key));
    }
  }
  createPickerLotNumber(setDefault, index) {
    var me = this;
    var _values = [''];
    var _displayValues = [''];
    var defaultValue = null;
    var defaultName = null;

    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    let component = machineDailyReportProdDetails[index];
    if (!component) {
      return;
    }
    if (!me.productionLots[index] || me.productionLots[index].length < 1) {
      return;
    }
    for (var i = 0; i < me.productionLots[index].length; i++) {
      let productionLot = me.productionLots[index][i];
      let codeName = productionLot.lotNumber;
      _values.push(codeName);
      _displayValues.push(codeName);
      if (component.lotNumber === codeName) {
        defaultValue = codeName;
        defaultName = codeName;
      }
    }
    if (me.pickerProductionLots[index] !== undefined) {
      me.pickerProductionLots[index].destroy();
      me.pickerProductionLots.splice(index, 1);
    }
    let pickerProductionLot = me.createPicker('#machine-production-count-page-lot-number_' + index, _values, _displayValues,
      // Col Change Callback
      (picker, value, displayValue) => {
        document.getElementById('machine-production-count-page-lot-number_' + index).readOnly = false;
        machineDailyReportProdDetails[index]['lotNumber'] = displayValue;
        me.setState({
          machineDailyReportProdDetails,
        });
      }
    );
    document.getElementById('machine-production-count-page-lot-number_' + index).readOnly = false;
    me.pickerProductionLots[index] = pickerProductionLot;
    if (setDefault && defaultValue !== null) {
      pickerProductionLot.setValue([defaultValue], 0);
      machineDailyReportProdDetails[index].lotNumber = defaultName;
      me.setState({
        machineDailyReportProdDetails,
      });
    }
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
      ]
    });
  }

  /**
   * 
   */
  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_daily_report}>
        <Page id="machine-production-count-page"
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} >
          <AppNavbar applicationTitle={this.state.dict.application_title}
            showBack={true}
            backClick={this.onBackClick.bind(this)} >
          </AppNavbar>
          <BlockTitle>{this.state.dict.sp_daily_report}</BlockTitle>

          <Block className="no-margin" inner accordionList>
            <AccordionItem
              onAccordionOpen={() => { this.setState({ accordionBasicOpened: true }); }}
              onAccordionClose={() => { this.setState({ accordionBasicOpened: false }); }}
            >
              <AccordionToggle>
                <Row>
                  <Col width="50">{this.state.dict.machine_report_date}</Col>
                  <Col width="40">{this.state.reportDate}</Col>
                  <Col width="10"><Icon size="14px" className="color-gray" f7={this.state.accordionBasicOpened ? 'chevron_up' : 'chevron_down'}></Icon></Col>
                </Row>
              </AccordionToggle>
              <AccordionContent>
                <Row>
                  <Col width="50">{this.state.dict.production_start_user}</Col>
                  <Col width="50">{this.state.userName}</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.work_phase}</Col>
                  <Col width="50">{this.state.workPhase}</Col> {/** 工程番号 工程名称 */}
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.mold_id}</Col>
                  <Col width="50">{this.state.moldId}</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.mold_name}</Col>
                  <Col width="50">{this.state.moldName}</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.machine_name}</Col>
                  <Col width="50">{this.state.machineName}</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.direction_code}</Col>
                  <Col width="50">{this.state.directionCode}</Col>
                </Row>
              </AccordionContent>
            </AccordionItem>
          </Block>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.production_start_time}</Label>
              <Input type="text"
                name="startDatetimeStr"
                value={this.state.startDatetimeStr}
                readonly
                errorMessage={this.state.msgStartDatetime}
                errorMessageForce={this.state.msgStartDatetime !== ''}
                inputId="machine-production-count-page-start-time" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.production_end_time}</Label>
              <Input type="text"
                name="endDatetimeStr"
                value={this.state.endDatetimeStr}
                errorMessage={this.state.msgEndDatetime}
                errorMessageForce={this.state.msgEndDatetime !== ''}
                readonly
                inputId="machine-production-count-page-end-time" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.duration_minutes}</Label>
              <Input type="number" name="durationMinutes"
                value={this.state.durationMinitues}
                readonly
                inputId="machine-production-count-page-duration-minutes" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.disposed_shot_count}</Label>
              <Input type="number"
                name="disposedShotCount"
                value={this.state.disposedShotCount}
                onChange={this.handleChange.bind(this)}
                onInputClear={this.handleClear.bind(this)}
                inputId="machine-production-count-page-disposed-shot-count"
                readonly
                errorMessage={this.state.errorMessageDisposedShotCount}
                errorMessageForce={this.state.errorMessageDisposedShotCount !== ''} />
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.shot_count + this.state.required}</Label>
              <Input type="number"
                name="shotCount"
                value={!isNaN((Number(this.state.shotCount))) ? this.state.shotCount : 0 }
                onChange={this.handleChange.bind(this)}
                onInputClear={this.handleClear.bind(this)}
                inputId="machine-production-count-page-shot-count"
                clearButton
                errorMessage={this.state.errorMessageShotCount}
                errorMessageForce={this.state.errorMessageShotCount !== ''} />
              <div className="btn-absolute">
                <Button small fill iconF7="download_round" onClick={this.getShotCountFromLog.bind(this)}></Button>
              </div>
            </ListItem>
          </List>

          {/** 明細の数だけ繰り返し表示 */}
          {this.state.machineDailyReportProdDetails ? this.state.machineDailyReportProdDetails.map((item, index) => {
            return [<Block key={index} className="no-margin-bottom" inner accordionList>
              <AccordionItem onAccordionOpen={() => { this.setState({ accordionDetailOpened_0: true }); }}
                onAccordionClose={() => { this.setState({ accordionDetailOpened_0: false }); }}>
                <AccordionToggle>
                  <Row>
                    <Col width="50">{this.state.dict.component_code}</Col>
                    <Col width="40">{item.componentCode}</Col>
                    <Col width="10"><Icon size="14px" className="color-gray" f7={this.state.accordionDetailOpened_0 ? 'chevron_up' : 'chevron_down'}></Icon></Col>
                  </Row>
                </AccordionToggle>
                <AccordionContent>
                  <Row>
                    <Col width="50">{this.state.dict.component_name}</Col>
                    <Col width="50">{item.componentName}</Col>
                  </Row>
                  <Row>
                    <Col width="50">{this.state.dict.procedure_code}</Col>
                    <Col width="50">{item.procedureCode}</Col>
                  </Row>
                </AccordionContent>
              </AccordionItem>
            </Block>,
            <List key={index + 1} noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.count_per_shot + this.state.required}</Label>
                <Input type="number"
                  name="countPerShot"
                  className="countPerShot"
                  value={item.countPerShot}
                  inputId={'machine-production-count-page-count-per-shot_' + index}
                  onChange={this.handleChange.bind(this, index)}
                  onInputClear={this.handleClear.bind(this, index)}
                  clearButton
                  errorMessage={item.errorMessageCountPerShot}
                  errorMessageForce={item.errorMessageCountPerShot !== ''} />
              </ListItem>
              <ListItem className="custom-list-item">
                <Label>{this.state.dict.defect_count + this.state.required}</Label>
                <Input type="number"
                  name="defectCount"
                  className="defectCount"
                  value={item.defectCount}
                  inputId={'machine-production-count-page-defect-count_' + index}
                  clearButton
                  onChange={this.handleChange.bind(this, index)}
                  onInputClear={this.handleClear.bind(this, index)}
                  errorMessage={item.errorMessageDefectCount}
                  errorMessageForce={item.errorMessageDefectCount !== ''} />
                <div className="btn-absolute">
                  <Button small fill iconF7="compose" onClick={this.buttonDefectCount.bind(this, index)}></Button>
                </div>
              </ListItem>

              <ListItem>
                <Label>{this.state.dict.complete_count}</Label>
                <Input type="number" name="completeCount"
                  className="completeCount"
                  value={this.state.shotCount * item.countPerShot - item.defectCount} //完成数 = ショット数 * 取り数 - 不良数
                  readonly
                  errorMessage={item.errorMessageCompleteCount}
                  errorMessageForce={item.errorMessageCompleteCount !== ''}
                  inputId={'machine-production-count-page-complete-count_' + index} />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.lot_number}</Label>
                <Input type="text" name="lotNumber" className="lotNumber"
                  value={item.lotNumber ? item.lotNumber : ''} //完成数 = ショット数 * 取り数 - 不良数
                  // errorMessage={item.errorMessageLotNumber}
                  // errorMessageForce={item.errorMessageLotNumber !== ''}
                  inputId={'machine-production-count-page-lot-number_' + index}
                  clearButton
                  onChange={this.handleChange.bind(this, index)}
                  onInputClear={this.handleClear.bind(this, index)}
                />
              </ListItem>
            </List>];
          }) : null}

          <Block>
            <Row>
              <Col>
                {this.status
                  ? <Button fill onClick={this.buttonNext.bind(this)}>{this.state.dict.next}</Button>
                  : <Button fill onClick={this.buttonRegistration.bind(this)}>{this.state.dict.registration}
                  </Button>}
              </Col>
            </Row>
          </Block>

          {/* モーダル上のボタン以外では閉じさせない */}
          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal.bind(this)}
            onAfterOpen={this.afterOpenModal.bind(this)}
            style={modalStyle}
            shouldCloseOnOverlayClick={false}
            parentSelector={() => { return document.querySelector('#machine-production-count-page'); }}
          >
            <Block className="no-margin-bottom">
              {this.state.dict.msg_production_to_end}
            </Block>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.production_start_time}</Label>
                <Input
                  type="text"
                  name="startDatetimeStr"
                  readonly
                  errorMessage={this.state.msgModalStartDatetime}
                  errorMessageForce={this.state.msgModalStartDatetime !== ''}
                  inputId="machine-production-count-page-modal-start-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.production_end_time}</Label>
                <Input
                  type="text"
                  name="endDatetimeStr"
                  readonly
                  errorMessage={this.state.msgModalEndDatetime}
                  errorMessageForce={this.state.msgModalEndDatetime !== ''}
                  inputId="machine-production-count-page-modal-end-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.duration_minutes}</Label>
                <Input type="number"
                  name="durationMinutes"
                  value={this.state.durationMinitues}
                  readonly
                  inputId="machine-production-count-page-modal-duration-minutes" />
              </ListItem>
              <ListItem checkbox title={this.state.dict.production_end}
                onClick={this.checkboxClick.bind(this)}
                value={this.state.productionEndFlg}
                name="productionEndFlg"
                defaultChecked={parseInt(this.state.productionEndFlg) === 1}
              >
              </ListItem>
            </List>
            <Block>
              <Row>
                <Col width="50">
                  <Button fill onClick={this.buttonOk.bind(this)}>{this.state.dict.ok}</Button>
                </Col>
                <Col width="50">
                  <Button fill onClick={this.closeModal.bind(this)}>{this.state.dict.cancel}</Button>
                </Col>
              </Row>
            </Block>
          </Modal>

        </Page>
      </DocumentTitle>
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
)(MachineProductionCountPage);
