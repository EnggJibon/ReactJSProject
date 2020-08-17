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
import { Dom7 } from 'framework7';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import Production from 'karte/apps/core/logics/production';
import SigmaGunshi from 'karte/apps/machine/logics/sigma-gunshi';
import moment from 'moment';
import { connect } from 'react-redux';
import { addCondition, clearCondition, updateProductionDetails } from 'karte/apps/core/reducers/production-reducer';


class ProductionEndPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        production_end: '',
        production_date: '',
        production_start_user: '',
        msg_production_to_end: '',
        time_unit_minute: '',
        work_phase: '',
        mold_id: '',
        mold_name: '',
        machine_name: '',
        direction_code: '',
        production_start_time: '',
        production_end_time: '',
        duration_minutes: '',
        disposed_shot_count: '',
        shot_count: '',
        component_code: '',
        component_name: '',
        procedure_code: '',
        count_per_shot: '',
        defect_count: '',
        complete_count: '',
        close: '',
        next: '',
        msg_error_num_over_zero: '',
        msg_error_not_null: '',
        registration: '',
        msg_error_over_length_with_item: '',
        ok: '',
        cancel: '',
        msg_record_added: '',
        lot_number: '',
      },
      required:'',
      accordionBasicOpened: false,
      endDatetimeStr: moment(new Date()).format('YYYY/MM/DD HH:mm'),
      producingTimeMinutes: 0,
      isEdit: false,
      tblProductionDetailVos: [],
      productionDefects: [],
    };
    this.shotCountStartDateTime= moment(new Date()).format('YYYY/MM/DDHH:mm:ss');
    this.shotCountEndDateTime= moment(new Date()).format('YYYY/MM/DDHH:mm:ss');
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.detail = {};
    this.pressedNext = false; //次へが押されたかどうか
    this.isDefect = false;
    this.loadDetail();
    this.status = false;
    this.checkResult = false;
    this.production = [];
    this.productionLots = [];
    this.pickerProductionLots = {};
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
    Dom7('#production-end-page-disposed-shot-count').on('keydown', this.handleKeyPress);
    Dom7('.countPerShot').find('input').on('keydown', this.handleKeyPress);
    Dom7('.defectCount').find('input').on('keydown', this.handleKeyPress);
    Dom7('completeCount').find('input').on('keydown', this.handleKeyPress);
  }

  componentWillUmount() {
    Dom7('#production-end-page-disposed-shot-count').off('keydown', this.handleKeyPress);
    Dom7('.countPerShot').find('input').off('keydown', this.handleKeyPress);
    Dom7('.defectCount').find('input').off('keydown', this.handleKeyPress);
    Dom7('completeCount').find('input').off('keydown', this.handleKeyPress);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.production = newProps.cond;
    if (newProps.cond.option) {
      let data = Object.assign(this.state, newProps.cond);
      this.loadCalendar(data);
    }
  }

  UNSAFE_componentWillUpdate() {
    Dom7('#production-end-page-disposed-shot-count').on('keydown', this.handleKeyPress);
    Dom7('.countPerShot').find('input').on('keydown', this.handleKeyPress);
    Dom7('.defectCount').find('input').on('keydown', this.handleKeyPress);
    Dom7('completeCount').find('input').on('keydown', this.handleKeyPress);
  }

  handleKeyPress(event) {
    const invalidChars = ['-', '+', 'e', 'E'];
    if (invalidChars.indexOf(event.key) !== -1) {
      event.preventDefault();
    }
  }

  /**
   * 
   */
  loadDetail() {
    let me = this;
    if (me.$f7route.query.id) {
      Production.getProductionDetail(me.$f7route.query.id)
        .then((response) => {
          let state = this.state;
          this.detail = response;
          for (var key in response.tblProductionDetailVos) {
            let value = response.tblProductionDetailVos[key];
            if ((value['material01Id'] !== undefined && value['material01Id'] !== '') ||
              (value['material02Id'] !== undefined && value['material02Id'] !== '') ||
              (value['material03Id'] !== undefined && value['material03Id'] !== '')) {
              this.status = true;
              // break;
            }
            if (response.lotNumber) {
              response.tblProductionDetailVos[key]['lotNumber'] = response.lotNumber;
            } else {
              response.tblProductionDetailVos[key]['lotNumber'] = '';
            }
            if (value['componentLotNumberList']) {
              me.productionLots.push(value['componentLotNumberList']);
            } else {
              me.productionLots.push([]);
            }
          }
          if (this.status) {
            state['isEdit'] = true;
          }
          this.setState({ ...Object.assign(state, response) }, () => {
            me.loadCalendar();
            me.loadLotNumber();
          });
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
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

    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    let component = tblProductionDetailVos[index];
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
    let pickerProductionLot = me.createPicker('#production-end-page-lot-number_' + index, _values, _displayValues,
      // Col Change Callback
      (picker, value, displayValue) => {
        document.getElementById('production-end-page-lot-number_' + index).readOnly = false;
        // console.log(tblProductionDetailVos[index]);
        // if(tblProductionDetailVos[index].lotNumber){
        // //   tblProductionDetailVos[index].tblProductionLotBalanceVos[0] = {};
        // }
        tblProductionDetailVos[index]['lotNumber'] = displayValue;
        me.setState({
          tblProductionDetailVos,
        });
      }
    );
    document.getElementById('production-end-page-lot-number_' + index).readOnly = false;
    me.pickerProductionLots[index] = pickerProductionLot;
    if (setDefault && defaultValue !== null) {
      pickerProductionLot.setValue([defaultValue], 0);
      tblProductionDetailVos[index].lotNumber = defaultName;
      me.setState({
        tblProductionDetailVos,
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
   * @param {*} data 
   */
  loadCalendar(data) {
    if (this.startDatetimeCalendar) {
      this.startDatetimeCalendar.destroy();
    }
    if (this.endDatetimeDateCalendar) {
      this.endDatetimeDateCalendar.destroy();
    }
    let me = this;
    let app = me.$f7;
    let startDatetimeStr = this.state.startDatetimeStr;
    if (data !== undefined) {
      startDatetimeStr = new Date(data.startDatetimeStr);
    }
    let endDatetimeStr = new Date();
    if (data !== undefined) {
      endDatetimeStr = new Date(data.endDatetimeStr);
    }
    this.startDatetimeCalendar = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#production-end-page-start-time', {
      change: function (picker, value) {
        let val = value[0] + '/' + value[1] + '/' + value[2] + ' ' + value[3] + ':' + value[4];
        me.setState({
          startDatetimeStr: moment(new Date(val)).format('YYYY/MM/DD HH:mm'),
        });
      }
    }, new Date(startDatetimeStr));
    this.endDatetimeDateCalendar = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#production-end-page-end-time', {
      change: function (picker, value) {
        let val = value[0] + '/' + value[1] + '/' + value[2] + ' ' + value[3] + ':' + value[4];
        me.setState({
          endDatetimeStr: moment(new Date(val)).format('YYYY/MM/DD HH:mm'),
        });
      }
    }, endDatetimeStr);
  }
  /**
   * ページ初期処理
   */
  onPageInit() {
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  /**
   * Event will be triggered right before page is going to be transitioned out of view
   */
  onPageBeforeOut() {

    if (!this.pressedNext && !this.isDefect) {
      this.props.clearCondition();
    }
  }
  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
    var me = this;
    if (me.startDatetimeCalendar) {
      me.startDatetimeCalendar.destroy();
    }
    if (me.endDatetimeCalendar) {
      me.endDatetimeCalendar.destroy();
    }
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
    var me = this;
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
    if (this.endTimePicker) {
      this.endTimePicker.destroy();
    }
    const app = this.$f7;
    this.startTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#production-end-page-modal-start-time');
    //開始登録時の時刻をセット
    var startDatetime = this.state.startDatetimeStr;
    var endDatetime = this.state.endDatetimeStr;
    this.setState({
      producingTimeMinutes: me.calcCostMinutes(startDatetime, endDatetime)
    });

    this.startTimePicker.setValue(this.converDateStrToArr(startDatetime), 0);
    this.startTimePicker.on('change', function (picker, value) {
      me.setState({
        startDatetimeStr: moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(startDatetime).getSeconds())).format('YYYY/MM/DD HH:mm:ss'),
        producingTimeMinutes: me.calcCostMinutes(me.convertDateArrToStr(value), me.state.endDatetimeStr)
      });
    });

    //終了日付に現在時刻をデフォルトセット
    this.endTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#production-end-page-modal-end-time');
    this.endTimePicker.setValue(this.converDateStrToArr(endDatetime), 0);
    this.endTimePicker.on('change', function (picker, value) {
      me.setState({
        endDatetimeStr: moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(endDatetime).getSeconds())).format('YYYY/MM/DD HH:mm:ss'),
        producingTimeMinutes: me.calcCostMinutes(me.state.startDatetimeStr, me.convertDateArrToStr(value))
      });
    });

  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  handleChangeCostMinutes(e) {
    this.setState({
      producingTimeMinutes: e.target.value
    });
  }


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
    me.shotCountStartDateTime= me.state.startDatetimeStr ? moment(me.state.startDatetimeStr).format('YYYY/MM/DD HH:mm:ss'): '';
    me.shotCountEndDateTime = me.state.endDatetimeStr ? moment(me.state.endDatetimeStr).format('YYYY/MM/DD HH:mm:ss') :'';
    SigmaGunshi.loadShotCountFromLog({
      machineId: me.state.machineId,
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
   * 戻る
   */
  onBackClick() {
    //生産中画面に戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-detail?reload=1&id=' + this.$f7route.query.id, { pushState: true, reloadAll: true });
  }

  /**
   * 
   */
  checkData() {
    var reg = /(\w*)%s(.*)%s(.*)/g;
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
      this.checkResult = false;
      this.setState({ errorMessageShotCount: '' });
    }
    if (this.state.shotCount !== '' && !/^[0-9]+$/.test(this.state.shotCount)) {
      this.setState({ errorMessageShotCount: this.state.dict.msg_error_num_over_zero });
      this.checkResult = true;
      return;
    } else {
      this.checkResult = false;
      this.setState({ errorMessageShotCount: '' });
    }
    if (this.state.shotCount > 999999999) {
      this.setState({ errorMessageShotCount: this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.shot_count + '$29$3') });
      this.checkResult = true;
      return;
    } else {
      this.checkResult = false;
      this.setState({ errorMessageShotCount: '' });
    }
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    for (let key in tblProductionDetailVos) {
      let value = tblProductionDetailVos[key];
      if (value.countPerShot === '') {
        tblProductionDetailVos[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_not_null;
        this.checkResult = true;
        break;
      } else {
        this.checkResult = false;
        tblProductionDetailVos[key]['errorMessageCountPerShot'] = '';
      }
      if (value.countPerShot !== '' && !/^[0-9]+$/.test(value.countPerShot)) {
        tblProductionDetailVos[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_num_over_zero;
        this.checkResult = true;
        break;
      } else {
        this.checkResult = false;
        tblProductionDetailVos[key]['errorMessageCountPerShot'] = '';
      }
      if (value.countPerShot > 999999999) {
        tblProductionDetailVos[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.count_per_shot + '$29$3');
        this.checkResult = true;
        break;
      } else {
        this.checkResult = false;
        tblProductionDetailVos[key]['errorMessageCountPerShot'] = '';
      }
      if (value.defectCount === '') {
        tblProductionDetailVos[key]['errorMessageDefectCount'] = this.state.dict.msg_error_not_null;
        this.checkResult = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageDefectCount'] = '';
      }
      if (value.defectCount !== '' && !/^[0-9]+$/.test(value.defectCount)) {
        tblProductionDetailVos[key]['errorMessageDefectCount'] = this.state.dict.msg_error_num_over_zero;
        this.checkResult = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageDefectCount'] = '';
      }
      if (value.defectCount > 999999999) {
        tblProductionDetailVos[key]['errorMessageDefectCount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.defect_count + '$29$3');
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageDefectCount'] = '';
      }

      value.completeCount = this.state.shotCount * value.countPerShot - value.defectCount;
      if (value.completeCount === '') {
        tblProductionDetailVos[key]['errorMessageCompleteCount'] = this.state.dict.msg_error_not_null;
        this.checkResult = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageCompleteCount'] = '';
      }
      if (value.completeCount !== '' && !/^[0-9]+$/.test(value.completeCount)) {
        tblProductionDetailVos[key]['errorMessageCompleteCount'] = this.state.dict.msg_error_num_over_zero;
        this.checkResult = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageCompleteCount'] = '';
      }
      if (value.completeCount > 999999999) {
        tblProductionDetailVos[key]['errorMessageCompleteCount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.complete_count + '$29$3');
        this.checkResult = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageCompleteCount'] = '';
      }
    }
    this.setState({
      tblProductionDetailVos: tblProductionDetailVos
    });
  }

  okSubmit() {
    this.$f7.preloader.show();
    let me = this;
    let millisecond = new Date(this.state.endDatetimeStr) - new Date(this.state.startDatetimeStr);
    var producingTimeMinutes = millisecond / (1000 * 60);
    producingTimeMinutes = isNaN(producingTimeMinutes) ? 0 : producingTimeMinutes;
    let data = Object.assign(this.detail, {
      startDatetime: moment(new Date(this.state.startDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss'),
      endDatetime: moment(new Date(this.state.endDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss'),
      producingTimeMinutes: producingTimeMinutes,
      disposedShotCount: this.state.disposedShotCount,
      shotCount: this.state.shotCount,
      tblProductionDetailVos: this.state.tblProductionDetailVos,
      structureFlg: 1
    });
    Production.end(data)
      .then(() => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        //メインメニューに戻る
        me.$f7.dialog.create({
          text: me.state.dict.msg_record_added,
          buttons: [{
            text: me.state.dict.ok,
            onClick: function () {
              me.props.clearCondition();
              me.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-sub-menu', { reloadAll: true });
            }
          }]
        }).open();
      }).catch((err) => {
        me.$f7.preloader.hide();
        var error = err;
        if (error['errorCode'] === 'E201') {
          me.$f7.dialog.alert(error.errorMessage);
        } else {
          me.setState(() => { throw new UnexpectedError(error); });
        }
      });
  }

  buttonOk() {
    this.okSubmit();
  }

  /**
   * 登録ボタン
   */
  buttonRegistration() {
    this.checkData();
    if (this.checkResult) {
      return;
    }
    this.openModal();
  }
  /**
   * 次へボタン
   */
  nextSubmit() {
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (this.production.tblProductionDetailVos !== undefined) {
      tblProductionDetailVos = Object.assign(tblProductionDetailVos, this.production.tblProductionDetailVos);
    }
    let millisecond = new Date(this.state.endDatetimeStr) - new Date(this.state.startDatetimeStr);
    var producingTimeMinutes = millisecond / (1000 * 60);
    producingTimeMinutes = isNaN(producingTimeMinutes) ? 0 : producingTimeMinutes;
    let data = Object.assign(this.detail, {
      startDatetimeStr: moment(new Date(this.state.startDatetimeStr)).format('YYYY/MM/DD HH:mm:ss'),
      endDatetimeStr: moment(new Date(this.state.endDatetimeStr)).format('YYYY/MM/DD HH:mm:ss'),
      startDatetime: moment(new Date(this.state.startDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss'),
      endDatetime: moment(new Date(this.state.endDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss'),
      producingTimeMinutes: producingTimeMinutes,
      disposedShotCount: this.state.disposedShotCount,
      shotCount: this.state.shotCount,
      tblProductionDetailVos: tblProductionDetailVos,
      isEdit: this.state.isEdit,
    });
    this.props.addCondition({ ...data, option: false });

    this.pressedNext = true;
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-end-material?id=' + this.$f7route.query.id, { pushState: true });
  }
  buttonNext() {
    let me = this;
    me.checkData();
    if (me.checkResult) {
      return;
    }
    me.nextSubmit();
  }

  handleChange(item, event) {
    if (!isNaN(Number(item))) {
      let tblProductionDetailVos = this.state.tblProductionDetailVos;
      tblProductionDetailVos[item][event.target.name] = event.target.value;
      if (event.target.name === 'countPerShot') {
        tblProductionDetailVos[item]['completeCount'] = Number(this.state.shotCount) * event.target.value - Number(tblProductionDetailVos[item].defectCount);
      }
      if (event.target.name === 'defectCount') {
        tblProductionDetailVos[item]['completeCount'] = Number(this.state.shotCount) * Number(tblProductionDetailVos[item].countPerShot) - event.target.value;
      }
      this.setState({
        tblProductionDetailVos: tblProductionDetailVos
      });
    } else {
      this.setState({ [item.target.name]: item.target.value });
      if (item.target.name === 'shotCount') {
        let tblProductionDetailVos = this.state.tblProductionDetailVos;
        for (let key in tblProductionDetailVos) {
          let value = tblProductionDetailVos[key];
          tblProductionDetailVos[key]['completeCount'] = Number(item.target.value) * Number(value.countPerShot) - Number(value.defectCount);
        }
        this.setState({
          tblProductionDetailVos: tblProductionDetailVos
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
      let tblProductionDetailVos = this.state.tblProductionDetailVos;
      tblProductionDetailVos[item][event.target.name] = '';
      if (event.target.name === 'countPerShot') {
        tblProductionDetailVos[item]['completeCount'] = Number(this.state.shotCount) * 0 - Number(tblProductionDetailVos[item].defectCount);
      }
      if (event.target.name === 'defectCount') {
        tblProductionDetailVos[item]['completeCount'] = Number(this.state.shotCount) * Number(tblProductionDetailVos[item].countPerShot) - 0;
      }
      this.setState({
        tblProductionDetailVos: tblProductionDetailVos
      });
    } else {
      this.setState({ [item.target.name]: '' });
      if (item.target.name === 'shotCount') {
        let tblProductionDetailVos = this.state.tblProductionDetailVos;
        for (let key in tblProductionDetailVos) {
          let value = tblProductionDetailVos[key];
          tblProductionDetailVos[key]['completeCount'] = 0 * Number(value.countPerShot) - Number(value.defectCount);
        }
        this.setState({
          tblProductionDetailVos: tblProductionDetailVos
        });
      }
    }
  }
  /**
   * 
   */
  buttonDefectRegistration(index) {
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (this.production.tblProductionDetailVos !== undefined) {
      tblProductionDetailVos = Object.assign(tblProductionDetailVos, this.production.tblProductionDetailVos);
    }
    let millisecond = new Date(this.state.endDatetimeStr) - new Date(this.state.startDatetimeStr);
    var producingTimeMinutes = millisecond / (1000 * 60);
    producingTimeMinutes = isNaN(producingTimeMinutes) ? 0 : producingTimeMinutes;
    let data = Object.assign(this.detail, {
      startDatetimeStr: moment(new Date(this.state.startDatetimeStr)).format('YYYY/MM/DD HH:mm:ss'),
      endDatetimeStr: moment(new Date(this.state.endDatetimeStr)).format('YYYY/MM/DD HH:mm:ss'),
      startDatetime: moment(new Date(this.state.startDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss'),
      endDatetime: moment(new Date(this.state.endDatetimeStr)).format('YYYY-MM-DDTHH:mm:ss'),
      producingTimeMinutes: producingTimeMinutes,
      disposedShotCount: this.state.disposedShotCount,
      shotCount: this.state.shotCount,
      tblProductionDetailVos: tblProductionDetailVos,
      isEdit: this.state.isEdit,
    });
    this.isDefect = true;
    this.props.updateProductionDetails({ ...data, option: false });
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-defect-registration?pageName=productionEnd&id=' + this.$f7route.query.id + '&currentComponentCodeIndex=' + index, { pushState: true });
  }
  /**
   * 
   */
  render() {
    let productionDate = this.state.productionDate ? moment(new Date(this.state.productionDate)).format('YYYY/MM/DD') : '';
    let startDatetimeStr = this.state.startDatetimeStr ? moment(new Date(this.state.startDatetimeStr)).format('YYYY/MM/DD HH:mm') : '';
    let millisecond = new Date(this.state.endDatetimeStr) - new Date(this.state.startDatetimeStr);
    var producingTimeMinutes = millisecond / (1000 * 60);
    producingTimeMinutes = isNaN(producingTimeMinutes) ? 0 : producingTimeMinutes;
    let endDatetimeStr = this.state.endDatetimeStr ? moment(new Date(this.state.endDatetimeStr)).format('YYYY/MM/DD HH:mm') : '';
    return (
      <DocumentTitle title={this.state.dict.production_end}>
        <Page id="production-end-page-modal" onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} onPageBeforeOut={this.onPageBeforeOut.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.production_end}</BlockTitle>

          <Block className="no-margin" inner accordionList>
            <AccordionItem onAccordionOpen={() => { this.setState({ accordionBasicOpened: true }); }}
              onAccordionClose={() => { this.setState({ accordionBasicOpened: false }); }}>
              <AccordionToggle>
                <Row>
                  <Col width="50">{this.state.dict.production_date}</Col>
                  <Col width="40">{productionDate}</Col>
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
                  <Col width="50">{this.state.mstWorkPhase ? this.state.mstWorkPhase.workPhaseCode + ' ' + this.state.mstWorkPhase.workPhaseName : ''}</Col> {/** 工程番号 工程名称 */}
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
              <Input type="text" name="startDatetimeStr" value={startDatetimeStr} readonly inputId="production-end-page-start-time" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.production_end_time}</Label>
              <Input type="text" name="endDatetimeStr" value={endDatetimeStr} readonly inputId="production-end-page-end-time" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.duration_minutes}</Label>
              <Input type="number" name="producingTimeMinutes" value={producingTimeMinutes} readonly inputId="production-end-page-producing-time-minutes" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.disposed_shot_count}</Label>
              <Input type="number" name="disposedShotCount" value={Number(this.state.disposedShotCount) ? this.state.disposedShotCount : ''} onChange={this.handleChange.bind(this)} inputId="production-end-page-disposed-shot-count" clearButton onInputClear={this.handleClear.bind(this)} errorMessage={this.state.errorMessageDisposedShotCount} errorMessageForce={this.state.errorMessageDisposedShotCount !== ''} />
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.shot_count + this.state.required}</Label>
              <Input type="number" name="shotCount" value={!isNaN((Number(this.state.shotCount))) ? this.state.shotCount : 0 } onChange={this.handleChange.bind(this)} inputId="production-end-page-shot-count" clearButton onInputClear={this.handleClear.bind(this)} errorMessage={this.state.errorMessageShotCount} errorMessageForce={this.state.errorMessageShotCount !== ''} />
              <div className="btn-absolute">
                <Button small fill iconF7="download_round" onClick={this.getShotCountFromLog.bind(this)}></Button>
              </div>      
            </ListItem>
          </List>
          {/** 明細の数だけ繰り返し表示 */}
          {this.state.tblProductionDetailVos ? this.state.tblProductionDetailVos.map((item, index) => {
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
                <Input type="number" name="countPerShot" className="countPerShot" value={item.countPerShot} onChange={this.handleChange.bind(this, index)} inputId={'production-end-page-count-per-shot_' + index} clearButton onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageCountPerShot} errorMessageForce={item.errorMessageCountPerShot !== ''} />
              </ListItem>
              <ListItem className="custom-list-item">
                <Label>{this.state.dict.defect_count + this.state.required}</Label>
                <Input type="number" name="defectCount" className="defectCount" value={item.defectCount} inputId={'production-end-page-defect-count_' + index} onChange={this.handleChange.bind(this, index)} clearButton onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageDefectCount} errorMessageForce={item.errorMessageDefectCount !== ''} />
                <div className="btn-absolute">
                  <Button small fill iconF7="compose"
                    id={'production-end-page-defect-compose_' + index}
                    onClick={this.buttonDefectRegistration.bind(this, index)}>
                  </Button>
                </div>
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.complete_count}</Label>
                <Input type="number" name="completeCount" className="completeCount" value={this.state.shotCount * item.countPerShot - item.defectCount} readonly inputId={'production-end-page-complete-count_' + index} errorMessage={item.errorMessageCompleteCount} errorMessageForce={item.errorMessageCompleteCount !== ''} />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.lot_number}</Label>
                <Input type="text" name="lotNumber" className="lotNumber" value={item.lotNumber} inputId={'production-end-page-lot-number_' + index} onChange={this.handleChange.bind(this, index)} clearButton onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageLotNumber} errorMessageForce={item.errorMessageLotNumber !== ''} />
              </ListItem>
            </List>];
          }) : null}


          <Block>
            <Row>
              <Col>
                {this.status ? <Button fill onClick={this.buttonNext.bind(this)}>{this.state.dict.next}</Button> : <Button fill onClick={this.buttonRegistration.bind(this)}>{this.state.dict.registration}</Button>}
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
            parentSelector={() => { return document.querySelector('#production-end-page-modal'); }}
          >
            <Block className="no-margin-bottom">
              {this.state.dict.msg_production_to_end}
            </Block>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.production_start_time}</Label>
                <Input type="text" name="productionStartTime" readonly inputId="production-end-page-modal-start-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.production_end_time}</Label>
                <Input type="text" name="productionEndTime" readonly inputId="production-end-page-modal-end-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.duration_minutes}</Label>
                <Input type="number" name="producingTimeMinutes" value={this.state.producingTimeMinutes}
                  readonly inputId="production-end-page-modal-working-time-minutes" />
              </ListItem>
            </List>
            <Block>
              <Row>
                <Col width="50">
                  <Button fill onClick={this.buttonOk.bind(this)}>OK</Button>
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
    cond: state.core.production.cond,
  };
}

function mapDispatchToProps(dispatch) {
  return {

    updateProductionDetails(value) {
      dispatch(updateProductionDetails(value));
    },

    addCondition(value) {
      dispatch(addCondition(value));
    },
    clearCondition(value) {
      dispatch(clearCondition(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductionEndPage);