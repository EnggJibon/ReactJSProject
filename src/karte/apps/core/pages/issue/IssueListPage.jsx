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
  Card,
  CardContent,
  AccordionContent,
  SwipeoutActions,
  SwipeoutButton,
  ListItemRow,
  ListItemCell,
  Link,
} from 'framework7-react';
import { Dom7 } from 'framework7';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import moment from 'moment';
import Authentication from 'karte/shared/logics/authentication';
import Choice from 'karte/shared/master/choice';
import Issue from 'karte/apps/core/logics/issue';
import MoldMaster from 'karte/shared/master/mold';
import Machine from 'karte/shared/master/machine';
import Component from 'karte/shared/master/component';
//import { listenerCount } from 'cluster';

export default class IssueListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        issue_list: '',
        registration_date: '',
        issue_measure_status: '',
        mold_id: '',
        mold_name: '',
        machine_id: '',
        machine_name: '',
        component_name: '',
        issue_reported_department: '',
        component_code: '',
        search: '',
        close: '',
        issue_measure_due_date: '',
        issue_work_phase: '',
        issue_category1: '',
        select_record: '',
        cancel: '',
        machine: '',
        component: '',
        mold: '',
        not_measure_status: '',
        mst_error_record_not_found: '',
        issue_report_person_name: '',
        copy: '',
        delete_record: '',
        msg_confirm_delete: '',
        yes: '',
        no: ''
        //必要な文言をここに足す
      },
      machineUuid: '',
      machineId: '',
      machineName: '',
      moldUuid: '',
      moldId: '',
      moldName: '',
      componentId: '',
      componentCode: '',
      componentName: '',
      menus: [],
      issues: [],
      pageNumber: 1,
      pageTotal: 1,
      pageSize: 50,
      reportDepartment: 0,
      reportDepartmentName: '',
      measureStatus: '',
      measureStatusText: '',
      allowInfinite: false,
      showPreloader: true,
      emptyMsg: ''
    };

    this.departments = [];
    this.measureStatuss = [];
    this.measureStatusObject = {};
    this.components = [];
    this.machineNames = [];
    this.checkMachineNams = [];
    this.flag = 0;
  }

  componentDidMount() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.loadMeasureStatus();
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
    var me = this;
    //ログインユーザーの所属、所属選択肢読み込み、所属Picker作成。
    Promise.all([Authentication.whoAmI(), Choice.categories('mst_user.department', {})])
      .then((values) => {
        let responseWho = values[0];
        let responseChoice = values[1];
        me.state.reportDepartment = responseWho.department;
        me.departments = [...responseChoice.mstChoiceVo];
        me.createPickerDepartment(true);
        //me.loadMachineNams();
        me.createMachineAutocomplete();
        me.createMoldAutocomplete();
        me.createComponentsAutocomplete();
      })
      .catch((err) => {
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
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-sub-menu', { pushState: true });
  }


  /**
   * 発生場所Picker作成
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
      if (me.state.reportDepartment === department.seq) {
        defaultValue = department.seq;
        defaultName = department.choice;
      }
    }
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    me.pickerDepartment = me.createPicker('#issue-list-page-report-department', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ reportDepartment: value });
        me.setState({ reportDepartmentName: displayValue });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerDepartment.setValue([defaultValue], 0);
      me.setState({ reportDepartment: defaultValue });
      me.setState({ reportDepartmentName: defaultName });
      // me.loadReportPhase();
    }
  }
  /**
   * 対策ステータス読み込み
   */
  loadMeasureStatus() {
    var me = this;
    Choice.categories('tbl_issue.measure_status', {})
      .then((response) => {
        me.measureStatuss = [...response.mstChoiceVo];
        me.createPickerMeasureStatus(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }
  /**
   * 対策ステータスPicker作成
   */
  createPickerMeasureStatus(setDefault) {
    var me = this;
    var _values = ['-1', '-99'];
    var _displayValues = ['', this.state.dict.not_measure_status];
    var defaultValue = '-99';
    var defaultName = this.state.dict.not_measure_status;
    for (var i = 0; i < me.measureStatuss.length; i++) {
      let measureStatus = me.measureStatuss[i];
      _values.push(measureStatus.seq);
      _displayValues.push(measureStatus.choice);
      me.measureStatusObject[measureStatus.seq] = measureStatus.choice;
    }
    me.setState({ measureStatus: '-99' });
    me.setState({ measureStatusText: '' });
    if (me.pickerMeasureStatus) {
      me.pickerMeasureStatus.destroy();
    }
    me.pickerMeasureStatus = me.createPicker('#issue-list-page-measure-status', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ measureStatus: value });
        me.setState({ measureStatusText: displayValue });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMeasureStatus.setValue([defaultValue], 0);
      me.setState({ measureStatus: defaultValue });
      me.setState({ measureStatusText: defaultName });
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
      ],
    });
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }
  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称(companyId等)が入っている
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'moldId') {
      this.setState({
        moldName: '',
        moldUuid: ''
      });
      Dom7('#issue-list-page-machine-id').blur();
    }
    if (event.target.name === 'machineId') {
      this.setState({
        machineName: '',
        machineUuid: ''
      });
      Dom7('#issue-list-page-mold-id').blur();
    }
    if (event.target.name === 'componentCode') {
      this.setState({
        componentId: '',
        componentName: '',
      });
      this.components = [];
      Dom7('#issue-list-page-component-code').blur();
    }
    if (event.target.name === 'reportDepartment') {
      this.setState({
        reportDepartment: 0,
        reportDepartmentName: '',
      });
    }
    if (event.target.name === 'measureStatus') {
      this.setState({
        measureStatus: -1,
        measureStatusName: '',
      });
    }
  }
  /**
   * 金型ID用QRボタン
   */
  buttonMoldQRClick() {
    //QRページを遷移して金型ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMoldQrRead.bind(this) } });
  }

  onMoldQrRead(code) {
    if (code) {
      QRCodeParser.parseMoldID(code).then((response) => {
        if (!response.error && response.mstMoldAutoComplete[0]) {
          this.setState({
            moldUuid: response.mstMoldAutoComplete[0].moldUuid,
            moldId: response.mstMoldAutoComplete[0].moldId,
            moldName: response.mstMoldAutoComplete[0].moldName,
          });

          //this.loadComponent(response.mstMoldAutoComplete[0].moldId);
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
   * 部品コード用QRボタン
   */
  buttonComponentQRClick() {
    //QRページを遷移して部品コード読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onComponentQrRead.bind(this) } });
  }

  onComponentQrRead(code) {
    if (code) {
      QRCodeParser.parseComponentCode(code).then((response) => {
        if (!response.error && response.mstComponents[0]) {
          this.setState({
            componentId: response.mstComponents[0].componentId,
            componentCode: response.mstComponents[0].componentCode,
            componentName: response.mstComponents[0].componentName,
          });
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
   * 設備ID用QRボタン
   */
  buttonMachineQRClick() {
    //QRページを遷移して設備ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMachineQrRead.bind(this) } });
  }

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
      inputEl: '#issue-list-page-machine-id',
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
          if (me.checkMachineNams.indexOf(item.machineId) < 0) {
            me.checkMachineNams.push(item.machineId);
            me.machineNames.push(item);
          }
          me.createPickerMachineName(true);
        },
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
      department: me.state.reportDepartment
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
      let machineName = machine.machineName !== undefined ? machine.machineName : '';
      _displayValues.push(machineName);
      _uuids[machine.machineId] = machine.machineUuid;
      if (me.checkMachineNams.indexOf(machine.machineId) < 0) {
        me.checkMachineNams.push(machine.machineId);
      }
      if (me.state.machineId === machine.machineId) {
        defaultValue = machine.machineId;
        defaultName = machineName;
        defaultUuid = machine.machineUuid;
      }
    }
    if (me.pickerMachineName) {
      me.pickerMachineName.destroy();
    }
    me.pickerMachineName = me.createPicker('#issue-list-page-machine-name', _values, _displayValues,
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
   * 設備検索ボタン
   */
  buttonMachineSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch?department='+ this.state.reportDepartment, {props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }

  /**
   * 金型検索ボタン
   */
  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', {props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
  }

  loadComponent(moldId) {
    var me = this;
    MoldMaster.getMoldDetail({
      moldId: moldId
    }).then((response) => {
      if (response.mstMoldComponentRelationVo.length > 0) {
        if (response.mstMoldComponentRelationVo.length === 1) {
          this.setState({
            componentCode: response.mstMoldComponentRelationVo[0].componentCode,
            componentId: response.mstMoldComponentRelationVo[0].componentId,
            componentName: response.mstMoldComponentRelationVo[0].componentName,
          });
        } else {
          let data = response.mstMoldComponentRelationVo;
          var timeInterval = setInterval(() => {  
            if(me.$f7router.allowPageChange){  
              clearInterval(timeInterval);      
              me.$f7router.navigate(APP_DIR_PATH + '/singlecomponent', {props: { data: data, onComplete: me.onSingleComponentComplete.bind(me) } });
            }
          }, 100);
        }
      }
    }).catch((err) => {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }

  onSingleComponentComplete(item) {
    this.setState({
      componentCode: item.componentCode,
      componentId: item.componentId,
      componentName: item.componentName,
    });
  }

  onMoldSelectedCell(item) {
    this.setState({
      moldUuid: item.moldUuid,
      moldId: item.moldId,
      moldName: item.moldName,
    });
    //this.loadComponent(item.moldId);
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
      inputEl: '#issue-list-page-mold-id',
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
        MoldMaster.getMoldLike({
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
          //me.loadComponent(value[0].moldId);
        },
      },
    });
  }
  /**
   * 部品検索ボタン
   */
  buttonComponentSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/componentSearch', {props: { onSelectedCell: this.onComponentSelectedCell.bind(this) } });
  }

  onComponentSelectedCell(item) {
    let data = {
      componentCode: item.componentCode,
      componentId: item.id,
      componentName: item.componentName,
    };
    this.setState(data);
    // this.loadMoldForComponent(data);
  }
  
  /**
   * 部品コード
   */
  createComponentsAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#issue-list-page-component-code',
      openIn: 'dropdown',
      valueProperty: 'componentCode', //object's "value" property name
      textProperty: 'componentCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (me.components.length > 0) {
          for (var i = 0; i < me.components.length; i++) {
            results.push(me.components[i]);
          }
          render(results);
        } else {
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
        }
      },
      on: {
        change: function (value) {
          let data = {
            componentId: value[0].id,
            componentCode: value[0].componentCode,
            componentName: value[0].componentName,
          };
          me.setState(data);
          // me.loadMoldForComponent(data);
        },
      },
    });
  }

  loadMore(type) {
    var me = this;
    let issues = me.state.issues;
    let pageNumber = me.state.pageNumber;
    let pageTotal = me.state.pageTotal;
    let allowInfinite = me.state.allowInfinite;
    if (type === 'reload') {
      issues = [];
      pageNumber = 1;
      pageTotal = 1;
      allowInfinite = true;
      this.setState({
        pageNumber: pageNumber,
        pageTotal: pageTotal,
        allowInfinite: allowInfinite,
        issues: issues
      });
    }
    // //Preloaderを表示すること
    me.$f7.preloader.show();
    if (!allowInfinite) {
      me.$f7.preloader.hide();
      return false;
    }
    me.setState({ allowInfinite: false });
    if (pageNumber > pageTotal) {
      me.$f7.preloader.hide();
      me.setState({ showPreloader: true });
      return false;
    }
    //Page表示用のAPIを用いて50件ずつ読み込むこと
    Issue.getIssues({
      measureStatus: me.state.measureStatus === '-99' ? 50 : me.state.measureStatus,
      measureStatusOperand: me.state.measureStatus === '-99' ? 1 : 0,
      department: me.state.reportDepartment,
      moldId: me.state.moldId,
      moldName: me.state.moldName,
      machineId: me.state.machineId,
      machineName: me.state.machineName,
      componentId: me.state.componentId,
      componentCode: me.state.componentCode,
      componentName: me.state.componentName,
      pageNumber: pageNumber,
      pageSize: me.state.pageSize,
      sidx: 'reportDate',
      sord: 'asc'
    })
      .then(function (response) {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if (response.pageTotal > 0) {
          for (let key in response.tblIssueVoList) {
            issues.push(response.tblIssueVoList[key]);
          }
          pageNumber++;
          me.setState({
            issues: issues,
            pageNumber: pageNumber,
            pageTotal: response.pageTotal,
            allowInfinite: true
          });
        } else {
          // me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
          me.setState({
            issues: [],
            pageNumber: 1,
            pageTotal: 0,
            allowInfinite: true,
            emptyMsg: me.state.dict.mst_error_record_not_found
          });
        }
      })
      .catch(function (err) {
        //Preloaderを消去
        me.$f7.preloader.hide();
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }
  /**
   * 検索ボタン
   */
  buttonSearch() {
    this.setState({
      allowInfinite: true
    });
    this.loadMore('reload');
    this.flag = 1;
  }

  makeCard(index, item) {
    item.reportDate = item.reportDate ? moment(new Date(item.reportDate)).format('YYYY/MM/DD') : '';
    item.measureDueDate = item.measureDueDate ? moment(new Date(item.measureDueDate)).format('YYYY/MM/DD') : '';
    item.measureStatusName = this.measureStatusObject[item.measureStatus];
    var card = (
      <Card key={index} padding={false}>
        <CardContent padding={false} >
          <List noHairlines={false} className="no-margin no-padding">
            <ListItem link={APP_DIR_PATH + '/issue-register?id=' + item['id']}>
              <Col width="50">{this.state.dict.registration_date}</Col>
              <Col width="50">{item.reportDate}</Col>
            </ListItem>
          </List>
          <Link noLinkClass href={APP_DIR_PATH + '/issue-register?id=' + item['id']}>
            <Block>
              <Row>
                <Col width="50">{this.state.dict.issue_measure_status}</Col>
                <Col width="50">{item.measureStatusName}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.mold_name}</Col>
                <Col width="50">{item.moldName}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.machine_name}</Col>
                <Col width="50">{item.machineName}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.component_code}</Col>
                <Col width="50">{item.componentCode}</Col>
              </Row>
              <Row>
                <Col width="50">{this.state.dict.issue_report_person_name}</Col>
                <Col width="50">{item.issueReportPersonName}</Col>
              </Row>
            </Block>
          </Link>
        </CardContent>
      </Card>
    );
    return card;
  }

  makeList(_issues) {
    //return _issues.length;
    var issueList = [];
    for (var i = 0; i < _issues.length; i++) {
      issueList.push(this.makeListRow(i, _issues[i]));
    }
    return (
      <List className={'no-margin no-padding normalFont'}>
        {issueList};
      </List>
    );
  }

  copy(issueId) {
    //alert('Copy issue from ID:' + issueId);
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-register?copy=1&id=' + issueId);
  }

  delete(issueId) {
    //alert('Delete issue ID:' + issueId);
    let me = this;
    let app = me.$f7;
    me.$f7.dialog.create({
      text: this.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          Issue.deleteIssue(issueId)
            .then((response) => {
              if (!response.error) {
                //検索実行
                me.buttonSearch();
              } else {
                app.dialog.alert(response.errorMessage);
              }
            }).catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        }
      },{
        text: this.state.dict.no,
        onClick: function (dialog) {
          dialog.close();
        }
      }]
    }).open();
  }

  makeListRow(index, item) {
    item.reportDate = item.reportDate ? moment(new Date(item.reportDate)).format('YYYY/MM/DD') : '';
    item.measureDueDate = item.measureDueDate ? moment(new Date(item.measureDueDate)).format('YYYY/MM/DD') : '';
    item.measureStatusName = this.measureStatusObject[item.measureStatus];
    var card = (
      <ListItem key={index} link={APP_DIR_PATH + '/issue-register?id=' + item['id']} swipeout>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{this.state.dict.registration_date}</ListItemCell>
            <ListItemCell>{item.reportDate}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.issue_measure_status}</ListItemCell>
            <ListItemCell>{item.measureStatusName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.mold_name}</ListItemCell>
            <ListItemCell>{item.moldName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_name}</ListItemCell>
            <ListItemCell>{item.machineName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.component_code}</ListItemCell>
            <ListItemCell>{item.componentCode}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.issue_report_person_name}</ListItemCell>
            <ListItemCell>{item.issueReportPersonName}</ListItemCell>
          </ListItemRow>
        </div>
        <SwipeoutActions right>
          <SwipeoutButton onClick={this.copy.bind(this, item['id'])}>{this.state.dict.copy}</SwipeoutButton>
          <SwipeoutButton onClick={this.delete.bind(this, item['id'])}>{this.state.dict.delete_record}</SwipeoutButton>
        </SwipeoutActions>
      </ListItem>
    );
    return card;
  }

  render() {
    const { issues } = this.state;
    return (
      <DocumentTitle title={this.state.dict.issue_list}>
        <Page
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          infinite
          infinitePreloader={false}
          onInfinite={this.loadMore.bind(this)}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.issue_list}</BlockTitle>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.issue_measure_status}</Label> {/* 初期値：完了以外, 未選択あり */}
              <Input type="text" name="measureStatus" clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="issue-list-page-measure-status" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_reported_department}</Label> {/* ログインユーザーの所属を初期セット */}
              <Input type="text" name="reportDepartment" clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="issue-list-page-report-department" />
            </ListItem>
          </List>

          <List accordionList noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll">
            <ListItem accordionItem title="">
              <AccordionContent>
                <List noHairlinesBetween className="no-margin-top no-margin-bottom">
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.machine_id}</Label>
                    <Input type="text" name="machineId" value={this.state.machineId} clearButton onInputClear={this.handleClear.bind(this)} inputId="issue-list-page-machine-id" onChange={this.handleChange.bind(this)} />
                    <div className="btn-absolute">
                      <Button small fill text="QR" onClick={this.buttonMachineQRClick.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label>{this.state.dict.machine_name}</Label>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    {/* <Label>{this.state.dict.machine_name}</Label>  */} {/* ログインユーザーの所属に等しい設備をピッカーから選択 */}
                    {/* <Input type="text" name="machineName" value={this.state.machineName} readonly inputId="issue-list-page-machine-name" /> */}
                    <Input type="text" name="machineName" value={this.state.machineName} inputId="issue-list-page-machine-name" /> 
                    <div className="btn-absolute">
                      <Button small fill iconF7="search" onClick={this.buttonMachineSearch.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.mold_id}</Label>
                    <Input type="text" name="moldId" value={this.state.moldId} clearButton onInputClear={this.handleClear.bind(this)} inputId="issue-list-page-mold-id" onChange={this.handleChange.bind(this)} />
                    <div className="btn-absolute">
                      <Button small fill text="QR" onClick={this.buttonMoldQRClick.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label>{this.state.dict.mold_name}</Label>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Input type="text" name="machineName" value={this.state.moldName} /> 
                    <div className="btn-absolute">
                      <Button small fill iconF7="search" onClick={this.buttonMoldSearch.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.component_code}</Label>
                    <Input type="text" name="componentCode" value={this.state.componentCode} clearButton onInputClear={this.handleClear.bind(this)} inputId="issue-list-page-component-code" onChange={this.handleChange.bind(this)} />
                    <div className="btn-absolute">
                      <Button small fill text="QR" onClick={this.buttonComponentQRClick.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Input type="text" name="machineName" value={this.state.componentName}/> 
                    <div className="btn-absolute">
                      <Button small fill iconF7="search" onClick={this.buttonComponentSearch.bind(this)}></Button>
                    </div>
                  </ListItem>
                </List>
              </AccordionContent>
            </ListItem>
          </List>
          <Block>
            <Row>
              <Col width="33">
                <Button fill text={this.state.dict.search} onClick={this.buttonSearch.bind(this)}></Button>
              </Col>
            </Row>
          </Block>

          {
            // KM-1184 [SP]iPhoneで打上一覧の検索条件が途切れる
            this.flag === 0
              ?
              <Block>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
              </Block>
              : null
          }
          {
            issues.length < 1
              ?
              <Block>
                {this.state.emptyMsg}
                {/* KM-1184	[SP]iPhoneで打上一覧の検索条件が途切れる */}
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
                <h1> &nbsp;</h1>
              </Block>
              :
              this.makeList(issues)
              //issues.map((item, index) => {
              //  return this.makeCard(index, item);
              //})
          }
        </Page>
      </DocumentTitle>
    );
  }

}