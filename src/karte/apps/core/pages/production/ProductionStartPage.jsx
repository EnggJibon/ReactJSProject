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
} from 'framework7-react';
import { Dom7 } from 'framework7';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import moment from 'moment';
import { connect } from 'react-redux';
import { addCondition, clearCondition } from 'karte/apps/core/reducers/production-reducer';
import Cookies from 'universal-cookie';
import Work from 'karte/apps/core/logics/work';
import Mold from 'karte/shared/master/mold';
import Machine from 'karte/shared/master/machine';
import Procedure from 'karte/shared/master/procedure';
import Component from 'karte/shared/master/component';
import Direction from 'karte/shared/master/direction';
import Authentication from 'karte/shared/logics/authentication';
import Choice from 'karte/shared/master/choice';
import { updateMachineReportInfo } from 'karte/apps/machine/reducers/machine-report-reducer';
import System from 'karte/shared/master/system';

class ProductionStartPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        production_start: '',
        production_date: '',
        process_mass_flag: '',
        mold_id: '',
        mold_name: '',
        machine_id: '',
        machine_name: '',
        direction_code: '',
        disposed_shot_count: '',
        component_code: '',
        component_name: '',
        procedure_code: '',
        count_per_shot: '',
        lot_number: '',
        add_component: '',
        next: '',
        mst_error_record_not_found: '',
        close: '',
        msg_error_not_null: '',
        msg_error_num_over_zero: '',
        msg_error_over_length_with_item: '',
        prod_department: '',
        yes: '',
        no: '',
        cancel: ''
      },
      required:'',
      requiredMachine:'',
      productionDate: moment(new Date()).format('YYYY/MM/DD'),
      errorMessageProductionDate: '',
      workPhaseId: '',
      errorMessageWorkPhaseId: '',
      errorMessageMoldId: '',
      workPhaseName: '',
      workPhaseChoiceSeq: '',
      moldId: '',
      moldUuid: '',
      moldName: '',
      machineId: '',
      errorMessageMachineId: '',
      errorMessageDirCode: '',
      status: '0',
      dirCodeStatus: '0',
      machineUuid: '',
      machineName: '',
      directionCode: '',
      disposedShotCount: '',
      errorMessageDisposedShotCount: '',
      departmentName: '',
      department: '',
      tblProductionDetailVos: [{
        componentId: '',
        componentCode: '',
        componentName: '',
        countPerShot: '',
        lotNumber: '',
        procedureId: '',
        procedureCodeName: '',
        procedureCode: '',
        procedureName: '',
        optionFlag: 4
      }],
      componentsSearchClickId: '',
      logNumberMsg: null
    };
    this.workPhases = [];
    this.pressedNext = false; //次へが押されたかどうか
    this.procedures = {};
    this.productionLots = {};
    this.machineNames = [];
    this.checkMachineNams = [];
    this.production = [];
    this.backUpdate = false;
    this.pickerProcedures = [];
    this.pickerProductionLots = [];
    this.departments = [];
    this.machineReportInfo = props.reportInfo;
    System.load(['system.production_end_requires_machine_daily_report'])
      .then((values) => {
        this.setState({
          status: values.cnfSystems[0].configValue
        });
        if(values.cnfSystems[0].configValue==='1')
        {
          var required_mark = DictionaryLoader.requiredField();
          this.setState({requiredMachine: required_mark});
        }
        else
        {
          this.setState({requiredMachine: ''});
        }
      })
      .catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
    System.load(['system.start_production_requires_direction_code'])
      .then((values) => {
        this.setState({
          dirCodeStatus: values.cnfSystems[0].configValue
        });
      })
      .catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
  }

  componentDidMount() {
    var me = this;
    const app = me.$f7;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.createMoldAutocomplete();
        me.createMachineAutocomplete();
        me.createDirCodeAutocomplete();
        //作成したオブジェクトはページ終了処理で廃棄(destroy)する
        me.productionDateCalendar = app.calendar.create(
          CalendarUtil.getCalendarProperties('#production-start-page-production-date', {
            change: function (calendar, value) {
              me.setState({
                productionDate: moment(new Date(value)).format('YYYY/MM/DD')
              });
            }
          }));
        for (let key in me.state.tblProductionDetailVos) {
          me.createComponentsAutocomplete(key);
        }
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    Dom7('#production-start-page-disposed-shot-count').on('keydown', this.handleKeyPress);
    Dom7('.countPerShot').find('input').on('keydown', this.handleKeyPress);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.production = newProps.cond;
    if (newProps.cond.option) {
      Object.assign(this.state, newProps.cond);
      if (this.production.tblProductionDetailVos) {
        for (let key in this.production.tblProductionDetailVos) {
          let item = this.production.tblProductionDetailVos[key];
          item['id'] = item.componentId;
          setTimeout(() => {
            this.createComponentsAutocomplete(key);
          }, 200);
          this.loadProcedure(item, key);
        }
      }
    }
  }

  componentWillUmount() {
    Dom7('#production-start-page-disposed-shot-count').off('keydown', this.handleKeyPress);
    Dom7('.countPerShot').find('input').off('keydown', this.handleKeyPress);
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
    var me = this;
    let { productionDate, machineUuid, machineId, machineName } = this.$f7route.query;
    if (machineUuid) {//機械日報から遷移とき
      me.setState({
        machineUuid: machineUuid,
        machineId: machineId,
        machineName: machineName,
        productionDate: moment(new Date(productionDate)).format('YYYY/MM/DD')
      });
    }
    me.loadworkPhase();
    //ログインユーザーの所属、所属選択肢読み込み、所属Picker作成。
    Promise.all([Authentication.whoAmI(), Choice.categories('mst_user.department', {})])
      .then((values) => {
        let responseWho = values[0];
        let responseChoice = values[1];
        me.state.department = responseWho.department;
        me.departments = [...responseChoice.mstChoiceVo];
        me.createPickerDepartment(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
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
    this.pressedNext = true;
    this.backUpdate = false;
    if (!this.pressedNext) {
      this.props.clearCondition();
    }
  }

  /**
   * 戻る
   */
  onBackClick() {
    //生産登録メンテナンスサブメニューに戻る
    let me = this;
    let { machineUuid, pageName } = me.$f7route.query;
    if (pageName === 'reportDetail') {
      let query = me.$f7route.query;
      query['reportDate'] = moment(new Date(me.state.productionDate)).format('YYYY/MM/DD');
      delete query['productionDate'];
      let params = Object.keys(query).map(function (key) {
        if (query[key]) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
        } else {
          return '';
        }
      }).join('&');
      this.machineReportInfo.reload = '3';
      me.props.updateMachineReportInfo(me.machineReportInfo);
      me.$f7router.navigate(APP_DIR_PATH + '/report-detail?' + params);
    } else if (machineUuid) {
      this.$f7router.back();
    } else if (!this.pressedNext) {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-sub-menu', { pushState: false });
    } else {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-sub-menu', { pushState: true });
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
     * 工程Picker作成
     */
  loadworkPhase() {
    let me = this;
    const cookies = new Cookies();
    var lang = cookies.get('LANG');
    Work.getWorkPhase({
      langId: lang
    })
      .then((response) => {
        me.workPhases = response.mstWorkPhases;
        me.createPickerworkPhase();
      })
      .catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
  }

  createPickerworkPhase(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var _seqs = {};
    var defaultValue = null;
    var defaultName = null;
    var defaultSeq = null;
    for (var i = 0; i < me.workPhases.length; i++) {
      let workPhase = me.workPhases[i];
      if (workPhase['workPhaseType'] === '1') {
        _values.push(workPhase.id);
        let codeName = workPhase.workPhaseCode + ' ' + workPhase.workPhaseName;
        _displayValues.push(codeName);
        _seqs[workPhase.id] = workPhase.choiceSeq;
        if (me.state.workPhaseId === workPhase.id) {
          defaultValue = workPhase.id;
          defaultName = codeName;
          defaultSeq = workPhase.choiceSeq;
        }
      }
    }
    if (me.pickerworkPhase) {
      me.pickerworkPhase.destroy();
    }
    me.pickerworkPhase = me.createPicker('#production-start-page-production', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ workPhaseId: value });
        me.setState({ workPhaseName: displayValue });
        me.setState({ workPhaseChoiceSeq: _seqs[value] });
        if (value !== '') {
          this.setState({ errorMessageWorkPhaseId: '' });
        }
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerworkPhase.setValue([defaultValue], 0);
      me.setState({ workPhaseId: defaultValue });
      me.setState({ workPhaseName: defaultName });
      me.setState({ workPhaseChoiceSeq: defaultSeq });
    }
  }
  /**
   * 所属Picker作成
   */
  createPickerDepartment(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.departments.length; i++) {
      let department = me.departments[i];
      _values.push(department.seq);
      _displayValues.push(department.choice);
      //ログインユーザーの所属に等しいものをデフォルトとする
      if (me.state.department === department.seq) {
        defaultValue = department.seq;
        defaultName = department.choice;
      }
    }
    me.setState({ department: '' });
    me.setState({ departmentName: '' });
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    me.pickerDepartment = me.createPicker('#production-start-prod-department', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ department: value });
        me.setState({ departmentName: displayValue });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerDepartment.setValue([defaultValue], '');
      me.setState({ department: defaultValue });
      me.setState({ departmentName: defaultName });
    }
  }
  /**
   * 金型ID用QRボタン
   */
  buttonMoldQRClick() {
    //QRページを遷移して金型ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', { props: { onQrRead: this.onMoldQrRead.bind(this) } });
  }

  onMoldQrRead(code) {
    if (code) {
      QRCodeParser.parseMoldIDWithoutDispose(code).then((response) => {
        if (!response.error && response.mstMoldAutoComplete[0]) {
          this.setState({
            moldUuid: response.mstMoldAutoComplete[0].uuid,
            moldId: response.mstMoldAutoComplete[0].moldId,
            moldName: response.mstMoldAutoComplete[0].moldName,
          });
          this.loadMoldIncludeComponent(response.mstMoldAutoComplete[0].moldId);
        } else {
          this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
        }
      }).catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
    }
  }

  /**
   * 金型検索ボタン
   */
  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', { props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
  }

  onMoldSelectedCell(item) {
    this.setState({
      moldUuid: item.moldUuid,
      moldId: item.moldId,
      moldName: item.moldName,
    });
    this.loadMoldIncludeComponent(item.moldId);
  }

  /**
   * 設備検索ボタン
   */
  buttonMachineSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch?department=' + this.state.department, { props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }

  onMachineSelectedCell(item) {
    this.setState({
      machineUuid: item.machineUuid,
      machineId: item.machineId,
      machineName: item.machineName,
    });
  }

  /**
   * 金型ID
   */
  createMoldAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#production-start-page-mold-id',
      openIn: 'dropdown',
      valueProperty: 'moldId', //object's "value" property name
      textProperty: 'moldId', //object's "text" property name
      source: function (query, render) {
        var results = [];
        var autocomplete = this;
        if (query.length === 0) {
          // render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Mold.getMoldLikeWithoutDispose({
          moldId: query
        })
          .then((response) => {
            let data = response.mstMoldAutoComplete;
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
          me.setState({
            moldUuid: value[0].uuid,
            moldId: value[0].moldId,
            moldName: value[0].moldName,
          });
          me.loadMoldIncludeComponent(value[0].moldId);
        },
        closed: function (autocomplete) {
          if (me.state.moldName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              moldId: '',
              moldName: '',
              instllationSiteName: ''
            });
          }
        }
      },
    });
  }

  loadMoldIncludeComponent(moldId) {
    let me = this;
    Mold.getMoldIncludeComponent({
      moldId: moldId
    })
      .then((response) => {
        let data = response.mstMoldComponentRelationVo;
        if (data.length > 1) {
          var timeInterval = setInterval(() => {  
            if(me.$f7router.allowPageChange){  
              clearInterval(timeInterval);      
              me.$f7router.navigate(APP_DIR_PATH + '/multiplecomponent', { props: { data: data, onComplete: me.onMultipleComponentComplete.bind(me) } });
            }
          }, 100);

        } else if (data.length === 1) {
          let tblProductionDetailVos = [];
          me.pressedNext = false;
          let item = {
            componentId: data[0].componentId,
            componentCode: data[0].componentCode,
            componentName: data[0].componentName,
            optionFlag: 4
          };
          if (data[0].countPerShot) {
            item.countPerShot = data[0].countPerShot;
          }
          tblProductionDetailVos.push(item);
          me.procedures = {};
          me.procedures[data[0].componentId] = data[0].procedureList;
          me.setState({
            tblProductionDetailVos
          }, () => {
            // setTimeout(() => {
            me.createPickerProcedure(true, 0);
            // }, 200);
            // setTimeout(() => {
            me.createComponentsAutocomplete(0);
            // }, 200);
          });
        }
      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  onMultipleComponentComplete(items) {
    this.components = [];

    let tblProductionDetailVos = [];//this.state.tblProductionDetailVos;
    if (items.length > 0) {
      for (let key in items) {
        let value = items[key];
        tblProductionDetailVos.push({
          componentId: value.componentId,
          componentCode: value.componentCode,
          componentName: value.componentName,
          countPerShot: value.countPerShot,
          optionFlag: 4
        });
        this.procedures[value.componentId] = value.procedureList;
        this.setState({
          tblProductionDetailVos
        }, () => {
          // setTimeout(() => {
          this.createComponentsAutocomplete(key);
          // }, 200);
          // setTimeout(() => {
          this.createPickerProcedure(true, key);
          // }, 200);
        });
      }
    }
  }

  onSingleMoldComplete(item) {
    this.setState({
      moldId: item.moldId,
      moldName: item.moldName,
      moldUuid: item.uuid,
    });
  }

  buttonDirectionCodeQRClick() {
    //QRページを遷移して設備ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', { props: { onQrRead: this.onDirectionCodeQrRead.bind(this) } });
  }

  onDirectionCodeQrRead(directionCode) {
    if (directionCode) {
      this.setState(
        {
          directionCode: directionCode
        }
      );
    }
  }

  /**
   * 設備ID用QRボタン
   */
  buttonMachineQRClick() {
    //QRページを遷移して設備ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', { props: { onQrRead: this.onMachineQrRead.bind(this) } });
  }

  onMachineQrRead(code) {
    if (code) {
      QRCodeParser.parseMachineIDWithoutDispose(code).then((response) => {
        if (!response.error && response.mstMachineAutoComplete[0]) {
          let item = {
            machineUuid: response.mstMachineAutoComplete[0].uuid,
            machineId: response.mstMachineAutoComplete[0].machineId,
            machineName: response.mstMachineAutoComplete[0].machineName,
          };
          this.setState(item);
          if (this.checkMachineNams.indexOf(item.machineId) < 0) {
            this.checkMachineNams.push(item.machineId);
            this.machineNames.push(item);
          }
          this.createPickerMachineName(true);
        } else {
          this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
        }
      }).catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
    }
  }
  /**
   * 設備ID
   */
  createMachineAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#production-start-page-machine-id',
      openIn: 'dropdown',
      valueProperty: 'machineId', //object's "value" property name
      textProperty: 'machineId', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          // render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Machine.getMachineLikeWithoutDispose({
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
          if (me.checkMachineNams.indexOf(item.machineId) < 0) {
            me.checkMachineNams.push(item.machineId);
            me.machineNames.push(item);
          }
          me.createPickerMachineName(true);
        },
        closed: function (autocomplete) {
          if (me.state.machineName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              machineId: '',
              machineName: '',
              instllationSiteName: ''
            });
          }
        }
      },
    });
  }
  /**
   * 設備名称
   */
  loadMachineNams() {
    let me = this;
    Machine.getMachine({
      orderByMachineName: 'machineName',
      department: me.state.department
    })
      .then((response) => {
        me.machineNames = response.mstMachineVos;
        me.createPickerMachineName(true);
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

  createPickerMachineName(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var _uuids = {};
    var defaultValue = null;
    var defaultName = null;
    var defaultUuid = null;
    for (var i = 0; i < me.machineNames.length; i++) {
      let machine = me.machineNames[i];
      _values.push(machine.machineId);
      _displayValues.push(machine.machineName);
      _uuids[machine.machineId] = machine.machineUuid;
      if (me.checkMachineNams.indexOf(machine.machineId) < 0) {
        me.checkMachineNams.push(machine.machineId);
      }
      if (me.state.machineId === machine.machineId) {
        defaultValue = machine.machineId;
        defaultName = machine.machineName;
        defaultUuid = machine.machineUuid;
      }
    }
    if (me.pickerMachineName) {
      me.pickerMachineName.destroy();
    }
    me.pickerMachineName = me.createPicker('#production-start-page-machine-name', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ machineId: value });
        me.setState({ machineName: displayValue });
        me.setState({ machineUuid: _uuids[value] });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMachineName.setValue([defaultValue], 0);
      me.setState({ machineId: defaultValue });
      me.setState({ machineName: defaultName });
      me.setState({ machineUuid: defaultUuid });
    }
  }

  /**
   * 部品コード用QRボタン
   */
  buttonComponentQRClick(index) {
    this.setState({
      componentsSearchClickId: index,
    });
    //QRページを遷移して部品コード読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', { props: { onQrRead: this.onComponentQrRead.bind(this) } });
  }

  onComponentQrRead(code) {
    if (code) {
      QRCodeParser.parseComponentCode(code).then((response) => {
        if (!response.error && response.mstComponents[0]) {
          let tblProductionDetailVos = this.state.tblProductionDetailVos;
          let index = this.state.componentsSearchClickId;
          if (tblProductionDetailVos[index]) {
            tblProductionDetailVos[index] = {
              componentId: response.mstComponents[0].id,
              componentCode: response.mstComponents[0].componentCode,
              componentName: response.mstComponents[0].componentName,
              countPerShot: ''
            };
            this.setState({
              tblProductionDetailVos
            });

            this.loadMoldForComponent(response.mstComponents[0], index);
            this.loadProcedure(response.mstComponents[0], index);
          }
        } else {
          this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
        }
      }).catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
    }
  }

  /**
   * 部品検索ボタン
   */
  buttonComponentSearch(index) {
    this.setState({
      componentsSearchClickId: index,
    });
    this.$f7router.navigate(APP_DIR_PATH + '/componentSearch', { props: { onSelectedCell: this.onComponentSelectedCell.bind(this) } });
  }

  onComponentSelectedCell(item) {
    let index = this.state.componentsSearchClickId;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (tblProductionDetailVos[index]) {
      tblProductionDetailVos[index] = {
        componentId: item.id,
        componentCode: item.componentCode,
        componentName: item.componentName,
        countPerShot: ''
      };
      this.loadMoldForComponent(item, index);
      this.loadProcedure(item, index);
      this.setState({
        tblProductionDetailVos,
      });
    }
  }

  createDirCodeAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#production-start-page-direction-code',
      openIn: 'dropdown',
      valueProperty: 'directionCode', //object's "value" property name
      textProperty: 'directionCode', //object's "text" property name
      source: function (query, render) {
        var results = [];
        var autocomplete = this;
        if (query.length === 0) {
          // render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Direction.like({
          directionCode: query
        })
          .then((response) => {
            let data = response.tblDirections;
            data.sort((a,b) => a.directionCode.localeCompare(b.directionCode));
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
          me.setState({
            directionCode: value[0].directionCode,
          });
        },
      },
    });
  }

  //ロット番号
  loadProductionLot(componentId, prevProcedureId, index) {
    let productionDate = this.state.productionDate;
    let me = this;
    Procedure.getProductionLotList({
      componentId: componentId,
      prevProcedureId: prevProcedureId,
      productionDate: productionDate
    }).then((response) => {
      let info = response.productions;
      me.productionLots[index] = info;
      me.createPickerLotNumber(true, index);
    }).catch((err) => {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }
  loadMoldForComponent(item) {
    let componentId = item.id;
    let me = this;
    Mold.getMoldForComponentWithoutDispose(componentId)
      .then((response) => {
        let mstMoldComponentRelation = response.mstMoldComponentRelation;
        if (mstMoldComponentRelation.length === 1) {
          let data = mstMoldComponentRelation[0];
          if ((me.state.moldUuid !== undefined && me.state.moldUuid.length < 1)) {
            me.setState({
              moldUuid: data.mstMold.uuid,
              moldId: data.mstMold.moldId,
              moldName: data.mstMold.moldName,
            });
          }
          let index = me.state.componentsSearchClickId;
          let tblProductionDetailVos = me.state.tblProductionDetailVos;
          if (componentId[index]) {
            tblProductionDetailVos[index].countPerShot = data.countPerShot;
            me.setState({
              tblProductionDetailVos,
            });
            me.loadProcedure(data.mstComponent, index);
            setTimeout(() => {
              me.createComponentsAutocomplete(index);
            }, 200);
          }
        } else if (mstMoldComponentRelation.length > 1 && (me.state.moldUuid !== undefined && me.state.moldUuid.length < 1)) {
          let molds = [];
          for (let key in mstMoldComponentRelation) {
            let value = mstMoldComponentRelation[key];
            molds.push(value.mstMold);
          }
          var timeInterval = setInterval(() => {  
            if(me.$f7router.allowPageChange){  
              clearInterval(timeInterval);      
              me.$f7router.navigate(APP_DIR_PATH + '/singlemold', { props: { data: molds, onComplete: me.onSingleMoldComplete.bind(me) } });
            }
          }, 100);
        }
      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  loadProcedure(item, index) {
    if (item.id === undefined) return;
    let me = this;
    Procedure.getProcedureForComponent(item.id)
      .then((response) => {
        let info = response.mstProcedures;
        me.procedures[item.id] = info;
        // setTimeout(() => {
        me.createPickerProcedure(true, index);
        // }, 200);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * 部品コード
   */
  createComponentsAutocomplete(index) {
    var me = this;
    const app = me.$f7;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (index === null) return;
    return app.autocomplete.create({
      inputEl: '#production-start-page-component-code_' + index,
      openIn: 'dropdown',
      valueProperty: 'componentCode', //object's "value" property name
      textProperty: 'componentCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          return;
        } else {
          // Show Preloader
          autocomplete.preloaderShow();
          Component.getComponentLike({
            componentCode: query
          })
            .then((response) => {
              let data = response.mstComponents;

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
        }
      },
      on: {
        change: function (value) {
          if (tblProductionDetailVos.length >= index+1) {
            tblProductionDetailVos[index].componentId = value[0].id;
            tblProductionDetailVos[index].componentCode = value[0].componentCode;
            tblProductionDetailVos[index].componentName = value[0].componentName;
            tblProductionDetailVos[index].countPerShot = '';
            me.loadMoldForComponent(value[0], index);
            me.loadProcedure(value[0], index);
            me.setState({
              tblProductionDetailVos,
              componentsSearchClickId: index
            });
          }
        },
      },
    });
  }
  /**
   * 部品工程番号
   * @param {*} setDefault 
   * @param {*} index 
   */
  createPickerProcedure(setDefault, index) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    let component = tblProductionDetailVos[index];
    if (!component) {
      return;
    }
    let componentId = component.componentId;
    if (!me.procedures[componentId] || me.procedures[componentId].length < 1) {
      return;
    }
    for (var i = 0; i < me.procedures[componentId].length; i++) {
      let procedure = me.procedures[componentId][i];
      _values.push(procedure.id);
      let codeName = procedure.procedureCode + ' ' + procedure.procedureName;
      _displayValues.push(codeName);
      if (component.procedureId === '' || component.procedureId === undefined) {
        if (i === 0) {
          defaultValue = procedure.id;
          defaultName = codeName;
        }
      } else {
        if (component.procedureId === procedure.id) {
          defaultValue = procedure.id;
          defaultName = codeName;
        }
      }
    }
    if (me.pickerProcedures[index] !== undefined) {
      me.pickerProcedures[index].destroy();
      me.pickerProcedures.splice(index, 1);
    }

    let pickerProcedure = this.createPicker('#production-start-page-procedure-code_' + index, _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        tblProductionDetailVos[index].procedureId = value;
        tblProductionDetailVos[index].procedureCodeName = displayValue;
        let codeName = displayValue;
        codeName = codeName.split(' ');
        tblProductionDetailVos[index].procedureCode = codeName[0];
        tblProductionDetailVos[index].procedureName = codeName[1];
        tblProductionDetailVos[index].optionFlag = 4;
        if (value !== '') {
          tblProductionDetailVos[index]['errorMessageProcedureId'] = '';
        }

        let prevProcedureId = _values[parseInt(_values.indexOf(value)) - 1];
        if (prevProcedureId !== '' && prevProcedureId !== undefined) {
          me.loadProductionLot(componentId, prevProcedureId, index);
        } else {
          if (me.pickerProductionLots[index] !== undefined) {
            me.pickerProductionLots[index].destroy();
            me.pickerProductionLots.splice(index, 1);
          }
        }

        me.setState({
          tblProductionDetailVos,
          componentsSearchClickId: index
        });
      }
    );
    me.pickerProcedures[index] = pickerProcedure;
    if (setDefault && defaultValue !== null) {
      pickerProcedure.setValue([defaultValue], 0);
      tblProductionDetailVos[index].procedureId = defaultValue;
      tblProductionDetailVos[index].procedureCodeName = defaultName;
      let codeName = defaultName;
      codeName = codeName.split(' ');
      tblProductionDetailVos[index].procedureCode = codeName[0];
      tblProductionDetailVos[index].procedureName = codeName[1];
      me.setState({
        components: tblProductionDetailVos,
        componentsSearchClickId: index
      });
    }
  }


  /**
   * ロット番号
   * @param {*} setDefault 
   * @param {*} index 
   */
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
    let pickerProductionLot = this.createPicker('#production-start-page-lot-number_' + index, _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        document.getElementById('production-start-page-lot-number_' + index).readOnly = false;
        picker.inputEl.readonly = false;
        tblProductionDetailVos[index].lotNumber = displayValue;
        tblProductionDetailVos[index].optionFlag = 4;
        me.setState({
          tblProductionDetailVos,
          componentsSearchClickId: index
        });
      }
    );
    document.getElementById('production-start-page-lot-number_' + index).readOnly = false;
    me.pickerProductionLots[index] = pickerProductionLot;
    if (setDefault && defaultValue !== null) {
      pickerProductionLot.setValue([defaultValue], 0);
      tblProductionDetailVos[index].lotNumber = defaultName;
      me.setState({
        components: tblProductionDetailVos,
        componentsSearchClickId: index
      });
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.name === 'machineId') {
      this.setState({ 'machineUuid': '' });
      this.setState({ 'machineName': '' });
      this.createPickerMachineName(false);
    }
    if (event.target.value !== '') {
      let name = event.target.name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.setState({ ['errorMessage' + name]: '' });
    }
  }

  handleComponentChange(index, event) {
    let me = this;
    let tblProductionDetailVos = me.state.tblProductionDetailVos;
    // if (me.pressedNext && me.production.tblProductionDetailVos !== undefined) {
    //   tblProductionDetailVos = Object.assign(tblProductionDetailVos, me.production.tblProductionDetailVos);
    //   me.pressedNext = false;
    //   me.backUpdate = true;
    //   me.production.tblProductionDetailVos = tblProductionDetailVos;
    // }
    if (tblProductionDetailVos[index]) {
      let field = event.target.name.replace('_' + index, '');
      tblProductionDetailVos[index][field] = event.target.value;
      if (field === 'componentCode') {
        tblProductionDetailVos[index]['optionFlag'] = 4;
        tblProductionDetailVos[index]['componentId'] = '';
        tblProductionDetailVos[index]['componentName'] = '';
        tblProductionDetailVos[index]['countPerShot'] = '';
        tblProductionDetailVos[index]['lotNumber'] = '';
        tblProductionDetailVos[index]['procedureId'] = '';
        tblProductionDetailVos[index]['procedureCodeName'] = '';
        tblProductionDetailVos[index]['procedureCode'] = '';
        tblProductionDetailVos[index]['procedureName'] = '';
      }
      if (event.target.value !== '') {
        let msgName = field.charAt(0).toUpperCase() + field.slice(1);
        tblProductionDetailVos[index]['errorMessage' + msgName] = '';
      }
      this.setState({
        tblProductionDetailVos
      });
    }
  }

  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称(companyId等)が入っている
    this.setState({ [event.target.name]: '' });
    if (event.target.name === 'moldId') {
      this.setState({
        moldName: '',
        moldUuid: '',
      });
    }
    if (event.target.name === 'machineId') {
      this.setState({
        machineName: '',
        machineUuid: ''
      });
    }
    if (event.target.name === 'machineName') {
      this.setState({
        machineId: '',
        machineUuid: ''
      });
    }
    if (event.target.name === 'workPhaseId') {
      this.setState({
        workPhaseName: '',
        workPhaseChoiceSeq: '',
      });
      this.createPickerworkPhase(false);
    }
    if (event.target.name === 'department') {
      this.setState({
        department: '',
        departmentName: '',
      });
      this.createPickerDepartment(false);
    }
  }

  handleComponentClear(index, event) {
    let me = this;
    let tblProductionDetailVos = me.state.tblProductionDetailVos;
    if (event.target.name.indexOf('componentCode') >= 0) {
      if (tblProductionDetailVos.length > 1) {
        tblProductionDetailVos.splice(index, 1);
        me.setState({
          tblProductionDetailVos
        });
        if (me.pickerProcedures[index] !== undefined) {
          me.pickerProcedures[index].destroy();
          me.pickerProcedures.splice(index, 1);
        }
      } else {
        tblProductionDetailVos[index] = {
          optionFlag: 4,
          componentId: '',
          componentCode: '',
          componentName: '',
          countPerShot: '',
          lotNumber: '',
          procedureId: '',
          procedureCodeName: '',
          procedureCode: '',
          procedureName: '',
        };
        me.setState({
          tblProductionDetailVos
        });
      }
      if (me.pickerProcedures[index] !== undefined) {
        me.pickerProcedures[index].destroy();
        me.pickerProcedures.splice(index, 1);
      }
      me.createPickerProcedure(false, index);
      
      if (me.pickerProductionLots[index] !== undefined) {
        me.pickerProductionLots[index].destroy();
        me.pickerProductionLots.splice(index, 1);
      }
    }
    if ((event.target.name).indexOf('procedureId') >= 0) {
      tblProductionDetailVos[index].procedureId = '';
      tblProductionDetailVos[index].optionFlag = 4;
      tblProductionDetailVos[index].procedureCodeName = '';
      tblProductionDetailVos[index].procedureCode = '';
      tblProductionDetailVos[index].procedureName = '';
      tblProductionDetailVos[index].lotNumber = '';
      me.setState({
        tblProductionDetailVos
      });
      if (me.pickerProcedures[index] !== undefined) {
        me.pickerProcedures[index].destroy();
        me.pickerProcedures.splice(index, 1);
      }
      me.createPickerProcedure(false, index);
      if (me.pickerProductionLots[index] !== undefined) {
        me.pickerProductionLots[index].destroy();
        me.pickerProductionLots.splice(index, 1);
      }
    }
    if ((event.target.name).indexOf('countPerShot') >= 0) {
      tblProductionDetailVos[index].countPerShot = '';
      me.setState({
        tblProductionDetailVos
      });
    }
    if ((event.target.name).indexOf('lotNumber') >= 0) {
      tblProductionDetailVos[index].lotNumber = '';
      me.setState({
        tblProductionDetailVos
      });
      me.createPickerLotNumber(false, index);
    }
  }

  /**
   * 部品追加ボタン
   */
  buttonAddComponent() {
    let tblProductionDetailVos = this.state.tblProductionDetailVos;
    if (this.pressedNext && this.production.tblProductionDetailVos !== undefined) {
      tblProductionDetailVos = Object.assign(tblProductionDetailVos, this.production.tblProductionDetailVos);
      this.pressedNext = false;
      this.backUpdate = true;
    }
    tblProductionDetailVos.push({
      componentId: '',
      componentCode: '',
      componentName: '',
      countPerShot: '',
      lotNumber: '',
      procedureId: '',
      procedureCodeName: '',
      procedureCode: '',
      procedureName: '',
      optionFlag: 4
    });

    this.setState({
      tblProductionDetailVos
    }, () => {
      let index = tblProductionDetailVos.length - 1;
      // setTimeout(() => {
      this.createComponentsAutocomplete(index);
      // }, 200);
      // setTimeout(() => {
      this.createPickerProcedure(true, index);
      Dom7('.countPerShot').find('input').on('keydown', this.handleKeyPress);
      // }, 200);
    });
  }

  /**
   * 次へボタン
   */
  nextSubmit() {
    let query = this.$f7route.query;
    query['reportDate'] = this.state.productionDate;
    if (this.state.directionCode !== '') {
      Direction.equal({
        directionCode: this.state.directionCode
      })
        .then((response) => {
          if (response.tblDirections.length > 0) {
            let tblProductionDetailVos = this.state.tblProductionDetailVos;
            this.props.addCondition({
              productionDate: moment(new Date(this.state.productionDate)).format('YYYY-MM-DDTHH:mm:ss'),
              workPhaseId: this.state.workPhaseId,
              workPhaseName: this.state.workPhaseName,
              workPhaseChoiceSeq: this.state.workPhaseChoiceSeq,
              moldId: this.state.moldId,
              moldUuid: this.state.moldUuid,
              moldName: this.state.moldName,
              machineId: this.state.machineId,
              machineUuid: this.state.machineUuid,
              machineName: this.state.machineName,
              directionCode: this.state.directionCode,
              disposedShotCount: this.state.disposedShotCount,
              tblProductionDetailVos,
              prodDepartment: this.state.department,
              departmentName: this.state.departmentName,
              option: false,
              dict: this.state.dict,
              query: query
            });
            this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-start-material', { pushState: true });
          } else {
            this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found + '(' + this.state.dict.direction_code + ')');
          }
        })
        .catch((err) => {
          this.$f7.preloader.hide();
          var error = err;
          if (error['errorCode'] === 'E201') {
            this.$f7.dialog.alert(error.errorMessage);
          } else {
            this.setState(() => { throw new UnexpectedError(error); });
          }
        });
    } else {
      let tblProductionDetailVos = this.state.tblProductionDetailVos;
      this.props.addCondition({
        productionDate: moment(new Date(this.state.productionDate)).format('YYYY-MM-DDTHH:mm:ss'),
        workPhaseId: this.state.workPhaseId,
        workPhaseName: this.state.workPhaseName,
        workPhaseChoiceSeq: this.state.workPhaseChoiceSeq,
        moldId: this.state.moldId,
        moldUuid: this.state.moldUuid,
        moldName: this.state.moldName,
        machineId: this.state.machineId,
        machineUuid: this.state.machineUuid,
        machineName: this.state.machineName,
        directionCode: this.state.directionCode,
        disposedShotCount: this.state.disposedShotCount,
        tblProductionDetailVos,
        prodDepartment: this.state.department,
        departmentName: this.state.departmentName,
        option: false,
        dict: this.state.dict,
        query: query
      });
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-start-material', { pushState: true });
    }
  }
  buttonNext() {
    let me = this;
    var reg = /(\w*)%s(.*)%s(.*)/g;
    if (this.state.productionDate === '') {
      this.setState({ errorMessageProductionDate: this.state.dict.msg_error_not_null });
      return;
    } else {
      this.setState({ errorMessageProductionDate: '' });
    }
    if (this.state.workPhaseId === '') {
      this.setState({ errorMessageWorkPhaseId: this.state.dict.msg_error_not_null });
      return;
    } else {
      this.setState({ errorMessageWorkPhaseId: '' });
    }
    if (this.state.status === '1') {
      if (this.state.machineId === '') {
        this.setState({ errorMessageMachineId: this.state.dict.msg_error_not_null });
        return;
      } else {
        this.setState({ errorMessageMachineId: '' });
      }
    }
    if (this.state.dirCodeStatus === '1') {
      if (this.state.directionCode === '') {
        this.setState({ errorMessageDirCode: this.state.dict.msg_error_not_null });
        return;
      } else {
        this.setState({ errorMessageDirCode: '' });
      }
    }
    if (this.state.disposedShotCount !== '' && !/^[0-9]+$/.test(this.state.disposedShotCount)) {
      this.setState({ errorMessageDisposedShotCount: this.state.dict.msg_error_num_over_zero });
      return;
    } else {
      this.setState({ errorMessageDisposedShotCount: '' });
    }
    if (this.state.disposedShotCount > 999999999) {
      this.setState({ errorMessageDisposedShotCount: this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.disposed_shot_count + '$29$3') });
      return;
    } else {
      this.setState({ errorMessageDisposedShotCount: '' });
    }
    let components = this.state.tblProductionDetailVos;
    let componentErr = false;
    let compList = [];
    if (components.length > 1){
      for (let key in components) {
        let compCodeValue = components[key].componentCode;
        if (compCodeValue !== '') {
          compList.push(components[key]);
        }
      }
      components = compList;
    }
    for (let key in components) {
      let compCodeEmpty = false;
      let procIdEmpty = false;
      let shotCountEmpty = false;
      let value = components[key];
      if (value.componentCode === '') {
        if (components.length > 1 && components.length === parseInt(key)+1){
          compCodeEmpty = true;
        } else {
          components[key]['errorMessageComponentCode'] = this.state.dict.msg_error_not_null;
          componentErr = true;
          break;
        }
      } else {
        components[key]['errorMessageComponentCode'] = '';
      }
      if (value.procedureId === undefined || value.procedureId === '') {
        if ((components.length > 1 && components.length === parseInt(key)+1)){
          procIdEmpty = true;
        } else {
          components[key]['errorMessageProcedureId'] = this.state.dict.msg_error_not_null;
          componentErr = true;
          break;
        }
      } else {
        components[key]['errorMessageProcedureId'] = '';
      }
      if (!value.countPerShot || value.countPerShot === '') {
        if ((components.length > 1 && components.length === parseInt(key)+1)){
          shotCountEmpty = true;
        } else {
          components[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_not_null;
          componentErr = true;
          break;
        }
      } else {
        components[key]['errorMessageCountPerShot'] = '';
      }
      if ((components.length > 1 && components.length === parseInt(key)+1)){
        let skipCompError = false;
        if (shotCountEmpty === true) {
          if (procIdEmpty === true) {
            if (compCodeEmpty === true) {
              if(shotCountEmpty && procIdEmpty && compCodeEmpty) {
                skipCompError = true;
              }
              if(!skipCompError){
                components[key]['errorMessageComponentCode'] = this.state.dict.msg_error_not_null;
                componentErr = true;
                break;
              }
            }
            if(!skipCompError){
              components[key]['errorMessageProcedureId'] = this.state.dict.msg_error_not_null;
              componentErr = true;
              break;
            }
          }
          if(!skipCompError){
            components[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_not_null;
            componentErr = true;
            break;
          }
        } else {
          if(compCodeEmpty){
            value.countPerShot = '';
            shotCountEmpty = true;
            components.pop(key.valueOf());
          } else if (procIdEmpty) {
            components[key]['errorMessageProcedureId'] = this.state.dict.msg_error_not_null;
            componentErr = true;
            break;
          }
        } 
      }
      if (shotCountEmpty === false){
        if (value.countPerShot !== '' && !/^[0-9]+$/.test(value.countPerShot)) {
          components[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_num_over_zero;
          return;
        } else {
          components[key]['errorMessageCountPerShot'] = '';
        }
        if (value.countPerShot > 999999999) {
          components[key]['errorMessageCountPerShot'] = this.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.count_per_shot + '$29$3');
          return;
        } else {
          components[key]['errorMessageCountPerShot'] = '';
        }
      }
    }
    this.setState({
      tblProductionDetailVos: components
    });
    if (componentErr) {
      return;
    }
    me.nextSubmit();
  }

  render() {
    let productionDate = this.state.productionDate ? moment(new Date(this.state.productionDate)).format('YYYY/MM/DD') : '';
    return (
      <DocumentTitle title={this.state.dict.production_start}>
        <Page onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} onPageBeforeOut={this.onPageBeforeOut.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.production_start}</BlockTitle>
          <List form={true} id="form" noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.production_date}</Label> {/* 初期値システム日付 */}
              <Input type="text" name="productionDate" value={productionDate} readonly inputId="production-start-page-production-date" errorMessage={this.state.errorMessageProductionDate} errorMessageForce={this.state.errorMessageProductionDate !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.prod_department}</Label> {/* ログインユーザーの所属を初期セット */}
              <Input type="text" name="department" value={this.state.departmentName} clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="production-start-prod-department" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.process_mass_flag + this.state.required}</Label> {/* 初期値システム日付 */}
              <Input type="text" name="workPhaseId" value={this.state.workPhaseName} readonly clearButton onInputClear={this.handleClear.bind(this)} inputId="production-start-page-production" errorMessage={this.state.errorMessageWorkPhaseId} errorMessageForce={this.state.errorMessageWorkPhaseId !== ''} />
            </ListItem>
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.mold_id}</Label>
              <Input type="text"
                name="moldId"
                value={this.state.moldId} clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="production-start-page-mold-id"
                onChange={this.handleChange.bind(this)}
                maxlength={30}
                autocomplete="off"
                errorMessage={this.state.errorMessageMoldId}
                errorMessageForce={this.state.errorMessageMoldId !== ''} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonMoldQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.mold_name}</Label>
            </ListItem>
            <ListItem className="custom-list-item">
              <Input>{this.state.moldName}</Input>
              <div className="btn-absolute">
                <Button fill iconF7="search" small onClick={this.buttonMoldSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.machine_id + this.state.requiredMachine}</Label>
              <Input type="text" name="machineId" value={this.state.machineId} clearButton onInputClear={this.handleClear.bind(this)} inputId="production-start-page-machine-id" onChange={this.handleChange.bind(this)} maxlength={45} errorMessage={this.state.errorMessageMachineId} errorMessageForce={this.state.errorMessageMachineId !== ''} autocomplete="off" />
              <div className="btn-absolute">
                <Button fill text="QR" small onClick={this.buttonMachineQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.machine_name}</Label>
            </ListItem>
            <ListItem className="custom-list-item">
              <Input>{this.state.machineName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonMachineSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.disposed_shot_count}</Label>
              <Input type="number" name="disposedShotCount" value={this.state.disposedShotCount} inputId="production-start-page-disposed-shot-count" onChange={this.handleChange.bind(this)} clearButton onInputClear={this.handleClear.bind(this)} errorMessage={this.state.errorMessageDisposedShotCount} errorMessageForce={this.state.errorMessageDisposedShotCount !== ''} />
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.direction_code}</Label>
              <Input type="text" name="directionCode" value={this.state.directionCode} inputId="production-start-page-direction-code" onChange={this.handleChange.bind(this)} clearButton onInputClear={this.handleClear.bind(this)} errorMessage={this.state.errorMessageDirCode} errorMessageForce={this.state.errorMessageDirCode !== ''} autocomplete="off" />
              <div className="btn-absolute">
                <Button fill text="QR" small onClick={this.buttonDirectionCodeQRClick.bind(this)}></Button>
              </div>
            </ListItem>
          </List>

          {/** 部品の数だけリストビュー作成(別メソッドで行う) */}
          {this.state.tblProductionDetailVos ? this.state.tblProductionDetailVos.map((item, index) => {
            return <List key={index} className="no-margin-bottom" id="production-start-page-component_1">
              <ListItem className="custom-list-item">
                <Label >{this.state.dict.component_code + this.state.required}</Label>
                <Input type="text" name={'componentCode_' + index} clearButton onInputClear={this.handleComponentClear.bind(this, index)} value={item.componentCode} onChange={this.handleComponentChange.bind(this, index)} inputId={'production-start-page-component-code_' + index} maxlength={45} errorMessage={item['errorMessageComponentCode'] ? item['errorMessageComponentCode'] : ''} errorMessageForce={item['errorMessageComponentCode'] && item['errorMessageComponentCode'] !== '' ? true : false} autocomplete="off" />
                <div className="btn-absolute">
                  <Button small fill text="QR" onClick={this.buttonComponentQRClick.bind(this, index)}></Button>
                </div>
              </ListItem>
              <ListItem className="custom-list-item">
                <Label>{this.state.dict.component_name}</Label>
                <Input>{item.componentName}</Input>
                <div className="btn-absolute">
                  <Button small fill iconF7="search" onClick={this.buttonComponentSearch.bind(this, index)}></Button>
                </div>
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.procedure_code + this.state.required}</Label> {/* 部品工程番号＋名称 */}
                <Input type="text" name={'procedureId_' + index} inputId={'production-start-page-procedure-code_' + index} value={item.procedureCodeName ? item.procedureCodeName : ''} clearButton onInputClear={this.handleComponentClear.bind(this, index)} onChange={this.handleComponentChange.bind(this, index)} errorMessage={item['errorMessageProcedureId'] ? item['errorMessageProcedureId'] : ''} errorMessageForce={item['errorMessageProcedureId'] && item['errorMessageProcedureId'] !== '' ? true : false} />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.count_per_shot + this.state.required}</Label>
                <Input type="number" name={'countPerShot_' + index}
                  inputId={'production-start-page-count-per-shot_' + index} value={item.countPerShot} onChange={this.handleComponentChange.bind(this, index)} clearButton onInputClear={this.handleComponentClear.bind(this, index)} errorMessage={item['errorMessageCountPerShot'] ? item['errorMessageCountPerShot'] : ''} errorMessageForce={item['errorMessageCountPerShot'] && item['errorMessageCountPerShot'] !== '' ? true : false} className="countPerShot" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.lot_number}</Label>
                <Input type="text" name={'lotNumber_' + index} inputId={'production-start-page-lot-number_' + index} value={item.lotNumber ? item.lotNumber : ''} clearButton onInputClear={this.handleComponentClear.bind(this, index)} onChange={this.handleComponentChange.bind(this, index)} errorMessage={item['errorMessageLotNumber'] ? item['errorMessageLotNumber'] : ''} errorMessageForce={item['errorMessageLotNumber'] && item['errorMessageLotNumber'] !== '' ? true : false} />
              </ListItem>
            </List>;
          }) : null}
          <Block>
            <Row>
              <Col width="50">
                <Button fill onClick={this.buttonAddComponent.bind(this)}>{this.state.dict.add_component}</Button>
              </Col>
              <Col width="50">
                <Button fill onClick={this.buttonNext.bind(this)}>{this.state.dict.next}</Button>
              </Col>

            </Row>
          </Block>
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
)(ProductionStartPage);