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
import { addCondition, clearCondition } from 'karte/apps/core/reducers/production-reducer';
import Production from 'karte/apps/core/logics/production';
import Material from 'karte/shared/master/material';


class ProductionEndMaterialPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        production_end: '',
        material_code: '',
        lot_number: '',
        purged_amount: '',
        material_amount: '',
        registration: '',
        production_start_time: '',
        production_end_time: '',
        duration_minutes: '',
        msg_production_to_end: '',
        msg_error_not_isnumber: '',
        msg_error_over_length_with_item: '',
        msg_record_added: '',
        material_not_specified: '',
        ok: '',
        cancel: '',
      },
      currentTabIndex: 0,
      producingTimeMinutes: 0,
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.production = props.cond;
    /** タブ表示のサンプル。 */
    this.tabLinks = [];
    this.productionLots = [];
    this.pickerLotNumberPicker = [];

    let tblProductionDetailVos = this.production.tblProductionDetailVos;
    let status = true;
    this.production['currentTabIndex'] = 0;
    for (let key in tblProductionDetailVos) {
      let item = tblProductionDetailVos[key];
      let tabData = {
        tabLinkId: 'productionDetail' + key,
        tabLinkText: tblProductionDetailVos[key].componentCode,
        active: false
      };
      if (
        (item['material01Id'] !== undefined && item['material01Id'] !== '') ||
        (item['material02Id'] !== undefined && item['material02Id'] !== '') ||
        (item['material03Id'] !== undefined && item['material03Id'] !== '')
      ) {
        if (status) {
          status = false;
          this.production['currentTabIndex'] = key;
          tabData.active = true;
        }
        tblProductionDetailVos[key]['isEmpty'] = false;
      } else {
        if (this.production.isEdit) {
          tblProductionDetailVos[key]['isEmpty'] = true;
        }
      }
      this.tabLinks.push(tabData);
    }
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
    // let state = this.state;
    if (this.production.tblProductionDetailVos === undefined) {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-end?id=' + this.$f7route.query.id, { pushState: true, reloadAll: true });
      return;
    }
    this.production.tblProductionDetailVos = this.production.tblProductionDetailVos.map((item) => {
      let material01Amount = (Number(item.completeCount) + Number(item.defectCount)) * Number(item.numerator01) / Number(item.denominator01);
      let material02Amount = (Number(item.completeCount) + Number(item.defectCount)) * Number(item.numerator02) / Number(item.denominator02);
      let material03Amount = (Number(item.completeCount) + Number(item.defectCount)) * Number(item.numerator03) / Number(item.denominator03);
      item['material01Amount'] = isNaN(material01Amount) ? '' : (Math.ceil(material01Amount * 10000) / 10000).toFixed(5);
      item['material02Amount'] = isNaN(material02Amount) ? '' : (Math.ceil(material02Amount * 10000) / 10000).toFixed(5);
      item['material03Amount'] = isNaN(material03Amount) ? '' : (Math.ceil(material03Amount * 10000) / 10000).toFixed(5);

      item = Object.assign({
        material01Id: '',
        material01Code: '',
        material01LotNo: '',
        material01Amount: '',
        material01PurgedAmount: '',
        material01Name: '',
        numerator01: '',
        denominator01: '',
        material01Grade: '',
        material01Type: '',
        material02Id: '',
        material02Code: '',
        material02LotNo: '',
        material02Amount: '',
        material02PurgedAmount: '',
        material02Name: '',
        numerator02: '',
        denominator02: '',
        material02Grade: '',
        material02Type: '',
        material03Id: '',
        material03Code: '',
        material03LotNo: '',
        material03Amount: '',
        material03PurgedAmount: '',
        material03Name: '',
        numerator03: '',
        denominator03: '',
        material03Grade: '',
        material03Type: '',
      }, item);
      return item;
    });
    this.setState({
      tblProductionDetailVos: this.production.tblProductionDetailVos
    }, () => {
      let tblProductionDetailVos = this.state.tblProductionDetailVos;
      let currentTabIndex = this.state.currentTabIndex;
      if (tblProductionDetailVos[currentTabIndex].material01Id) this.loadMaterialLot(tblProductionDetailVos[currentTabIndex].material01Id, '01');
      if (tblProductionDetailVos[currentTabIndex].material02Id) this.loadMaterialLot(tblProductionDetailVos[currentTabIndex].material02Id, '02');
      if (tblProductionDetailVos[currentTabIndex].material03Id) this.loadMaterialLot(tblProductionDetailVos[currentTabIndex].material03Id, '03');
    });

    // this.setState({ ...Object.assign(state, this.production) });
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
    this.startTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#production-end-material-page-start-time');
    //開始登録時の時刻をセット
    var startDatetime = this.production.startDatetimeStr;
    var endDatetime = this.production.endDatetimeStr;
    this.setState({
      producingTimeMinutes: me.calcCostMinutes(startDatetime, endDatetime)
    });

    this.startTimePicker.setValue(this.converDateStrToArr(startDatetime), 0);
    this.startTimePicker.on('change', function (picker, value) {
      me.production.startDatetime = moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(startDatetime).getSeconds())).format('YYYY-MM-DDTHH:mm:ss');
      me.production.producingTimeMinutes = me.calcCostMinutes(me.convertDateArrToStr(value), me.production.endDatetimeStr);
      me.setState({
        producingTimeMinutes: me.calcCostMinutes(me.convertDateArrToStr(value), me.production.endDatetimeStr)
      });
    });

    //終了日付に現在時刻をデフォルトセット
    this.endTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#production-end-material-page-end-time');
    this.endTimePicker.setValue(this.converDateStrToArr(endDatetime), 0);
    this.endTimePicker.on('change', function (picker, value) {
      me.production.endDatetime = moment(new Date(me.convertDateArrToStr(value) + ':' + new Date(endDatetime).getSeconds())).format('YYYY-MM-DDTHH:mm:ss');
      me.production.producingTimeMinutes = me.calcCostMinutes(me.production.startDatetimeStr, me.convertDateArrToStr(value));
      me.setState({
        producingTimeMinutes: me.calcCostMinutes(me.production.startDatetimeStr, me.convertDateArrToStr(value))
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

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
  }

  /**
   * Event will be triggered right before page is going to be transitioned out of view
   */
  onPageBeforeOut() {
    //続けて検索ボタンが押されていなければ、検索条件をすべてクリアする
    // if (!this.pressedNext) {
    // this.props.clearCondition();
    // }
  }
  /**
   * 戻る
   */
  onBackClick() {
    //生産終了画面に戻る
    this.production.tblProductionDetailVos = this.state.tblProductionDetailVos;
    this.props.addCondition({ ...this.production, option: true });
    this.$f7router.back();
  }

  tabChange(tabIndex) {
    this.production.currentTabIndex = tabIndex;
    this.setState({ currentTabIndex: tabIndex }, () => {
      let tblProductionDetailVos = this.state.tblProductionDetailVos;
      if (tblProductionDetailVos[tabIndex].material01Id) this.loadMaterialLot(tblProductionDetailVos[tabIndex].material01Id, '01');
      if (tblProductionDetailVos[tabIndex].material02Id) this.loadMaterialLot(tblProductionDetailVos[tabIndex].material02Id, '02');
      if (tblProductionDetailVos[tabIndex].material03Id) this.loadMaterialLot(tblProductionDetailVos[tabIndex].material03Id, '03');
    });
  }

  /**
   * 登録ボタン
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

  buttonOk() {
    this.$f7.preloader.show();
    let me = this;
    let production = this.production;
    production.tblProductionDetailVos = this.state.tblProductionDetailVos;
    production.structureFlg = 1;
    Production.end(production)
      .then(() => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        //メインメニューに戻る
        me.$f7.dialog.create({
          text: me.state.dict.msg_record_added,
          buttons: [{
            text: me.state.dict.ok,
            onClick: function () {
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

  buttonRegistration() {
    let me = this;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    let result = false;
    let reg = /(\w*)%s(.*)%s(.*)/g;
    for (let key in tblProductionDetailVos) {
      let value = tblProductionDetailVos[key];
      if (value.material01PurgedAmount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material01PurgedAmount)) {
        tblProductionDetailVos[key]['errorMessageMaterial01PurgedAmount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial01PurgedAmount'] = '';
      }
      if (!this.checkDecimal(value.material01PurgedAmount, [18, 5])) {
        tblProductionDetailVos[key]['errorMessageMaterial01PurgedAmount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.purged_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial01PurgedAmount'] = '';
      }
      if (value.material02PurgedAmount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material02PurgedAmount)) {
        tblProductionDetailVos[key]['errorMessageMaterial02PurgedAmount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial02PurgedAmount'] = '';
      }
      if (!this.checkDecimal(value.material02PurgedAmount, [18, 5])) {
        tblProductionDetailVos[key]['errorMessageMaterial02PurgedAmount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.purged_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial02PurgedAmount'] = '';
      }
      if (value.material03PurgedAmount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material03PurgedAmount)) {
        tblProductionDetailVos[key]['errorMessageMaterial03PurgedAmount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial03PurgedAmount'] = '';
      }
      if (!this.checkDecimal(value.material03PurgedAmount, [18, 5])) {
        tblProductionDetailVos[key]['errorMessageMaterial03PurgedAmount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.purged_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial03PurgedAmount'] = '';
      }

      if (value.material01Amount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material01Amount)) {
        tblProductionDetailVos[key]['errorMessageMaterial01Amount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial01Amount'] = '';
      }
      if (!this.checkDecimal(value.material01Amount, [18, 5])) {
        tblProductionDetailVos[key]['errorMessageMaterial01Amount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.material_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial01Amount'] = '';
      }
      if (value.material02Amount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material02Amount)) {
        tblProductionDetailVos[key]['errorMessageMaterial02Amount'] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial02Amount' + key] = '';
      }
      if (!this.checkDecimal(value.material02Amount, [18, 5])) {
        tblProductionDetailVos[key]['errorMessageMaterial02Amount'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.material_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial02Amount' + key] = '';
      }
      if (value.material03Amount !== '' && !/^\d+(?=\.{0,1}\d+$|$)/.test(value.material03Amount)) {
        tblProductionDetailVos[key]['errorMessageMaterial03Amount' + key] = this.state.dict.msg_error_not_isnumber;
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial03Amount' + key] = '';
      }
      if (!this.checkDecimal(value.material03Amount, [18, 5])) {
        tblProductionDetailVos[key]['errorMessageMaterial03Amount' + key] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.material_amount + '$[18.5]$3');
        result = true;
        break;
      } else {
        tblProductionDetailVos[key]['errorMessageMaterial03Amount' + key] = '';
      }
    }
    this.setState({
      tblProductionDetailVos: tblProductionDetailVos
    });
    if (result) {
      return;
    }
    me.openModal();
  }


  handleChange(index, event) {
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    tblProductionDetailVos[index][event.target.name] = event.target.value;
    this.setState({
      tblProductionDetailVos: tblProductionDetailVos
    });
  }
  handleClear(index, event) {
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    tblProductionDetailVos[index][event.target.name] = '';
    this.setState({
      tblProductionDetailVos: tblProductionDetailVos
    });
  }
  /**
   * ロット番号
   */
  loadMaterialLot(materialId, num) {
    var me = this;
    Material.getMaterialLot(materialId).then((response) => {
      let currentTabIndex = this.state.currentTabIndex;
      if (me.productionLots[currentTabIndex] !== undefined) {
        me.productionLots[currentTabIndex][num] = response['tblMaterialLots'];
      } else {
        me.productionLots[currentTabIndex] = {};
        me.productionLots[currentTabIndex][num] = response['tblMaterialLots'];
      }
      // console.log(me.productionLots);
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
    if (me.productionLots[index] === undefined || me.productionLots[index][num] === undefined || me.productionLots[index][num].length < 1) {
      return;
    }
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    let component = tblProductionDetailVos[index];
    if (!component) {
      return;
    }
    let LotNo = component['material' + num + 'LotNo'];
    let productionLots = me.productionLots[index][num];
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
    let pickerLotNumberPicker = me.createPicker('#production-end-material-page-material' + num + '-lot-no_' + index, _values, _displayValues,
      //Col Change Callback
      (picker, value) => {
        document.getElementById('production-end-material-page-material' + num + '-lot-no_' + index).readOnly = false;
        tblProductionDetailVos[index]['material' + num + 'LotNo'] = value;
        me.setState({
          tblProductionDetailVos: tblProductionDetailVos,
        });
      }
    );
    document.getElementById('production-end-material-page-material' + num + '-lot-no_' + index).readOnly = false;
    me.pickerLotNumberPicker[index + num] = pickerLotNumberPicker;
    if (setDefault && defaultValue !== null) {
      pickerLotNumberPicker.setValue([defaultValue], 0);
      tblProductionDetailVos[index]['material' + num + 'LotNo'] = defaultValue;
      me.setState({
        tblProductionDetailVos: tblProductionDetailVos
      });
    }
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.production_end}>
        <Page id="production-end-material-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} onPageBeforeOut={this.onPageBeforeOut.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.production_end}</BlockTitle>
          {/** 部品の数だけタブにする */}
          <Block className="no-margin-bottom no-padding">
            <TabHeader tabLinks={this.tabLinks} onTabChange={this.tabChange.bind(this)}></TabHeader>
          </Block>

          <Tabs>
            {this.state.tblProductionDetailVos ? this.state.tblProductionDetailVos.map((item, index) => {
              return item.isEmpty ? <Tab key={index} tabActive={parseInt(this.production.currentTabIndex) === index} id={'productionDetail' + index} style={{ textAlign: 'center' }}>{this.state.dict.material_not_specified}</Tab> : <Tab key={index} tabActive={parseInt(this.production.currentTabIndex) === index} id={'productionDetail' + index}>
                {/** 材料01 */}
                <Block className="no-margin">
                  <Row>
                    <Col width="50">{this.state.dict.material_code}</Col>
                    <Col width="50">{item.material01Code}</Col>
                  </Row>
                  <Row>
                    <Col width="100">{item.material01Name + ' ' + item.material01Type + ' ' + item.material01Grade}</Col>
                  </Row>
                </Block>
                <List noHairlinesBetween className="no-margin-top">
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name={'material01LotNo'} value={item.material01LotNo} clearButton inputId={'production-end-material-page-material01-lot-no_' + index} onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial01LotNo} errorMessageForce={item.errorMessageMaterial01LotNo !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name={'material01PurgedAmount'} className="purgedAmount" value={item.material01PurgedAmount} inputId={'production-end-material-page-material01-purged-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial01PurgedAmount} errorMessageForce={item.errorMessageMaterial01PurgedAmount !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.material_amount}</Label>
                    <Input type="number" name={'material01Amount'} className="amount" value={item.material01Amount} inputId={'production-end-material-page-material01-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial01Amount} errorMessageForce={item.errorMessageMaterial01Amount !== ''} />
                  </ListItem>
                </List>
                {/** 材料02 */}
                <Block className="no-margin">
                  <Row>
                    <Col width="50">{this.state.dict.material_code}</Col>
                    <Col width="50">{item.material02Code}</Col>
                  </Row>
                  <Row>
                    <Col width="100">{item.material02Name + ' ' + item.material02Type + ' ' + item.material02Grade}</Col>
                  </Row>
                </Block>
                <List noHairlinesBetween className="no-margin-top">
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material02LotNo" value={item.material02LotNo} clearButton inputId={'production-end-material-page-material02-lot-no_' + index} onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial02LotNo} errorMessageForce={item.errorMessageMaterial02LotNo !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name="material02PurgedAmount" className="purgedAmount" value={item.material02PurgedAmount} inputId={'production-end-material-page-material02-purged-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial02PurgedAmount} errorMessageForce={item.errorMessageMaterial02PurgedAmount !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.material_amount}</Label>
                    <Input type="number" name="material02Amount" className="amount" value={item.material02Amount} inputId={'production-end-material-page-material02-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial02Amount} errorMessageForce={item.errorMessageMaterial02Amount !== ''} />
                  </ListItem>
                </List>
                {/** 材料03 */}
                <Block className="no-margin">
                  <Row>
                    <Col width="50">{this.state.dict.material_code}</Col>
                    <Col width="50">{item.material03Code}</Col>
                  </Row>
                  <Row>
                    <Col width="100">{item.material03Name + ' ' + item.material03Type + ' ' + item.material03Grade}</Col>
                  </Row>
                </Block>
                <List noHairlinesBetween className="no-margin-top">
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material03LotNo" value={item.material03LotNo} clearButton inputId={'production-end-material-page-material03-lot-no_' + index} onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial03LotNo} errorMessageForce={item.errorMessageMaterial03LotNo !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name="material03PurgedAmount" className="purgedAmount" value={item.material03PurgedAmount} inputId={'production-end-material-page-material03-purged-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial03PurgedAmount} errorMessageForce={item.errorMessageMaterial03PurgedAmount !== ''} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.material_amount}</Label>
                    <Input type="number" name="material03Amount" className="amount" value={item.material03Amount} inputId={'production-end-material-page-material03-amount_' + index} clearButton onChange={this.handleChange.bind(this, index)} onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial03Amount} errorMessageForce={item.errorMessageMaterial03Amount !== ''} />
                  </ListItem>
                </List>
              </Tab>;
            }) : null}
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
            parentSelector={() => { return document.querySelector('#production-end-material-page'); }}
          >
            <Block className="no-margin-bottom">
              {this.state.dict.msg_production_to_end}
            </Block>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.production_start_time}</Label>
                <Input type="text" name="productionStartTime" readonly inputId="production-end-material-page-start-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.production_end_time}</Label>
                <Input type="text" name="productionEndTime" readonly inputId="production-end-material-page-end-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.duration_minutes}</Label>
                <Input type="number" name="producingTimeMinutes" value={this.state.producingTimeMinutes} readonly inputId="production-end-material-page-working-time-minutes" />
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
)(ProductionEndMaterialPage);