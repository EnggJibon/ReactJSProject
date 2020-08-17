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
  Toolbar,
  Link
} from 'framework7-react';
import { Dom7 } from 'framework7';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import TabHeader from 'karte/shared/components/TabHeader';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import { addCondition, clearCondition } from 'karte/apps/core/reducers/production-reducer';
import { connect } from 'react-redux';
import moment from 'moment';
import Material from 'karte/shared/master/material';
import Mold from 'karte/shared/master/mold';
import Machine from 'karte/shared/master/machine';
import Work from 'karte/apps/core/logics/work';
import Production from 'karte/apps/core/logics/production';
import { updateMachineReportInfo } from 'karte/apps/machine/reducers/machine-report-reducer';


class ProductionStartMaterialPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        production_start: '',
        material_code: '',
        lot_number: '',
        purged_amount: '',
        registration: '',
        msg_confirm_start_production: '',
        production_start_time: '',
        ok: '',
        cancel: '',
        msg_warning_mold_under_maintenance: '',
        msg_warning_machine_under_maintenance: '',
        msg_warning_machine_work_conflict: '',
        msg_warning_machine_production_conflict: '',
        msg_warning_mold_work_conflict: '',
        msg_warning_mold_production_conflict: '',
        msg_record_added: '',
        msg_error_not_isnumber: '',
        msg_error_over_length_with_item: '',
        yes:''
      },
      modalIsOpen: false,
      currentTabIndex: 0,
      production: '',
      tblProductionDetailVos: [],
      searchClickId: '',
      itemInx: '',
      moldMsgStatus: true,
      startDatetime: moment(new Date()).format('YYYY/MM/DD HH:mm'),
    };
    /** タブ表示のサンプル。 */
    this.tabLinks = [];
    this.production = props.cond;

    let tblProductionDetailVos = this.production.tblProductionDetailVos;
    for (let key in tblProductionDetailVos) {
      this.tabLinks.push({
        tabLinkId: 'productionDetail' + key,
        tabLinkText: tblProductionDetailVos[key].componentCode,
        active: key === '0' ? true : false
      });
    }
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.materials = [];

    this.moldMsgStatus = true;
    this.machineMsgStatus = true;
    this.workMsgStatus = true;
    this.productionMsgStatus = true;
    this.checkResult = {};
    this.errorStatus = true;
    this.machineReportInfo = props.reportInfo;
    this.productionLots = {};
    this.pickerLotNumberPicker = [];
  }

  openModal() {
    this.setState({ modalIsOpen: true });
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

  afterOpenModal() {
    let me = this;
    if (me.startTimePicker) {
      me.startTimePicker.destroy();
    }
    const app = me.$f7;

    var startDatetime = moment(new Date(me.production.productionDate)).format('YYYY/MM/DD');
    startDatetime = startDatetime + moment(new Date()).format(' HH:mm');
    me.startTimePicker = CalendarUtil.createDateTimePicker(app, me.state.dict.close, '#production-start-material-page-start-time', {
      change: function (picker, value) {
        let val = value[0] + '/' + value[1] + '/' + value[2] + ' ' + value[3] + ':' + value[4];
        me.setState({
          startDatetime: moment(new Date(val)).format('YYYY/MM/DD HH:mm')
        });
      }
    });
    me.startTimePicker.setValue(me.converDateStrToArr(startDatetime), 0);

  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  okModal() {
    let me = this;
    let production = this.production;
    let state = this.state;
    production.startDatetime = moment(new Date(state.startDatetime)).format('YYYY-MM-DDTHH:mm:ss');
    this.setState({ modalIsOpen: false });
    this.$f7.preloader.show();
    // let data = Object.assign(production,state);
    production.tblProductionDetailVos = state.tblProductionDetailVos;
    if (!me.errorStatus) {
      production['isStart'] = true;
    }
    Production.post(production)
      .then((response) => {
        //Preloaderを消去
        this.$f7.preloader.hide();
        if (this.errorStatus && response.errorMessage !== undefined && response.errorMessage !== '') {
          me.$f7.dialog.create({
            text: response.errorMessage,
            buttons: [{
              text: this.state.dict.cancel,
              onClick: function (dialog) {
                dialog.close();
              }
            }, {
              text: this.state.dict.ok,
              onClick: function () {
                me.errorStatus = false;
                me.okModal();
              }
            }]
          }).open();
        } else {
          //メインメニューに戻る
          me.$f7.dialog.create({
            text: me.state.dict.msg_record_added,
            buttons: [{
              text: this.state.dict.ok,
              onClick: function () {
                let { pageName } = production.query;
                if (pageName === 'reportDetail') {
                  let query = production.query;
                  query['reportDate'] = moment(new Date(query['reportDate'])).format('YYYY/MM/DD');
                  delete query['productionDate'];
                  let params = Object.keys(query).map(function (key) {
                    if (query[key]) {
                      return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
                    } else {
                      return '';
                    }
                  }).join('&');
                  me.props.clearCondition();
                  me.machineReportInfo.reload = '3';
                  me.machineReportInfo.reportDate = moment(new Date(query['reportDate'])).format('YYYY/MM/DD');
                  me.props.updateMachineReportInfo(me.machineReportInfo);
                  me.$f7router.navigate(APP_DIR_PATH + '/report-detail?' + params, { pushState: true, reloadAll: true });
                } else {
                  me.props.clearCondition();
                  me.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-sub-menu', { reloadAll: true });
                }
              }
            }]
          }).open();
        }
      }).catch((err) => {
        this.$f7.preloader.hide();
        var error = err;
        if (error['errorCode'] === 'E201') {
          this.$f7.dialog.alert(error.errorMessage);
        } else {
          this.setState(() => { throw new UnexpectedError(error); });
        }
      });
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
  }

  componentWillUmount() {
    Dom7('.purgedAmount').find('input').off('keydown', this.handleKeyPress);
  }

  UNSAFE_componentWillUpdate() {
    Dom7('.purgedAmount').find('input').on('keydown', this.handleKeyPress);
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
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-start', { reloadAll: true });
      return;
    }
    this.production.tblProductionDetailVos = this.production.tblProductionDetailVos.map((item) => {
      item['optionFlag'] = item['optionFlag'] !== 4 ? 3 : item['optionFlag'];
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
      ...this.production,
      // tblProductionDetailVos:this.production.tblProductionDetailVos
    });
    this.loadMaterial(0, this.production.tblProductionDetailVos);
  }

  loadMaterial(tabIndex, tblProductionDetailVos) {
    let me = this;
    tblProductionDetailVos = tblProductionDetailVos === undefined ? me.state.tblProductionDetailVos : tblProductionDetailVos;
    let component = tblProductionDetailVos[tabIndex];
    if (component['optionFlag'] === 4) {
      let procedureCodeName = component.procedureCodeName;
      procedureCodeName = procedureCodeName ? procedureCodeName.trim().split(/\s+/) : ['', ''];
      Material.getMaterialFForComponent({
        componentId: component.componentId,
        proceduerCode: procedureCodeName[0]
      })
        .then((response) => {
          let materials = response.mstComponentMaterials;
          var productionDate = new Date(moment(new Date(me.production.productionDate)).format('YYYY/MM/DD')).getTime();
          let continueCount = 0;
          let materialIndex = '';
          for (let key in materials) {
            let value = materials[key];
            //開始日付、終了日付チェックし、生産日時点で適用されるべきレコードのみを取得
            let startDate = new Date(moment(new Date(value['startDate'])).format('YYYY/MM/DD')).getTime();
            let endDate = new Date(moment(new Date(value['endDate'])).format('YYYY/MM/DD')).getTime();
            if (startDate > productionDate || endDate < productionDate) {
              continueCount = continueCount + 1;
              continue;
            }
            if (parseInt(key) + 1 < 10) {
              materialIndex = '0' + (parseInt(key) + 1 - continueCount);
            } else {
              materialIndex = (parseInt(key) + 1 - continueCount);
            }
            tblProductionDetailVos[tabIndex]['material' + (materialIndex) + 'Id'] = value.mstMaterial['id'];
            tblProductionDetailVos[tabIndex]['material' + (materialIndex) + 'Code'] = value.mstMaterial['materialCode'];
            tblProductionDetailVos[tabIndex]['material' + (materialIndex) + 'Name'] = value.mstMaterial['materialName'];
            tblProductionDetailVos[tabIndex]['material' + (materialIndex) + 'Grade'] = value.mstMaterial['materialGrade'];
            tblProductionDetailVos[tabIndex]['material' + (materialIndex) + 'Type'] = value.mstMaterial['materialType'];
          }
          me.setState({
            tblProductionDetailVos: tblProductionDetailVos
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
   * 材料コード
   */
  createMaterialCode1Autocomplete(index) {
    var me = this;
    const app = me.$f7;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (index === null) return;
    if (tblProductionDetailVos[index]['material01Id'] !== '') {
      me.loadMaterialLot(tblProductionDetailVos[index]['material01Id'], '01');
    }
    return app.autocomplete.create({
      inputEl: '#production-start-material-page-material01-code' + index,
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
          tblProductionDetailVos[index]['material01Id'] = value[0].id;
          tblProductionDetailVos[index]['material01Code'] = value[0].materialCode;
          tblProductionDetailVos[index]['material01Name'] = value[0].materialName;
          tblProductionDetailVos[index]['material01Grade'] = value[0].materialGrade;
          tblProductionDetailVos[index]['material01Type'] = value[0].materialType;
          me.loadMaterialLot(value[0].id, '01');
          me.setState({
            tblProductionDetailVos: tblProductionDetailVos
          });
        }
      },
    });
  }

  createMaterialCode2Autocomplete(index) {
    var me = this;
    const app = me.$f7;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (index === null) return;
    if (tblProductionDetailVos[index]['material01Id'] !== '') {
      me.loadMaterialLot(tblProductionDetailVos[index]['material01Id'], '02');
    }
    return app.autocomplete.create({
      inputEl: '#production-start-material-page-material02-code' + index,
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
          tblProductionDetailVos[index]['material02Id'] = value[0].id;
          tblProductionDetailVos[index]['material02Code'] = value[0].materialCode;
          tblProductionDetailVos[index]['material02Name'] = value[0].materialName;
          tblProductionDetailVos[index]['material02Grade'] = value[0].materialGrade;
          tblProductionDetailVos[index]['material02Type'] = value[0].materialType;
          me.loadMaterialLot(value[0].id, '02');
          me.setState({
            tblProductionDetailVos: tblProductionDetailVos
          });
        },
      },
    });
  }

  createMaterialCode3Autocomplete(index) {
    var me = this;
    const app = me.$f7;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (index === null) return;
    if (tblProductionDetailVos[index]['material01Id'] !== '') {
      me.loadMaterialLot(tblProductionDetailVos[index]['material01Id'], '03');
    }
    return app.autocomplete.create({
      inputEl: '#production-start-material-page-material03-code' + index,
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
          tblProductionDetailVos[index]['material03Id'] = value[0].id;
          tblProductionDetailVos[index]['material03Code'] = value[0].materialCode;
          tblProductionDetailVos[index]['material03Name'] = value[0].materialName;
          tblProductionDetailVos[index]['material03Grade'] = value[0].materialGrade;
          tblProductionDetailVos[index]['material03Type'] = value[0].materialType;
          me.loadMaterialLot(value[0].id, '03');
          me.setState({
            tblProductionDetailVos: tblProductionDetailVos
          });
        },
      },
    });
  }

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
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
    let pickerLotNumberPicker = me.createPicker('#production-start-material-page-material' + num + '-lot-no', _values, _displayValues,
      //Col Change Callback
      (picker, value) => {
        document.getElementById('production-start-material-page-material' + num + '-lot-no').readOnly = false;
        tblProductionDetailVos[index]['material' + num + 'LotNo'] = value;
        me.setState({
          tblProductionDetailVos: tblProductionDetailVos,
        });
      }
    );
    document.getElementById('production-start-material-page-material' + num + '-lot-no').readOnly = false;
    me.pickerLotNumberPicker[index + num] = pickerLotNumberPicker;
    if (setDefault && defaultValue !== null) {
      pickerLotNumberPicker.setValue([defaultValue], 0);
      tblProductionDetailVos[index]['material' + num + 'LotNo'] = defaultValue;
      me.setState({
        tblProductionDetailVos: tblProductionDetailVos
      });
    }
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
    //生産開始に戻る
    let production = this.state.tblProductionDetailVos;
    production = production.map(item => {
      item['optionFlag'] = 3;
      return item;
    });
    this.production.tblProductionDetailVos = production;
    this.props.addCondition({ ...this.production, option: true });
    this.$f7router.back();
  }

  tabChange(tabIndex) {
    this.setState({ currentTabIndex: tabIndex });
    this.loadMaterial(tabIndex);
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
  registrationSubmit() {
    let me = this;
    let production = this.state;
    Promise.all([
      Mold.getMoldDetail({ moldId: encodeURIComponent(production.moldId) }),
      production.machineId ? Machine.checkMachineUnderMaintenance(encodeURIComponent(production.machineId)) : null,
      production.machineUuid ? Work.workMachineConflictCheck({ machineUuid: production.machineUuid }) : null,
      production.machineUuid ? Production.conflictcheck({ machineUuid: production.machineUuid }) : null,
      production.moldUuid ? Work.workMoldConflictCheck({ moldUuid: production.moldUuid }) : null,//作業中
      production.moldUuid ? Production.moldConflictCheck({ moldUuid: production.moldUuid }) : null,//生産中
      production.directionCode !== '' ? Production.productioncomponentcheck(production) : null//KM-1233	生産開始時、部品が手配に属するかをチェックする
    ])
      .then((values) => {
        let check3Msg, check4Msg, check5Msg, check6Msg = '';
        if (values[2] && values[2].hasConflict) {
          check3Msg = this.state.dict.msg_warning_machine_work_conflict.replace('%machine_name%', production.machineName);
          check3Msg = check3Msg.replace('%person_name%', values[2].machineUserName);
          check3Msg += '<br/>' + this.state.dict.production_start_time + ':' + values[2].machineUseStartDatetime.substring(0, values[2].machineUseStartDatetime.length - 3);
        }

        if (values[3] && values[3].hasConflict) {
          check4Msg = this.state.dict.msg_warning_machine_production_conflict.replace('%machine_name%', production.machineName);
          check4Msg += '<br/>' + this.state.dict.production_start_time + ':' + values[3].machineUseStartDatetime.substring(0, values[3].machineUseStartDatetime.length - 3);
        }

        if (values[4] && values[4].hasConflict) {
          check5Msg = this.state.dict.msg_warning_mold_work_conflict.replace('%mold_name%', production.moldName);
          check5Msg = check5Msg.replace('%person_name%', values[4].moldUserName);
          check5Msg += '<br/>' + this.state.dict.production_start_time + ':' + values[4].moldUseStartDatetime.substring(0, values[4].moldUseStartDatetime.length - 3);
        }

        if (values[5] && values[5].hasConflict) {
          check6Msg = this.state.dict.msg_warning_mold_production_conflict.replace('%mold_name%', production.moldName);
          check6Msg += '<br/>' + this.state.dict.production_start_time + ':' + values[5].moldUseStartDatetime.substring(0, values[5].moldUseStartDatetime.length - 3);
        }

        this.checkResult = [
          {
            result: values[0] ? values[0].mainteStatus === 1 ? true : false : false,
            errorMessage: this.state.dict.msg_warning_mold_under_maintenance
          },
          {
            result: values[1] ? values[1].mainteStatus === 1 ? true : false : false,
            errorMessage: this.state.dict.msg_warning_machine_under_maintenance
          },
          {
            result: values[2] ? values[2].hasConflict : false,
            errorMessage: check3Msg
          },
          {
            result: values[3] ? values[3].hasConflict : false,
            errorMessage: check4Msg
          },
          { //作業中
            result: values[4] ? values[4].hasConflict : false,
            errorMessage: check5Msg
          },
          { //生産中
            result: values[5] ? values[5].hasConflict : false,
            errorMessage: check6Msg
          },
          { //KM-1233
            result: values[6] ? values[6].error : false,
            errorMessage: values[6] && values[6].error ? values[6].errorMessage.replace(/\r\n/g, '<br>') : ''
          }
        ];
        me.check();
      })
      .catch((err) => {
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
    }
    this.setState({
      tblProductionDetailVos: tblProductionDetailVos
    });
    if (result) {
      return;
    }
    me.registrationSubmit();
  }

  check() {
    let me = this;
    let app = me.$f7;
    for (let key in this.checkResult) {
      let value = this.checkResult[key];
      if (value['result']) {
        this.checkResult[key].result = false;
        app.dialog.create({
          text: value['errorMessage'],
          buttons: [{
            text: this.state.dict.cancel,
            onClick: function (dialog) {
              dialog.close();
            }
          }, {
            text: this.state.dict.ok,
            onClick: function () {
              me.check();
            }
          }]
        }).open();
        break;
      }
      if (key === '6') {
        this.openModal();
      }
    }
  }


  handleChange(index, event) {
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    tblProductionDetailVos[index][event.target.name] = event.target.value;
    tblProductionDetailVos[index]['optionFlag'] = 3;
    if (event.target.name === 'material01Code') {
      tblProductionDetailVos[index]['material01Name'] = '';
      tblProductionDetailVos[index]['material01Id'] = '';
      tblProductionDetailVos[index]['material01Grade'] = '';
      tblProductionDetailVos[index]['material01Type'] = '';
      tblProductionDetailVos[index]['material01LotNo'] = '';
    }
    if (event.target.name === 'material02Code') {
      tblProductionDetailVos[index]['material02Name'] = '';
      tblProductionDetailVos[index]['material02Id'] = '';
      tblProductionDetailVos[index]['material02Grade'] = '';
      tblProductionDetailVos[index]['material02Type'] = '';
      tblProductionDetailVos[index]['material02LotNo'] = '';
    }
    if (event.target.name === 'material03Code') {
      tblProductionDetailVos[index]['material03Name'] = '';
      tblProductionDetailVos[index]['material03Id'] = '';
      tblProductionDetailVos[index]['material03Grade'] = '';
      tblProductionDetailVos[index]['material03Type'] = '';
      tblProductionDetailVos[index]['material023LotNo'] = '';
    }

    if (event.target.value !== '') {
      let name = event.target.name;
      let msgName = name.charAt(0).toUpperCase() + name.slice(1);
      tblProductionDetailVos[index]['errorMessage' + msgName] = '';
    }
    this.setState({
      tblProductionDetailVos
    });
  }


  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(index, event) {
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    tblProductionDetailVos[index][event.target.name] = '';
    tblProductionDetailVos[index]['optionFlag'] = 3;
    if (event.target.name === 'material01Code') {
      tblProductionDetailVos[index]['material01Name'] = '';
      tblProductionDetailVos[index]['material01Id'] = '';
      tblProductionDetailVos[index]['material01Grade'] = '';
      tblProductionDetailVos[index]['material01Type'] = '';
      tblProductionDetailVos[index]['material01LotNo'] = '';
      if (this.pickerLotNumberPicker[index+'01'] !== undefined) {
        this.pickerLotNumberPicker[index+'01'].destroy();
      }
    }
    if (event.target.name === 'material02Code') {
      tblProductionDetailVos[index]['material02Name'] = '';
      tblProductionDetailVos[index]['material02Id'] = '';
      tblProductionDetailVos[index]['material02Grade'] = '';
      tblProductionDetailVos[index]['material02Type'] = '';
      tblProductionDetailVos[index]['material02LotNo'] = '';
      if (this.pickerLotNumberPicker[index+'02'] !== undefined) {
        this.pickerLotNumberPicker[index+'02'].destroy();
      }
    }
    if (event.target.name === 'material03Code') {
      tblProductionDetailVos[index]['material03Name'] = '';
      tblProductionDetailVos[index]['material03Id'] = '';
      tblProductionDetailVos[index]['material03Grade'] = '';
      tblProductionDetailVos[index]['material03Type'] = '';
      tblProductionDetailVos[index]['material023LotNo'] = '';
      if (this.pickerLotNumberPicker[index+'03'] !== undefined) {
        this.pickerLotNumberPicker[index+'03'].destroy();
      }
    }
    this.setState({
      tblProductionDetailVos
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
    this.$f7router.navigate(APP_DIR_PATH + '/materialSearch', { props: { onSelectedCell: this.onSelectedCell.bind(this) } });
  }

  onSelectedCell(item) {
    let index = this.state.searchClickId;
    let itemInx = this.state.itemInx;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (tblProductionDetailVos[index]) {
      tblProductionDetailVos[index]['material0' + itemInx + 'Id'] = item.id;
      tblProductionDetailVos[index]['material0' + itemInx + 'Code'] = item.materialCode;
      tblProductionDetailVos[index]['material0' + itemInx + 'Name'] = item.materialName;
      tblProductionDetailVos[index]['material0' + itemInx + 'Grade'] = item.materialGrade;
      tblProductionDetailVos[index]['material0' + itemInx + 'Type'] = item.materialType;
      this.setState({
        tblProductionDetailVos: tblProductionDetailVos,
      });
    }
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.production_start}>
        <Page id="production-start-material-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} onPageBeforeOut={this.onPageBeforeOut.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.production_start}</BlockTitle>
          {/** 部品の数だけタブにする */}
          <Block className="no-margin-bottom no-padding">
            <TabHeader tabLinks={this.tabLinks} onTabChange={this.tabChange.bind(this)}></TabHeader>
          </Block>

          <Tabs>
            {this.state.tblProductionDetailVos ? this.state.tblProductionDetailVos.map((item, index) => {
              return <Tab key={index} tabActive={this.state.currentTabIndex === index ? true : false} id={'productionDetail' + index}>
                {/** 材料 */}
                <List noHairlinesBetween className="no-margin-top">
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.material_code}</Label>
                    <Input type="text" name="material01Code" value={item.material01Code ? item.material01Code : ''} clearButton onInputClear={this.handleClear.bind(this, index)} inputId={'production-start-material-page-material01-code' + index} onChange={this.handleChange.bind(this, index)} autocomplete="off" />
                    <div className="btn-absolute">
                      <Button fill iconF7="search" small onClick={this.buttonMaterialSearch.bind(this, index, 1)}></Button>
                    </div>
                  </ListItem>
                  <ListItem>{item.material01Name + ' ' + item.material01Type + ' ' + item.material01Grade}</ListItem> {/** 材料名称、材質、グレード */}
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material01LotNo" value={item.material01LotNo ? item.material01LotNo : ''} onChange={this.handleChange.bind(this, index)} clearButton onInputClear={this.handleClear.bind(this, index)} inputId="production-start-material-page-material01-lot-no" maxlength={100} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name="material01PurgedAmount" className="purgedAmount" value={item.material01PurgedAmount
                    } onChange={this.handleChange.bind(this, index)} inputId="production-start-material-page-material01-purged-amount" clearButton onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial01PurgedAmount} errorMessageForce={item.errorMessageMaterial01PurgedAmount !== ''} />
                  </ListItem>
                </List>
                <List noHairlinesBetween className="no-margin-top">
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.material_code}</Label>
                    <Input type="text" name="material02Code" value={item.material02Code} clearButton onInputClear={this.handleClear.bind(this, index)} inputId={'production-start-material-page-material02-code' + index} onChange={this.handleChange.bind(this, index)} autocomplete="off" />
                    <div className="btn-absolute">
                      <Button fill iconF7="search" small onClick={this.buttonMaterialSearch.bind(this, index, 2)}></Button>
                    </div>
                  </ListItem>
                  <ListItem>{item.material02Name + ' ' + item.material02Type + ' ' + item.material02Grade}</ListItem> {/** 材料名称、材質、グレード */}
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material02LotNo" value={item.material02LotNo ? item.material02LotNo : ''} onChange={this.handleChange.bind(this, index)} clearButton onInputClear={this.handleClear.bind(this, index)} inputId="production-start-material-page-material02-lot-no" maxlength={100} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name="material02PurgedAmount" className="purgedAmount" value={item.material02PurgedAmount
                    } onChange={this.handleChange.bind(this, index)} inputId="production-start-material-page-material02-purged-amount" clearButton onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial02PurgedAmount} errorMessageForce={item.errorMessageMaterial02PurgedAmount !== ''} />
                  </ListItem>
                </List>
                <List noHairlinesBetween className="no-margin-top">
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.material_code}</Label>
                    <Input type="text" name="material03Code" value={item.material03Code} clearButton onInputClear={this.handleClear.bind(this, index)} inputId={'production-start-material-page-material03-code' + index} onChange={this.handleChange.bind(this, index)} autocomplete="off" />
                    <div className="btn-absolute">
                      <Button fill iconF7="search" small onClick={this.buttonMaterialSearch.bind(this, index, 3)}></Button>
                    </div>
                  </ListItem>
                  <ListItem>{item.material03Name + ' ' + item.material03Type + ' ' + item.material03Grade}</ListItem> {/** 材料名称、材質、グレード */}
                  <ListItem>
                    <Label >{this.state.dict.lot_number}</Label>
                    <Input type="text" name="material03LotNo" value={item.material03LotNo
                    } onChange={this.handleChange.bind(this, index)} clearButton onInputClear={this.handleClear.bind(this, index)} inputId="production-start-material-page-material03-lot-no" maxlength={100} />
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.purged_amount}</Label>
                    <Input type="number" name="material03PurgedAmount" className="purgedAmount" value={item.material03PurgedAmount
                    } onChange={this.handleChange.bind(this, index)} inputId="production-start-material-page-material03-purged-amount" clearButton onInputClear={this.handleClear.bind(this, index)} errorMessage={item.errorMessageMaterial03PurgedAmount} errorMessageForce={item.errorMessageMaterial03PurgedAmount !== ''} />
                  </ListItem>
                </List>
              </Tab>;
            }) : ''}
          </Tabs>
          <Toolbar bottomMd>
            <Link onClick={this.buttonRegistration.bind(this)}>{this.state.dict.registration}</Link>
          </Toolbar>

          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal.bind(this)}
            onAfterOpen={this.afterOpenModal.bind(this)}
            style={modalStyle}
            shouldCloseOnOverlayClick={false /** モーダル上のボタン以外では閉じさせない */}
            parentSelector={() => { return document.querySelector('#production-start-material-page'); }}
          >
            <Block className="no-margin-bottom">
              {this.state.dict.msg_confirm_start_production}
            </Block>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.production_start_time}</Label>
                <Input type="text" name="startDatetime" value={this.state.startDatetime} readonly inputId="production-start-material-page-start-time" />
              </ListItem>
            </List>
            <Block>
              <Row>
                <Col width="50">
                  <Button fill onClick={this.okModal.bind(this)}>{this.state.dict.ok}</Button>
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
    reportInfo: state.machine.machineReport.reportInfo
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateMachineReportInfo(value) {
      dispatch(updateMachineReportInfo(value));
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
)(ProductionStartMaterialPage);