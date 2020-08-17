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
  Tabs,
  Tab,
} from 'framework7-react';
import { Dom7 } from 'framework7';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import moment from 'moment';
import TabHeader from 'karte/shared/components/TabHeader';
import { connect } from 'react-redux';
import Material from 'karte/shared/master/material';
import { updateMachineReportInfo, clearMachineReport } from 'karte/apps/machine/reducers/machine-report-reducer';
import System from 'karte/shared/master/system';

class MachineEndMaterial extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        sp_daily_report: '',
        production_end: '',
        material_code: '',
        lot_number: '',
        purged_amount: '',
        material_amount: '',
        registration: '',
        production_start_time: '',
        production_end_time: '',
        duration_minutes: '',
        material_not_specified: '',
        ok: '',
        cancel: '',

        msg_error_not_isnumber: '',
        msg_error_over_length_with_item: '',
        msg_record_added: '',
        msg_error_producint_work_datetime_order: '',
        msg_error_work_datetime_order: '',
        msg_error_next_day_actual_work_datetime_order: '',
        yes: '',
      },

      endDatetimeStr: 0,
      startDatetimeStr: 0,
      durationMinitues: 0,
      productionEndFlg: 0,

      businessStartTime: '',
      currentTabIndex: 0,
      modalIsOpen: false,
      editIndex: 0,

      msgStartDatetime: '',
      msgEndDatetime: '',
      machineDailyReportProdDetails: []
    };

    this.machineReportInfo = props.reportInfo;
    this.backMachineReportInfo = JSON.parse(JSON.stringify(this.machineReportInfo));//キャンセル時用

    this.tabLinks = [];
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.productionLots = {};
    this.pickerLotNumberPicker = [];
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
      .then(function (values) {
        me.setState({ dict: values });

        System.load(['system.business_start_time'])
          .then((values) => {
            me.setState({
              businessStartTime: values.cnfSystems[0].configValue
            });
          });

      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });


    Dom7('.purgedAmount').find('input').on('keydown', this.handleKeyPress);
    Dom7('.amount').find('input').on('keydown', this.handleKeyPress);
  }

  componentWillUmount() {
    Dom7('.purgedAmount').find('input').off('keydown', this.handleKeyPress);
    Dom7('.amount').find('input').off('keydown', this.handleKeyPress);
  }

  UNSAFE_componentWillUpdate() {
    Dom7('.purgedAmount').find('input').on('keydown', this.handleKeyPress);
    Dom7('.amount').find('input').on('keydown', this.handleKeyPress);
  }

  /**
   * 
   * @param {*} event 
   */
  handleKeyPress(event) {
    const invalidChars = ['-', '+', 'e', 'E'];
    if (invalidChars.indexOf(event.key) !== -1) {
      event.preventDefault();
    }
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
    let machineDailyReportProdDetails = this.machineReportInfo.machineDailyReportDetails[editIndex].machineDailyReportProdDetails;

    let status = true;
    /** タブ表示のサンプル。 */
    for (let key in machineDailyReportProdDetails) {
      let item = machineDailyReportProdDetails[key];
      let tabData = {
        tabLinkId: 'machineEndMaterialPage' + key,
        tabLinkText: machineDailyReportProdDetails[key].componentCode,
        active: false
      };
      if (
        (item['material01Id'] !== undefined && item['material01Id'] !== '') ||
        (item['material02Id'] !== undefined && item['material02Id'] !== '') ||
        (item['material03Id'] !== undefined && item['material03Id'] !== '')
      ) {
        if (status) {
          status = false;
          tabData.active = true;
        }
        machineDailyReportProdDetails[key]['isEmpty'] = false;
      } else {
        machineDailyReportProdDetails[key]['isEmpty'] = true;
      }
      this.tabLinks.push(tabData);
    }

    let materialList = machineDailyReportProdDetails.map((item) => {
      let material01Amount = (Number(item.completeCount) + Number(item.defectCount)) * Number(item.material01numerator) / Number(item.material01denominator);
      let material02Amount = (Number(item.completeCount) + Number(item.defectCount)) * Number(item.material02numerator) / Number(item.material02denominator);
      let material03Amount = (Number(item.completeCount) + Number(item.defectCount)) * Number(item.material03numerator) / Number(item.material03denominator);
      item['material01Amount'] = isNaN(material01Amount) ? '' : (Math.ceil(material01Amount * 10000) / 10000).toFixed(5);
      item['material02Amount'] = isNaN(material02Amount) ? '' : (Math.ceil(material02Amount * 10000) / 10000).toFixed(5);
      item['material03Amount'] = isNaN(material03Amount) ? '' : (Math.ceil(material03Amount * 10000) / 10000).toFixed(5);
      item = Object.assign({
        material01Id: '',
        material01Code: '',
        material01LotNo: '',
        material01Amount: 0,
        material01PurgedAmount: 0,
        material01Name: '',
        material01numerator: '',
        material01denominator: '',
        material01Grade: '',
        material01Type: '',

        material02Id: '',
        material02Code: '',
        material02LotNo: '',
        material02Amount: 0,
        material02PurgedAmount: 0,
        material02Name: '',
        material02numerator: '',
        material02denominator: '',
        material02Grade: '',
        material02Type: '',

        material03Id: '',
        material03Code: '',
        material03LotNo: '',
        material03Amount: 0,
        material03PurgedAmount: 0,
        material03Name: '',
        material03numerator: '',
        material03denominator: '',
        material03Grade: '',
        material03Type: '',
      }, item);
      return item;
    });
    this.setState({
      machineDailyReportProdDetails: materialList,
      startDatetimeStr: this.machineReportInfo.machineDailyReportDetails[editIndex].startDatetimeStr,
      endDatetimeStr: this.machineReportInfo.machineDailyReportDetails[editIndex].endDatetimeStr,
    });

    this.loadMaterial(0, machineDailyReportProdDetails);
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
  afterOpenModal() {


    var me = this;
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
    if (this.endTimePicker) {
      this.endTimePicker.destroy();
    }
    const app = this.$f7;
    this.startTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#machine-end-material-page-start-time');

    var startDatetimeStr = moment(new Date(this.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr)).format('YYYY/MM/DD HH:mm');
    var endDatetimeStr = moment(new Date(this.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr)).format('YYYY/MM/DD HH:mm');

    this.setState({
      durationMinitues: me.calcCostMinutes(startDatetimeStr, endDatetimeStr)
    });

    this.startTimePicker.setValue(this.converDateStrToArr(startDatetimeStr), 0);
    this.startTimePicker.on('change', function (picker, value) {

      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr = moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(startDatetimeStr).getSeconds())).format('YYYY/MM/DD HH:mm');
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(me.convertDateArrToStr(value), me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr);
      me.setState({
        msgStartDatetime: '',
        startDatetimeStr: moment(me.convertDateArrToStr(value)).format('YYYY/MM/DD HH:mm'),
        durationMinitues: me.calcCostMinutes(me.convertDateArrToStr(value), me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr)
      });

    });

    //終了日付に現在時刻をデフォルトセット
    this.endTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#machine-end-material-page-end-time');
    this.endTimePicker.setValue(this.converDateStrToArr(endDatetimeStr), 0);
    this.endTimePicker.on('change', function (picker, value) {

      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].endDatetimeStr = moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(endDatetimeStr).getSeconds())).format('YYYY/MM/DD HH:mm');
      me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].durationMinitues = me.calcCostMinutes(me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr, me.convertDateArrToStr(value));
      me.setState({
        msgEndDatetime: '',
        endDatetimeStr: moment(me.convertDateArrToStr(value)).format('YYYY/MM/DD HH:mm'),
        durationMinitues: me.calcCostMinutes(me.machineReportInfo.machineDailyReportDetails[me.state.editIndex].startDatetimeStr, me.convertDateArrToStr(value))
      });
    });

  }

  /**
   * 
   */
  closeModal() {
    this.setState({ modalIsOpen: false });
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

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
  }

  /**
   * Event will be triggered right before page is going to be transitioned out of view
   */
  onPageBeforeOut() {
  }

  /**
   * 戻る
   */
  onBackClick() {
    //生産終了画面に戻る
    this.backMachineReportInfo.reload = '2';
    this.props.updateMachineReportInfo(this.backMachineReportInfo);
    this.$f7router.back();
  }

  /**
   * 
   * @param {*} tabIndex 
   */
  tabChange(tabIndex) {
    this.setState({ currentTabIndex: tabIndex });
    this.loadMaterial(tabIndex);
  }

  /**
   * データ有効性チェック
   */
  checkDecimal(val, formal) {
    var formalDefault = formal.length < 1 ? [2, 1] : formal;
    var returnVal = true;
    val = val.toString();
    var ArrMen = val.split('.');
    if (ArrMen.length > 1) {
      if (ArrMen[0].length > formalDefault[0]) {
        returnVal = false;
      }
      if (ArrMen[1].length > formalDefault[1]) {
        returnVal = false;
      }
    }
    var num = Number(val).toFixed(formalDefault[1]);
    if (isNaN(num)) {
      returnVal = false;
    }
    var forStr = '';
    for (var i = 0; i < formalDefault[0]; i++) {
      forStr += '9';
    }
    forStr += '.';
    for (var j = 0; j < formalDefault[1]; j++) {
      forStr += '9';
    }
    var ele = Number(forStr);
    if (ele < Number(num)) {
      returnVal = false;
    }
    return returnVal;
  }

  /**
   * 登録内容をメモリに保持し、機械日報一覧画面へ戻る。
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
        msgStartDatetime: this.state.dict.msg_error_producint_work_datetime_order,
      });

      return;
    } else {
      this.setState({
        msgStartDatetime: ''
      });
    }

    let checkEndDate = new Date(moment(this.state.endDatetimeStr).format('YYYY/MM/DD HH:mm:00'));
    if (checkDate.getTime() > reportEndTime.getTime() || checkDate.getTime() > checkEndDate.getTime()) {
      this.setState({
        msgStartDatetime: this.state.dict.msg_error_work_datetime_order,
      });

      return;
    } else {
      this.setState({
        msgStartDatetime: ''
      });
    }

    // 業務開始時刻より前、業務終了時間より後の値は許容しない。
    if (checkEndDate.getTime() > reportEndTime.getTime()) {
      this.setState({
        msgEndDatetime: this.state.dict.msg_error_next_day_actual_work_datetime_order,
      });
      return;
    } else {
      this.setState({
        msgEndDatetime: ''
      });
    }
    let id = this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].id;
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].added = id ? false : true;
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].modified = id ? true : false;
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].startDatetimeStr = moment(new Date(this.state.startDatetimeStr)).format('YYYY/MM/DD HH:mm');
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].endDatetimeStr = moment(new Date(this.state.endDatetimeStr)).format('YYYY/MM/DD HH:mm');
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].durationMinitues = parseInt(this.state.durationMinitues);
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].productionEndFlg = parseInt(this.state.productionEndFlg);
    this.machineReportInfo.machineDailyReportDetails[this.state.editIndex].machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    this.machineReportInfo.isChanged = '1';
    this.machineReportInfo.reload = '1';

    this.props.updateMachineReportInfo(this.machineReportInfo);
    this.$f7router.navigate(APP_DIR_PATH + '/report-detail', { pushState: false, reloadAll: true });
  }

  /**
   * 登録処理
   */
  buttonRegistration() {
    let me = this;
    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    let result = false;
    let reg = /(\w*)%s(.*)%s(.*)/g;
    for (let key in machineDailyReportProdDetails) {

      let value = machineDailyReportProdDetails[key];
      if (value.material01PurgedAmount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material01PurgedAmount)) {
        machineDailyReportProdDetails[key]['errorMessageMaterial01PurgedAmount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial01PurgedAmount'] = '';
      }

      if (!this.checkDecimal(value.material01PurgedAmount, [18, 5])) {
        machineDailyReportProdDetails[key]['errorMessageMaterial01PurgedAmount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.purged_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial01PurgedAmount'] = '';
      }

      if (value.material02PurgedAmount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material02PurgedAmount)) {
        machineDailyReportProdDetails[key]['errorMessageMaterial02PurgedAmount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial02PurgedAmount'] = '';
      }

      if (!this.checkDecimal(value.material02PurgedAmount, [18, 5])) {
        machineDailyReportProdDetails[key]['errorMessageMaterial02PurgedAmount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.purged_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial02PurgedAmount'] = '';
      }

      if (value.material03PurgedAmount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material03PurgedAmount)) {
        machineDailyReportProdDetails[key]['errorMessageMaterial03PurgedAmount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial03PurgedAmount'] = '';
      }

      if (!this.checkDecimal(value.material03PurgedAmount, [18, 5])) {
        machineDailyReportProdDetails[key]['errorMessageMaterial03PurgedAmount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.purged_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial03PurgedAmount'] = '';
      }

      if (value.material01Amount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material01Amount)) {
        machineDailyReportProdDetails[key]['errorMessageMaterial01Amount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial01Amount'] = '';
      }

      if (!this.checkDecimal(value.material01Amount, [18, 5])) {
        machineDailyReportProdDetails[key]['errorMessageMaterial01Amount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.material_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial01Amount'] = '';
      }

      if (value.material02Amount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material02Amount)) {
        machineDailyReportProdDetails[key]['errorMessageMaterial02Amount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial02Amount' + key] = '';
      }

      if (!this.checkDecimal(value.material02Amount, [18, 5])) {
        machineDailyReportProdDetails[key]['errorMessageMaterial02Amount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.material_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial02Amount' + key] = '';
      }

      if (value.material03Amount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material03Amount)) {
        machineDailyReportProdDetails[key]['errorMessageMaterial03Amount' + key] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial03Amount' + key] = '';
      }

      if (!this.checkDecimal(value.material03Amount, [18, 5])) {
        machineDailyReportProdDetails[key]['errorMessageMaterial03Amount' + key] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.material_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        machineDailyReportProdDetails[key]['errorMessageMaterial03Amount' + key] = '';
      }
    }
    this.setState({
      machineDailyReportProdDetails: machineDailyReportProdDetails
    });

    if (result) {
      return;
    }
    me.openModal();
  }

  /**
   * 
   * @param {*} index 
   * @param {*} event 
   */
  handleChange(index, event) {

    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    machineDailyReportProdDetails[index][event.target.name] = event.target.value;
    machineDailyReportProdDetails[index]['modified'] = true;
    if (event.target.name === 'material01Code') {
      machineDailyReportProdDetails[index]['material01Name'] = '';
      machineDailyReportProdDetails[index]['material01Id'] = '';
      machineDailyReportProdDetails[index]['material01Grade'] = '';
      machineDailyReportProdDetails[index]['material01Type'] = '';
      machineDailyReportProdDetails[index]['material01LotNo'] = '';
    }
    if (event.target.name === 'material02Code') {
      machineDailyReportProdDetails[index]['material02Name'] = '';
      machineDailyReportProdDetails[index]['material02Id'] = '';
      machineDailyReportProdDetails[index]['material02Grade'] = '';
      machineDailyReportProdDetails[index]['material02Type'] = '';
      machineDailyReportProdDetails[index]['material03LotNo'] = '';
    }
    if (event.target.name === 'material03Code') {
      machineDailyReportProdDetails[index]['material03Name'] = '';
      machineDailyReportProdDetails[index]['material03Id'] = '';
      machineDailyReportProdDetails[index]['material03Grade'] = '';
      machineDailyReportProdDetails[index]['material03Type'] = '';
      machineDailyReportProdDetails[index]['material03LotNo'] = '';
    }

    if (event.target.value !== '') {
      let name = event.target.name;
      let msgName = name.charAt(0).toUpperCase() + name.slice(1);
      machineDailyReportProdDetails[index]['errorMessage' + msgName] = '';
    }
    this.setState({
      machineDailyReportProdDetails: machineDailyReportProdDetails
    });
  }

  /**
   * 
   * @param {*} index 
   * @param {*} event 
   */
  handleClear(index, event) {
    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    machineDailyReportProdDetails[index][event.target.name] = '';
    machineDailyReportProdDetails[index]['modified'] = true;
    if (event.target.name === 'material01Code') {
      machineDailyReportProdDetails[index]['material01Name'] = '';
      machineDailyReportProdDetails[index]['material01Id'] = '';
      machineDailyReportProdDetails[index]['material01Grade'] = '';
      machineDailyReportProdDetails[index]['material01Type'] = '';
      machineDailyReportProdDetails[index]['material01LotNo'] = '';
      if (this.pickerLotNumberPicker[index+'01'] !== undefined) {
        this.pickerLotNumberPicker[index+'01'].destroy();
      }
    }
    if (event.target.name === 'material02Code') {
      machineDailyReportProdDetails[index]['material02Name'] = '';
      machineDailyReportProdDetails[index]['material02Id'] = '';
      machineDailyReportProdDetails[index]['material02Grade'] = '';
      machineDailyReportProdDetails[index]['material02Type'] = '';
      machineDailyReportProdDetails[index]['material02LotNo'] = '';
      if (this.pickerLotNumberPicker[index+'02'] !== undefined) {
        this.pickerLotNumberPicker[index+'02'].destroy();
      }
    }
    if (event.target.name === 'material03Code') {
      machineDailyReportProdDetails[index]['material03Name'] = '';
      machineDailyReportProdDetails[index]['material03Id'] = '';
      machineDailyReportProdDetails[index]['material03Grade'] = '';
      machineDailyReportProdDetails[index]['material03Type'] = '';
      machineDailyReportProdDetails[index]['material03LotNo'] = '';
      if (this.pickerLotNumberPicker[index+'03'] !== undefined) {
        this.pickerLotNumberPicker[index+'03'].destroy();
      }
    }
    this.setState({
      machineDailyReportProdDetails
    });
  }

  /**
   * 材料検索
   */
  buttonMaterialSearch(index, itemInx) {
    this.setState({
      searchClickId: index,
      itemInx: itemInx,
    });
    this.$f7router.navigate(APP_DIR_PATH + '/materialSearch', {props: { onSelectedCell: this.onSelectedCell.bind(this) } });
  }

  /**
   * 
   * @param {*} item 
   */
  onSelectedCell(item) {
    let index = this.state.searchClickId;
    let itemInx = this.state.itemInx;
    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    if (machineDailyReportProdDetails[index]) {
      machineDailyReportProdDetails[index]['material0' + itemInx + 'Id'] = item.id;
      machineDailyReportProdDetails[index]['material0' + itemInx + 'Code'] = item.materialCode;
      machineDailyReportProdDetails[index]['material0' + itemInx + 'Name'] = item.materialName;
      machineDailyReportProdDetails[index]['material0' + itemInx + 'Grade'] = item.materialGrade;
      machineDailyReportProdDetails[index]['material0' + itemInx + 'Type'] = item.materialType;
      this.setState({
        machineDailyReportProdDetails: machineDailyReportProdDetails,
      });
    }
  }

  /**
   * 
   * @param {*} tabIndex 
   * @param {*} machineDailyReportProdDetails 
   */
  loadMaterial(tabIndex, machineDailyReportProdDetails) {
    let me = this;
    machineDailyReportProdDetails = machineDailyReportProdDetails === undefined ? me.state.machineDailyReportProdDetails : machineDailyReportProdDetails;
    let component = machineDailyReportProdDetails[tabIndex];
    if (component['optionFlag'] === 4) {
      let procedureCodeName = component.procedureCodeName;
      procedureCodeName = procedureCodeName ? procedureCodeName.trim().split(/\s+/) : ['', ''];
      Material.getMaterialFForComponent({
        componentId: component.componentId,
        proceduerCode: procedureCodeName[0]
      })
        .then((response) => {
          let materials = response.mstComponentMaterials;
          for (let key in materials) {
            let value = materials[key];
            if (parseInt(key) + 1 < 10) {
              key = '0' + (parseInt(key) + 1);
            }
            machineDailyReportProdDetails[tabIndex]['material' + (key) + 'Id'] = value.mstMaterial['id'];
            machineDailyReportProdDetails[tabIndex]['material' + (key) + 'Code'] = value.mstMaterial['materialCode'];
            machineDailyReportProdDetails[tabIndex]['material' + (key) + 'Name'] = value.mstMaterial['materialName'];
            machineDailyReportProdDetails[tabIndex]['material' + (key) + 'Grade'] = value.mstMaterial['materialGrade'];
            machineDailyReportProdDetails[tabIndex]['material' + (key) + 'Type'] = value.mstMaterial['materialType'];
          }
          me.setState({
            machineDailyReportProdDetails: machineDailyReportProdDetails
          });
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }

    me.materialCode1AutocompleteTimer = setTimeout(() => {
      me.createMaterialCode1Autocomplete(tabIndex);
    }, 200);
    me.materialCode2AutocompleteTimer = setTimeout(() => {
      me.createMaterialCode2Autocomplete(tabIndex);
    }, 200);
    me.materialCode3AutocompleteTimer = setTimeout(() => {
      me.createMaterialCode3Autocomplete(tabIndex);
    }, 200);
  }
  /**
   * ロット番号
   */
  loadMaterialLot(materialId, num) {
    var me = this;
    Material.getMaterialLot(materialId).then((response) => {
      let currentTabIndex = this.state.currentTabIndex;
      if (me.machineReportInfo[currentTabIndex] !== undefined) {
        me.machineReportInfo[currentTabIndex][num] = response['tblMaterialLots'];
      } else {
        me.machineReportInfo[currentTabIndex] = {};
        me.machineReportInfo[currentTabIndex][num] = response['tblMaterialLots'];
      }
      me.createPickerLotNumber(true, currentTabIndex, num);
    })
      .catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
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
   * ロット番号
   * @param {*} setDefault 
   * @param {*} index 
   */
  createPickerLotNumber(setDefault, index, num) {
    var me = this;
    var _values = [''];
    var _displayValues = [''];
    var defaultValue = null;
    if (me.machineReportInfo[index] === undefined || me.machineReportInfo[index][num] === undefined || me.machineReportInfo[index][num].length < 1) {
      return;
    }
    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    let component = machineDailyReportProdDetails[index];
    if (!component) {
      return;
    }
    let LotNo = component['material' + num + 'LotNo'];
    let productionLots = me.machineReportInfo[index][num];
    for (var i = 0; i < productionLots.length; i++) {
      let productionLot = productionLots[i];
      _values.push(productionLot.lotNo);
      _displayValues.push(productionLot.lotNo);
      if (LotNo === productionLot.lotNo) {
        defaultValue = productionLot.lotNo;
      }
    }
    if (me.pickerLotNumberPicker[index + num] !== undefined) {
      me.pickerLotNumberPicker[index + num].destroy();
    }
    let pickerLotNumberPicker = me.createPicker('#machine-end-material-page-material' + num + '-lot-no', _values, _displayValues,
      //Col Change Callback
      (picker, value) => {
        document.getElementById('machine-end-material-page-material' + num + '-lot-no').readOnly = false;
        machineDailyReportProdDetails[index]['material' + num + 'LotNo'] = value;
        me.setState({
          machineDailyReportProdDetails: machineDailyReportProdDetails,
        });
      }
    );
    document.getElementById('machine-end-material-page-material' + num + '-lot-no').readOnly = false;
    me.pickerLotNumberPicker[index + num] = pickerLotNumberPicker;
    if (setDefault && defaultValue !== null) {
      pickerLotNumberPicker.setValue([defaultValue], 0);
      machineDailyReportProdDetails[index]['material' + num + 'LotNo'] = defaultValue;
      me.setState({
        machineDailyReportProdDetails
      });
    }
  }

  /**
   * 材料コード
   */
  createMaterialCode1Autocomplete(index) {
    var me = this;
    const app = me.$f7;
    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    if (index === null) return;
    if (machineDailyReportProdDetails[index]['material01Id'] !== '') {
      me.loadMaterialLot(machineDailyReportProdDetails[index]['material01Id'], '01');
    }
    return app.autocomplete.create({
      inputEl: '#machine-end-material-page-material01-code' + index,
      openIn: 'dropdown',
      valueProperty: 'materialCode', //object's "value" property name
      textProperty: 'materialCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Material.getMaterial({
          materialCode: query
        })
          .then((response) => {
            let data = response.mstMaterialList;
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
          machineDailyReportProdDetails[index]['material01Id'] = value[0].id;
          machineDailyReportProdDetails[index]['material01Code'] = value[0].materialCode;
          machineDailyReportProdDetails[index]['material01Name'] = value[0].materialName;
          machineDailyReportProdDetails[index]['material01Grade'] = value[0].materialGrade;
          machineDailyReportProdDetails[index]['material01Type'] = value[0].materialType;
          me.loadMaterialLot(value[0].id, '01');
          me.setState({
            machineDailyReportProdDetails
          });
        },
      },
    });
  }

  /**
   * 
   * @param {*} index 
   */
  createMaterialCode2Autocomplete(index) {
    var me = this;
    const app = me.$f7;
    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    if (index === null) return;
    if (machineDailyReportProdDetails[index]['material02Id'] !== '') {
      me.loadMaterialLot(machineDailyReportProdDetails[index]['material02Id'], '02');
    }
    return app.autocomplete.create({
      inputEl: '#machine-end-material-page-material02-code' + index,
      openIn: 'dropdown',
      valueProperty: 'materialCode', //object's "value" property name
      textProperty: 'materialCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Material.getMaterial({
          materialCode: query
        })
          .then((response) => {
            let data = response.mstMaterialList;
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
          machineDailyReportProdDetails[index]['material02Id'] = value[0].id;
          machineDailyReportProdDetails[index]['material02Code'] = value[0].materialCode;
          machineDailyReportProdDetails[index]['material02Name'] = value[0].materialName;
          machineDailyReportProdDetails[index]['material02Grade'] = value[0].materialGrade;
          machineDailyReportProdDetails[index]['material02Type'] = value[0].materialType;
          me.loadMaterialLot(value[0].id, '02');
          me.setState({
            machineDailyReportProdDetails: machineDailyReportProdDetails
          });
        },
      },
    });
  }

  /**
   * 
   * @param {*} index 
   */
  createMaterialCode3Autocomplete(index) {
    var me = this;
    const app = me.$f7;
    let machineDailyReportProdDetails = this.state.machineDailyReportProdDetails;
    if (index === null) return;
    if (machineDailyReportProdDetails[index]['material03Id'] !== '') {
      me.loadMaterialLot(machineDailyReportProdDetails[index]['material03Id'], '03');
    }
    return app.autocomplete.create({
      inputEl: '#machine-end-material-page-material03-code' + index,
      openIn: 'dropdown',
      valueProperty: 'materialCode', //object's "value" property name
      textProperty: 'materialCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Material.getMaterial({
          materialCode: query
        })
          .then((response) => {
            let data = response.mstMaterialList;
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
          machineDailyReportProdDetails[index]['material03Id'] = value[0].id;
          machineDailyReportProdDetails[index]['material03Code'] = value[0].materialCode;
          machineDailyReportProdDetails[index]['material03Name'] = value[0].materialName;
          machineDailyReportProdDetails[index]['material03Grade'] = value[0].materialGrade;
          machineDailyReportProdDetails[index]['material03Type'] = value[0].materialType;
          me.loadMaterialLot(value[0].id, '03');
          me.setState({
            machineDailyReportProdDetails: machineDailyReportProdDetails
          });
        },
      },
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
   * 
   */
  render() {

    return (
      <DocumentTitle title={this.state.dict.sp_daily_report}>
        <Page id="machine-end-material-page"
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          onPageBeforeOut={this.onPageBeforeOut.bind(this)}>
          <AppNavbar
            applicationTitle={this.state.dict.application_title}
            showBack={true}
            backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_daily_report}</BlockTitle>

          {/** 部品の数だけタブにする */}
          <Block className="no-margin-bottom no-padding">
            <TabHeader tabLinks={this.tabLinks} onTabChange={this.tabChange.bind(this)}></TabHeader>
          </Block>

          <Tabs>
            {this.state.machineDailyReportProdDetails ? this.state.machineDailyReportProdDetails.map((item, index) => {
              return item.isEmpty ? <Tab key={index} tabActive={parseInt(this.state.currentTabIndex) === index} id={'machineEndMaterialPage' + index} style={{ textAlign: 'center' }}>{this.state.dict.material_not_specified}</Tab> : <Tab key={index} tabActive={this.state.currentTabIndex === index ? true : false}
                id={'machineEndMaterialPage' + index}>
                {/** 材料 */}
                <List noHairlinesBetween className="no-margin-top no-margin-bottom">
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.material_code}</Label>
                    <Input type="text" name="material01Code"
                      value={item.material01Code ? item.material01Code : ''}
                      clearButton
                      onInputClear={this.handleClear.bind(this, index)}
                      inputId={'machine-end-material-page-material01-code' + index}
                      onChange={this.handleChange.bind(this, index)} />
                    <div className="btn-absolute">
                      <Button fill iconF7="search" small
                        onClick={this.buttonMaterialSearch.bind(this, index, 1)}>
                      </Button>
                    </div>
                  </ListItem>
                  <ListItem>{item.material01Name + ' ' + item.material01Type + ' ' + item.material01Grade}</ListItem> {/** 材料名称、材質、グレード */}
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material01LotNo"
                      value={item.material01LotNo ? item.material01LotNo : ''}
                      onChange={this.handleChange.bind(this, index)}
                      clearButton onInputClear={this.handleClear.bind(this, index)}
                      inputId="machine-end-material-page-material01-lot-no" maxlength={100} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number"
                      name="material01PurgedAmount"
                      className="purgedAmount"
                      value={item.material01PurgedAmount}
                      onChange={this.handleChange.bind(this, index)}
                      inputId="machine-end-material-page-material01-purged-amount"
                      clearButton onInputClear={this.handleClear.bind(this, index)}
                      errorMessage={item.errorMessageMaterial01PurgedAmount}
                      errorMessageForce={item.errorMessageMaterial01PurgedAmount !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.material_amount}</Label>
                    <Input type="number" name="material01Amount" className="amount" value={item.material01Amount}  inputId={'pmachine-end-material-page-material01-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial01Amount} errorMessageForce={item.errorMessageMaterial01Amount !== ''} />
                  </ListItem>
                </List>
                <List noHairlinesBetween className="no-margin-top no-margin-bottom">
                  <ListItem className="custom-list-item">                   
                    <Label >{this.state.dict.material_code}</Label>
                    <Input type="text" name="material02Code"
                      value={item.material02Code}
                      clearButton
                      onInputClear={this.handleClear.bind(this, index)}
                      inputId={'machine-end-material-page-material02-code' + index}
                      onChange={this.handleChange.bind(this, index)} />    
                    <div className="btn-absolute">
                      <Button fill iconF7="search" small
                        onClick={this.buttonMaterialSearch.bind(this, index, 2)}></Button>
                    </div>
                  </ListItem>
                  <ListItem>{item.material02Name + ' ' + item.material02Type + ' ' + item.material02Grade}</ListItem> {/** 材料名称、材質、グレード */}
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material02LotNo"
                      value={item.material02LotNo ? item.material02LotNo : ''}
                      onChange={this.handleChange.bind(this, index)}
                      clearButton
                      onInputClear={this.handleClear.bind(this, index)}
                      inputId="machine-end-material-page-material02-lot-no" maxlength={100} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name="material02PurgedAmount"
                      className="purgedAmount"
                      value={item.material02PurgedAmount}
                      onChange={this.handleChange.bind(this, index)}
                      inputId="machine-end-material-page-material02-purged-amount"
                      clearButton
                      onInputClear={this.handleClear.bind(this, index)}
                      errorMessage={item.errorMessageMaterial02PurgedAmount}
                      errorMessageForce={item.errorMessageMaterial02PurgedAmount !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.material_amount}</Label>
                    <Input type="number" name="material02Amount" className="amount" value={item.material02Amount} inputId={'pmachine-end-material-page-material02-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial02Amount} errorMessageForce={item.errorMessageMaterial02Amount !== ''} />
                  </ListItem>
                </List>
                <List noHairlinesBetween className="no-margin-top">
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.material_code}</Label>
                    <Input type="text" name="material03Code"
                      value={item.material03Code}
                      clearButton
                      onInputClear={this.handleClear.bind(this, index)}
                      inputId={'machine-end-material-page-material03-code' + index}
                      onChange={this.handleChange.bind(this, index)} />
                    <div className="btn-absolute">
                      <Button fill iconF7="search" small
                        onClick={this.buttonMaterialSearch.bind(this, index, 3)}></Button>
                    </div>
                  </ListItem>
                  <ListItem>{item.material03Name + ' ' + item.material03Type + ' ' + item.material03Grade}</ListItem> {/** 材料名称、材質、グレード */}
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material03LotNo" value={item.material03LotNo}
                      onChange={this.handleChange.bind(this, index)}
                      clearButton
                      onInputClear={this.handleClear.bind(this, index)}
                      inputId="machine-end-material-page-material03-lot-no"
                      maxlength={100} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name="material03PurgedAmount"
                      className="purgedAmount"
                      value={item.material03PurgedAmount}
                      onChange={this.handleChange.bind(this, index)}
                      inputId="machine-end-material-page-material03-purged-amount"
                      clearButton onInputClear={this.handleClear.bind(this, index)}
                      errorMessage={item.errorMessageMaterial03PurgedAmount}
                      errorMessageForce={item.errorMessageMaterial03PurgedAmount !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.material_amount}</Label>
                    <Input type="number" name="material03Amount" className="amount" value={item.material03Amount}  inputId={'pmachine-end-material-page-material03-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial03Amount} errorMessageForce={item.errorMessageMaterial03Amount !== ''} />
                  </ListItem>
                </List>
              </Tab>;
            }) : ''}
          </Tabs>

          <Block>
            <Row>
              <Col>
                <Button fill onClick={this.buttonRegistration.bind(this)}>{this.state.dict.registration}</Button>
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
            parentSelector={() => { return document.querySelector('#machine-end-material-page'); }}
          >
            <Block className="no-margin-bottom"></Block>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.production_start_time}</Label>
                <Input type="text" name="startDatetimeStr"
                  readonly
                  errorMessage={this.state.msgStartDatetime}
                  errorMessageForce={this.state.msgStartDatetime !== ''}
                  inputId="machine-end-material-page-start-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.production_end_time}</Label>
                <Input type="text"
                  name="endDatetimeStr"
                  readonly
                  errorMessage={this.state.msgEndDatetime}
                  errorMessageForce={this.state.msgEndDatetime !== ''}
                  inputId="machine-end-material-page-end-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.duration_minutes}</Label>
                <Input type="number" name="durationMinitues" value={this.state.durationMinitues}
                  readonly
                  inputId="machine-end-material-page-duration-minutes" />
              </ListItem>

              <ListItem checkbox title={this.state.dict.production_end}
                onClick={this.checkboxClick.bind(this)}
                value={this.state.productionEndFlg}
                name="productionEndFlg">
              </ListItem>
            </List>


            <Block>
              <Row>
                <Col width="50">
                  <Button fill onClick={this.buttonOk.bind(this)}>{this.state.dict.ok}</Button>
                </Col>
                <Col width="50">
                  <Button fill onClick={this.closeModal}>{this.state.dict.cancel}</Button>
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
)(MachineEndMaterial);