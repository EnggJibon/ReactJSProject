import React from 'react';
import {
  Page,
  Button,
  Block,
  Row,
  Col,
  BlockTitle,
  List,
  ListItem,
  ListItemRow,
  ListItemCell,
  Radio,
  Label,
  Input
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import moment from 'moment';
import Cookies from 'universal-cookie';
import Work from 'karte/apps/core/logics/work';
import Production from 'karte/apps/core/logics/production';
import Authentication from 'karte/shared/logics/authentication';
import Choice from 'karte/shared/master/choice';
import MoldMaster from 'karte/shared/master/mold';
import Machine from 'karte/shared/master/machine';
import Component from 'karte/shared/master/component';
import { connect } from 'react-redux';
import Direction from 'karte/shared/master/direction';
import System from 'karte/shared/master/system';
import { clearWorkCopyInfo } from 'karte/apps/core/reducers/work-reducer';
import { updateMachineReportInfo } from 'karte/apps/machine/reducers/machine-report-reducer';

export class WorkStartInputPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        work_start: '',
        working_date: '',
        yesterday: '',
        today: '',
        tomorrow: '',
        work_phase: '',
        work_category: '',
        mold_id: '',
        mold_name: '',
        component_code: '',
        component_name: '',
        machine_id: '',
        machine_name: '',
        direction_code: '',
        work_proc_cd: '',
        work_code: '',
        record_register: '',
        delete_record: '',
        work_start_time: '',
        close: '',
        cancel: '',
        yes: '',
        no: '',
        ok: '',
        msg_record_added: '',
        msg_confirm_start_work: '',
        msg_error_not_null: '',
        msg_not_belong_direction: '',
        msg_warning_mold_under_maintenance: '',
        msg_warning_indirect_work_with_component: '',
        msg_warning_machine_production_conflict: '',
        msg_warning_machine_maintenance_production_conflict: '',
        msg_warning_machine_work_conflict: '',
        msg_warning_mold_maintenance_production_conflict: '',
        msg_warning_mold_production_conflict: '',
        msg_warning_mold_work_conflict: '',
        mst_error_record_not_found: '',
        msg_error_producint_work_datetime_order: '',
        msg_warning_machine_under_maintenance: '',
        msg_error_work_datetime_order: ''
        //必要な文言をここに足す
      },

      // 項目
      id: '',
      required:'',
      requiredProcessCode:'',
      workingDate: '',
      workStartTime: '',
      workEndTime: '',
      workingTimeMinutes: 0,
      workBreakTimeMinutes: 0,
      workActualTimeMinutes: 0,
      workPhaseType: '',
      workPhaseId: '',
      workPhaseChoiceSeq: 0,
      workPhaseName: '',
      workCategory: 0,
      workCategoryName: '',
      componentCode: '',
      componentId: '',
      componentName: '',
      directionId: '',
      directionCode: '',
      directFlg: 1,
      isStart: true,
      locked: 0,
      maintenanceId: '',
      nextWorkPhaseId: '',
      nextWorkPhaseName: '',
      nextWorkPhaseType: '',
      personUuid: '',
      productionId: '',
      moldId: '',
      moldName: '',
      moldUuid: '',
      machineUuid: '',
      machineId: '',
      machineName: '',
      workCode: '',
      procCd: '',

      msgWorkBreakTimeMinutes: '',
      msgWorkEndTime: '',
      msgProcCd: '',
      msgWorkPhase: '',
      msgWorkingDate: '',
      errorisNotLogin: '',

      businessStartTime: '',
      requireProcCdInWork: '',
      directionComponentId: '',
      directFlgs: [],
      componentArray: []
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.workPhases = [];
    this.itemWorkPhases = [];
    this.checkResult = {};
    this.machineReportInfo = props.reportInfo;
  }

  createMoldIdAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#work-start-input-page-mold-id',
      openIn: 'dropdown',
      valueProperty: 'moldId',  //object's "value" property name
      textProperty: 'moldId', //object's "text" property name      
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          //render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        MoldMaster.getMoldLikeWithoutDispose({
          moldId: query
        })
          .then((response) => {
            let data = response.mstMoldAutoComplete;
            for (var i = 0; i < data.length; i++) {
              results.push(data[i]);
            }
            autocomplete.preloaderHide();
            render(results);
          })
          .catch((err) => {
            var error = err;
            if (error['errorCode'] === 'E201') {
              me.$f7.dialog.alert(error.errorMessage);
            } else {
              me.setState(() => { throw new UnexpectedError(error); });
            }
          });
      },
      on: {
        change: function (value) {
          me.setState({
            moldId: value[0].moldId,
            moldUuid: value[0].uuid,
            moldName: value[0].moldName,
            componentArray: []
          });
          me.loadComponent(value[0].moldId);
        },
        closed: function (autocomplete) {
          if (me.state.moldName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              moldId: '',
              moldUuid: '',
              moldName: ''
            });
          }
        }
      },
    });

  }

  getCookieLang() {
    const cookies = new Cookies();
    return cookies.get('LANG');
  }

  componentDidMount() {
    var me = this;
    const app = me.$f7;
    DictionaryLoader.getDictionary(this.state.dict).then(function (values) {
      me.setState({ dict: values });
      me.workingDateCalendar = app.calendar.create(
        CalendarUtil.getCalendarProperties('#work-start-input-page-working-date', {
          change: function (calendar, value) {
            me.setState({
              workingDate: moment(new Date(value)).format('YYYY/MM/DD')
            });
          }
        }));

      me.createMoldIdAutocomplete();
      me.createComponentAutocomplete();
      me.createMachineAutocomplete();
      me.createDirectionCodeAutocomplete();

      Choice.categories('mst_work_phase.direct_flg', {
        //langId: me.getCookieLang()
      }).then((response) => {
        me.setState({
          directFlgs: response.mstChoiceVo
        });


        Work.getWorkPhase({
          //langId: me.getCookieLang()
        }).then((response) => {

          me.itemWorkPhases = [...response.mstWorkPhases];
          me.setWorkPhaseItems();

        }).catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });

      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

    }).catch(function (err) {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }

  /**
   * 手配・工事番号
   */
  createDirectionCodeAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#work-start-input-page-direction-code',
      openIn: 'dropdown',
      valueProperty: 'directionCode', //object's "value" property name
      textProperty: 'directionCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Direction.like({
          directionCode: query
        }).then((response) => {
          let data = response.tblDirections;
          if (data.length === 0) {
            me.setState({
              directionId: '',
              directionComponentId: ''
            });
          }
          for (var i = 0; i < data.length; i++) {
            results.push(data[i]);
          }
          // Hide Preoloader
          autocomplete.preloaderHide();
          // Render items by passing array with result items
          render(results);
        }).catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
      },
      on: {
        change: function (value) {
          let item = {
            directionId: value[0].id,
            directionCode: value[0].directionCode
          };
          me.setState(item);

          me.loadDateByDirectionId(value[0].id);
        },

        closed: function (autocomplete) {
          if (me.state.directionId === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              directionId: '',
              directionCode: '',
              moldId: '',
              moldName: '',
              moldUuid: '',
              moldReadOnly: false,
              componentCode: '',
              componentName: '',
              componentId: '',
              componentArray: [],
              componentReadOnly: false
            });
          }
        }
      },
    });
  }

  loadDateByDirectionId(id) {
    var me = this;
    Direction.getDataByDirectionId(id)
      .then((response) => {

        if (response.moldUuid) {
          me.setState(
            {
              moldId: response.moldId,
              moldName: response.moldName,
              moldUuid: response.moldUuid,
              componentArray: [],
              moldReadOnly: true
            }
          );

        } else {
          me.setState(
            {
              moldId: '',
              moldName: '',
              moldUuid: '',
              componentArray: [],
              moldReadOnly: false
            }
          );

        }

        if (response.componentId) {

          me.setState(
            {
              componentCode: response.componentCode,
              componentName: response.componentName,
              componentId: response.componentId,
              directionComponentId: response.componentId,
              componentArray: [],
              componentReadOnly: true
            }
          );
        } else {
          me.setState(
            {
              componentCode: '',
              componentName: '',
              componentId: '',
              directionComponentId: '',
              componentArray: [],
              componentReadOnly: false
            }
          );
        }
      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    let workCopyInfo = this.props.workCopyInfo;

    System.load(['system.business_start_time', 'system.require_proc_cd_in_work'])
      .then((values) => {
        this.setState({
          businessStartTime: values.cnfSystems[0].configValue,
          requireProcCdInWork: values.cnfSystems[1].configValue,
        });
        if(values.cnfSystems[1].configValue==='1')
        {
          var required_mark = DictionaryLoader.requiredField();
          this.setState({requiredProcessCode: required_mark});
        }
        else
        {
          this.setState({requiredProcessCode: ''});
        }
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

    //クエリパラメータで指定されたIDを取得
    let { workingDate, machineUuid, machineId, machineName } = this.$f7route.query;
    if (machineUuid) {//機械日報から遷移とき
      me.setState({
        machineUuid: machineUuid,
        machineId: machineId,
        machineName: machineName,
        workingDate: moment(new Date(workingDate)).format('YYYY/MM/DD')
      });
    } else if (workingDate) {
      me.setState({
        workingDate: moment(new Date(workingDate)).format('YYYY/MM/DD')
      });
    } else if (workCopyInfo) {
      // コピー情報をセット
      this.setState({
        moldId: workCopyInfo.moldId, // 金型ID
        moldName: workCopyInfo.moldName, // 金型 Name
        moldUuid: workCopyInfo.moldUuid, // 金型UUid

        machineUuid: workCopyInfo.machineUuid, // 設備UUID
        machineName: workCopyInfo.mstMachine ? workCopyInfo.mstMachine.machineName : '', // 設備Name
        machineId: workCopyInfo.mstMachine ? workCopyInfo.mstMachine.machineId : '', // 設備ID

        componentCode: workCopyInfo.componentCode, // 部品Code
        componentId: workCopyInfo.componentId, // 部品Id
        componentName: workCopyInfo.componentName, // 部品Name

        workCode: workCopyInfo.workCode, // 工程番号

        directionCode: workCopyInfo.directionCode,
        directionId: workCopyInfo.directionId,
        directionComponentId: workCopyInfo.componentId,

        workCategory: workCopyInfo.workCategory, // 作業内容
        workCategoryName: workCopyInfo.workCategoryName, // 作業内容

        workPhaseChoiceSeq: workCopyInfo.workPhaseChoiceSeq, // 工程
        workPhaseId: workCopyInfo.workPhaseId, // 工程
        workPhaseName: workCopyInfo.workPhaseName, // 工程

        procCd: workCopyInfo.procCd, // 工程CD
        directFlg: workCopyInfo.mstWorkPhase ? workCopyInfo.mstWorkPhase.directFlg : 1 // 直接・間接区分
      });
    }
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  /**
    * ページ終了処理
    */
  onPageBeforeRemove() {
    var me = this;
    //作成したオブジェクトはページ終了処理で廃棄(destroy)する
    if (me.workingDateCalendar) {
      me.workingDateCalendar.destroy();
    }

    this.props.clearWorkCopyInfo();
  }

  /**
    * 戻る
    */
  onBackClick() {
    //ひとつ前の画面に戻る
    let me = this;
    if (me.$f7route.query.pageName === 'reportDetail') {
      let query = me.$f7route.query;
      query['reportDate'] = me.state.workingDate;
      delete query['workingDate'];
      let params = Object.keys(query).map(function (key) {
        if (query[key]) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
        } else {
          return '';
        }
      }).join('&');
      me.machineReportInfo.reload = '3';
      me.machineReportInfo.isChanged = '0';
      me.props.updateMachineReportInfo(me.machineReportInfo);
      me.$f7router.navigate(APP_DIR_PATH + '/report-detail?' + params, { pushState: true, reloadAll: true });
    } else if (me.$f7route.query.pageName === 'workCopy') {
      let query = {
        machineUuid: me.state.machineUuid,
        machineId: encodeURIComponent(me.state.machineId),
        machineName: encodeURIComponent(me.state.machineName),
        department: me.$f7route.query.department,
        reportDate: me.state.workingDate === '' ? moment(new Date(me.props.workCopyInfo.workingDate)).format('YYYY/MM/DD') : me.state.workingDate,
      };
      let params = Object.keys(query).map(function (key) {
        if (query[key]) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
        } else {
          return '';
        }
      }).join('&');
      me.machineReportInfo = {
        ...query,
        reload: '3'
      };
      me.props.updateMachineReportInfo(me.machineReportInfo);
      me.$f7router.navigate(APP_DIR_PATH + '/report-detail?' + params, { pushState: true, reloadAll: true });
    }
    else if (me.$f7route.query.pageName==='workDailyReport') {
      me.$f7router.navigate(APP_DIR_PATH + '/work-daily-report-list', { pushState: true, reloadAll: true });
    }
    else {
      me.$f7router.back();
    }
  }

  /**
 * クリアボタン押下
 * @param {*} event 
 */
  handleClear(event) {
    //Inputタグのname属性にID項目名称(moldId)が入っている
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'moldId') {
      this.setState({
        moldName: '',
        moldUuid: '',
        moldId: '',
      });
    }

    if (event.target.name === 'componentCode') {
      this.setState({
        componentCode: '',
        componentName: '',
        componentId: '',
      });
    }

    if (event.target.name === 'machineId') {
      this.setState({
        machineId: '',
        machineName: '',
        machineUuid: '',
      });
    }

    //クリアボタンでクリアされたら関連づくIDをクリアする
    if (event.target.name === 'workPhase') {
      this.setState({
        workPhaseChoiceSeq: 0,
        workPhaseName: '',
        workCategory: 0,
        workCategoryName: ''
      });
      this.createPickerWorkPhase(false);
    }

    if (event.target.name === 'workCategory') {
      this.setState({
        workCategory: 0,
        workCategoryName: ''
      });
      this.createPickerWorkCategory(false);
    }
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });

    if (event.target.name === 'moldId') {
      this.setState({ 'moldUuid': '' });
      this.setState({ 'moldName': '' });
    }

    if (event.target.name === 'componentCode') {
      this.setState({ 'componentId': '' });
      this.setState({ 'componentName': '' });
    }

    if (event.target.name === 'machineId') {
      this.setState({ 'machineUuid': '' });
      this.setState({ 'machineName': '' });
    }
    if (event.target.value !== '') {
      let name = event.target.name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.setState({ ['msg' + name]: '' });
    }
  }

  /**
   * 手配・工事番号用QRボタン
   */
  buttonDirectionCodeQRClick() {
    //QRページを遷移して金型ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onDirectionCodeQrRead.bind(this) } });
  }

  onDirectionCodeQrRead(code) {
    let me = this;
    if (code) {

      Direction.equal({
        directionCode: code
      }).then((response) => {
        let data = response.tblDirections;
        if (data.length === 0) {
          // 手配・工事テーブルにない値はエラー。
          me.setState({
            directionId: '',
            directionComponentId: '',
            directionCode: ''
          });

          me.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);

        } else {

          let item = {
            directionId: data[0].id,
            directionCode: data[0].directionCode
          };
          me.setState(item);

          me.loadDateByDirectionId(data[0].id);
        }
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
      QRCodeParser.parseMoldIDWithoutDispose(code).then((response) => {
        if (!response.error && response.mstMoldAutoComplete[0]) {
          this.setState({
            moldUuid: response.mstMoldAutoComplete[0].uuid,
            moldId: response.mstMoldAutoComplete[0].moldId,
            moldName: response.mstMoldAutoComplete[0].moldName,
            componentArray: []
          });
          this.loadComponent(response.mstMoldAutoComplete[0].moldId);
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
            componentId: response.mstComponents[0].id,
            componentCode: response.mstComponents[0].componentCode,
            componentName: response.mstComponents[0].componentName,
          });
          response.mstComponents[0]['componentId'] = response.mstComponents[0].id;
          this.loadMoldForComponent(response.mstComponents[0]);
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
      QRCodeParser.parseMachineIDWithoutDispose(code).then((response) => {
        if (!response.error && response.mstMachineAutoComplete[0]) {
          let item = {
            machineUuid: response.mstMachineAutoComplete[0].machineUuid,
            machineId: response.mstMachineAutoComplete[0].machineId,
            machineName: response.mstMachineAutoComplete[0].machineName,
          };
          this.setState(item);
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
   * 設備検索ボタン
   */
  buttonMachineSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch', {props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }

  /**
   * 金型検索ボタン
   */
  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', {props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
  }

  /**
   * 設備ID
   */
  createMachineAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#work-start-input-page-machine-id',
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
        },
        closed: function (autocomplete) {
          if (me.state.machineName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              machineName: '',
              machineId: '',
            });
          }
        }
      },
    });
  }

  createComponentAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#work-start-input-page-component-code',
      openIn: 'dropdown',
      valueProperty: 'componentCode', //object's "value" property name
      textProperty: 'componentCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];

        if (query.length === 0) {
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Component.getComponentLike({
          componentCode: query
        }).then((response) => {
          let data = response.mstComponents;
          for (var i = 0; i < data.length; i++) {
            results.push(data[i]);
          }
          // Hide Preoloader
          autocomplete.preloaderHide();
          // Render items by passing array with result items
          render(results);
        }).catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
      },
      on: {
        change: function (value) {
          let item = {
            componentId: value[0].id,
            componentCode: value[0].componentCode,
            componentName: value[0].componentName,
            componentArray: []
          };
          me.setState(item);
          me.loadMoldForComponent(item);
        },
        closed: function (autocomplete) {
          if (me.state.componentName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              componentCode: '',
              componentName: '',
              componentId: '',
              //componentArray: [],
              componentReadOnly: false
            });
          }
        }
      }
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
    this.loadMoldForComponent(data);
  }

  loadMoldForComponent(item) {
    let componentId = item.componentId;
    let me = this;
    MoldMaster.getMoldForComponentWithoutDispose(componentId)
      .then((response) => {
        let mstMoldComponentRelation = response.mstMoldComponentRelation;
        if (mstMoldComponentRelation.length === 1) {
          let data = mstMoldComponentRelation[0];
          me.setState({
            moldUuid: data.mstMold.uuid,
            moldId: data.mstMold.moldId,
            moldName: data.mstMold.moldName,
          });
        } else if (mstMoldComponentRelation.length > 1) {
          let molds = [];
          for (let key in mstMoldComponentRelation) {
            let value = mstMoldComponentRelation[key];
            molds.push(value.mstMold);
          }
          var timeInterval = setInterval(() => {  
            if(me.$f7router.allowPageChange){  
              clearInterval(timeInterval);      
              me.$f7router.navigate(APP_DIR_PATH + '/singlemold', {props: { data: molds, onComplete: me.onSingleMoldComplete.bind(me) } });
            }
          }, 100);
        }
      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  onSingleMoldComplete(item) {
    this.setState({
      moldId: item.moldId,
      moldName: item.moldName,
      moldUuid: item.uuid,
    });
  }

  onMachineSelectedCell(item) {
    this.setState({
      machineUuid: item.machineUuid,
      machineId: item.machineId,
      machineName: item.machineName,
    });
  }

  onMoldSelectedCell(item) {
    this.setState({
      moldUuid: item.moldUuid,
      moldId: item.moldId,
      moldName: item.moldName,
    });
    this.loadComponent(item.moldId);
  }

  loadComponent(moldId) {
    let me = this;
    MoldMaster.getMoldIncludeComponent({
      moldId: moldId
    }).then((response) => {
      let data = response.mstMoldComponentRelationVo;
      if (data.length > 1) {
        var timeInterval = setInterval(() => {  
          if(me.$f7router.allowPageChange){  
            clearInterval(timeInterval);      
            me.$f7router.navigate(APP_DIR_PATH + '/multiplecomponent', {props: { data: data, onComplete: me.onMultipleComponentComplete.bind(me) } });
          }
        }, 100);
      } else if (data.length === 1) {
        me.setState({
          componentId: data[0].componentId,
          componentCode: data[0].componentCode,
          componentName: data[0].componentName
        });
      }
    }).catch((err) => {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }

  onMultipleComponentComplete(items) {
    let componentArray = [];
    if (items.length > 0) {
      for (let key in items) {
        let value = items[key];
        if (parseInt(key) === 0) {
          this.setState({
            componentId: value.componentId,
            componentCode: value.componentCode,
            componentName: value.componentName,
          });
        } else {
          componentArray.push({
            componentId: value.componentId,
            componentCode: value.componentCode,
            componentName: value.componentName,
          });
        }
      }
      if (componentArray.length > 0) {
        this.setState({
          componentArray: componentArray
        });
      }
    }
  }

  /**
   * 作業工程Picker作成
   */
  createPickerWorkPhase(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.workPhases.length; i++) {
      let workPhase = me.workPhases[i];
      _values.push(workPhase.choiceSeq);
      _displayValues.push(workPhase.workPhaseName);

      if (me.state.workPhaseChoiceSeq === workPhase.choiceSeq) {
        defaultValue = workPhase.choiceSeq;
        defaultName = workPhase.workPhaseName;
      }
    }
    if (me.pickerWorkPhase) {
      me.pickerWorkPhase.destroy();
    }
    if (_displayValues.length > 0) {

      me.pickerWorkPhase = me.createPicker('#work-start-input-page-work-phase', _values, _displayValues,
        (picker, value, displayValue) => {
          const oldWorkPhaseChoiceSeq = me.state.workPhaseChoiceSeq;
          me.setState({
            workPhaseChoiceSeq: value,
            workPhaseName: displayValue,
            workCategory: 0,
            workCategoryName: ''
          });

          //所在地が変わったら傘下の設置場所を読み込む
          if (oldWorkPhaseChoiceSeq !== value) {
            me.loadWorkCategory();
          }
        }
      );
    }

    if (setDefault && defaultValue !== null) {
      me.pickerWorkPhase.setValue([defaultValue], 0);
      me.setState({
        workPhaseChoiceSeq: defaultValue,
        workPhaseName: defaultName
      });
      me.loadWorkCategory();
    }
  }

  /**
   * 作業内容Picker作成
   */
  createPickerWorkCategory(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.workCategories.length; i++) {
      let workCategory = me.workCategories[i];
      let workCategorySeq = parseInt(workCategory.seq);
      _values.push(workCategorySeq);
      _displayValues.push(workCategory.choice);

      if (me.state.workCategory === workCategorySeq) {
        defaultValue = workCategorySeq;
        defaultName = workCategory.choice;
      }
    }
    if (me.pickerWorkCategory) {
      me.pickerWorkCategory.destroy();
    }
    if (_displayValues.length > 0) {
      me.pickerWorkCategory = me.createPicker('#work-start-input-page-work-category', _values, _displayValues,
        (picker, value, displayValue) => {
          me.setState({
            workCategory: value,
            workCategoryName: displayValue
          });
        }
      );
    }

    if (setDefault && defaultValue !== null) {
      me.pickerWorkCategory.setValue([defaultValue], 0);
      me.setState({
        workCategory: defaultValue,
        workCategoryName: defaultName
      });
    }
  }

  /**
   * 作業内容読み込み
   */
  loadWorkCategory() {
    var me = this;
    var selectedWorkPhaseChoiceSeq = me.state.workPhaseChoiceSeq;
    if (selectedWorkPhaseChoiceSeq !== 0) {
      Choice.categories('tbl_work.work_category', {
        parentSeq: selectedWorkPhaseChoiceSeq,
        //langId: me.getCookieLang()
      })
        .then((response) => {
          me.workCategories = [...response.mstChoiceVo];
          me.createPickerWorkCategory(true);
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
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
      ],
    });
  }

  getFormData() {
    let data = {
      id: this.state.id,
      workingDate: moment(new Date(this.state.workingDate)).format('YYYY-MM-DDT00:00:00'),
      startDatetimeStr: moment(this.state.workStartTime).format('YYYY/MM/DD HH:mm:00'),
      directionId: this.state.directionId,
      directionCode: this.state.directionCode,
      moldId: this.state.moldId,
      moldName: this.state.moldName,
      moldUuid: this.state.moldUuid,
      componentId: this.state.componentId,
      componentCode: this.state.componentCode,
      componentName: this.state.componentName,
      workPhaseId: this.state.workPhaseId,
      workPhaseName: this.state.workPhaseName,
      directFlg: parseInt(this.state.directFlg),
      workPhaseChoiceSeq: this.state.workPhaseChoiceSeq,
      workPhaseType: this.state.workPhaseType,
      nextWorkPhaseId: this.state.nextWorkPhaseId,
      nextWorkPhaseName: this.state.nextWorkPhaseName,
      nextWorkPhaseType: this.state.nextWorkPhaseType,
      workCategory: this.state.workCategory,
      workCategoryName: this.state.workCategoryName,
      procCd: this.state.procCd,
      workCode: this.state.workCode,
      personUuid: this.state.personUuid,
      locked: this.state.locked,
      maintenanceId: this.state.maintenanceId,
      machineUuid: this.state.machineUuid,
      machineId: this.state.machineId,
      machineName: this.state.machineName,
      productionId: this.state.productionId,
      isStart: this.state.isStart
    };
    return data;
  }

  check(param) {

    // 入力チェック
    //作業日必須チェック
    if (param.workingDate === 'Invalid date' || param.workingDate === '') {
      this.setState({ msgWorkingDate: this.state.dict.msg_error_not_null });
      return true;
    } else {
      this.setState({ msgWorkingDate: '' });
    }

    //工程必須チェック
    if (!param.workPhaseChoiceSeq || param.workPhaseChoiceSeq === 0) {
      this.setState({ msgWorkPhase: this.state.dict.msg_error_not_null });
      return true;
    } else {
      this.setState({ msgWorkPhase: '' });
    }

    // 工程CD
    // 作業開始時に工程CDを必須にする(0:しない,1:する)
    if (this.state.requireProcCdInWork === '1' && param.procCd === '') {
      this.setState({ msgProcCd: this.state.dict.msg_error_not_null });
      return true;
    } else {
      this.setState({ msgProcCd: '' });
    }

    return false;
  }

  buttonRegistration() {
    var me = this;
    let data = this.getFormData();
    if (me.check(data)) {//単純チェック
      return;
    }


    me.workCheck(data);//業務チェック

  }

  workCheck(data) {
    var me = this;
    Promise.all([
      data.moldUuid ? Work.workMoldConflictCheck({ moldUuid: data.moldUuid }) : null,//MOLD作業中
      data.moldUuid ? Production.moldConflictCheck({ moldUuid: data.moldUuid }) : null, //MOLD生産中
      data.moldId ? MoldMaster.checkMoldUnderMaintenance(encodeURIComponent(data.moldId)) : null,//MOLDメンテナンス中
      data.machineUuid ? Work.workMachineConflictCheck({ machineUuid: data.machineUuid }) : null,// MAHCINE作業中
      data.machineUuid ? Production.conflictcheck({ machineUuid: data.machineUuid }) : null, // MAHCINE生産中
      data.machineId ? Machine.checkMachineUnderMaintenance(encodeURIComponent(data.machineId)) : null// MAHCINEメンテナンス中
    ]).then((values) => {
      let checkMsg0 = '';
      let checkMsg1 = '';
      let checkMsg3 = '';
      let checkMsg4 = '';
      let checkMsg5 = '';
      let checkMsg6 = '';
      if (values[0] && values[0].hasConflict) {//MOLD作業中
        checkMsg0 = this.state.dict.msg_warning_mold_work_conflict.replace('%mold_name%', data.moldName);
        checkMsg0 = checkMsg0.replace('%person_name%', values[0].moldUserName);
        checkMsg0 += '<br/>' + this.state.dict.work_start_time + ':' + values[0].moldUseStartDatetime.substring(0, values[0].moldUseStartDatetime.length - 3);
      }

      if (values[1] && values[1].hasConflict) {//MOLD生産中
        checkMsg1 = this.state.dict.msg_warning_mold_production_conflict.replace('%mold_name%', data.moldName);
        checkMsg1 += '<br/>' + this.state.dict.work_start_time + ':' + values[1].moldUseStartDatetime.substring(0, values[1].moldUseStartDatetime.length - 3);
      }

      if (values[3] && values[3].hasConflict) {//MACHINE作業中
        checkMsg3 = this.state.dict.msg_warning_machine_work_conflict.replace('%machine_name%', data.machineName);
        checkMsg3 = checkMsg3.replace('%person_name%', values[3].machineUserName);
        checkMsg3 += '<br/>' + this.state.dict.work_start_time + ':' + values[3].machineUseStartDatetime.substring(0, values[3].machineUseStartDatetime.length - 3);
      }

      if (values[4] && values[4].hasConflict) {//MACHINE生産中
        checkMsg4 = this.state.dict.msg_warning_machine_production_conflict.replace('%machine_name%', data.machineName);
        checkMsg4 += '<br/>' + this.state.dict.work_start_time + ':' + values[4].machineUseStartDatetime.substring(0, values[4].machineUseStartDatetime.length - 3);
      }

      if (data.directFlg === 0 && data.componentId !== undefined && data.componentId !== '') {
        checkMsg5 = this.state.dict.msg_warning_indirect_work_with_component;
      }

      // 部品が手配に属するかをチェックする。
      if (this.state.directionId) {
        if (this.state.directionId !== '' && this.state.componentId !== '' && this.state.directionComponentId !== this.state.componentId) {
          checkMsg6 = this.state.componentCode + ',';
        }

        if (this.state.directionId !== '' && this.state.componentArray.length > 0) {
          for (let i = 0; i < this.state.componentArray.length; i++) {
            if (this.state.directionComponentId !== this.state.componentArray[i].componentId) {
              checkMsg6 = checkMsg6 + this.state.componentArray[i].componentCode + ',';
            }
          }
        }

        if (checkMsg6.length > 0) {
          checkMsg6 = this.state.dict.msg_not_belong_direction.replace('%PartCode%', checkMsg6.substring(0, checkMsg6.length - 1));
        }
      }

      this.checkResult = [
        {// 部品が手配に属するかをチェックする。
          result: checkMsg6.length > 0 ? true : false,
          errorMessage: checkMsg6
        },
        {// 間接作業なのに部品コードが選択されている
          result: checkMsg5.length > 0 ? true : false,
          errorMessage: checkMsg5
        },
        {//MOLD作業中
          result: values[0] ? values[0].hasConflict : false,
          errorMessage: checkMsg0
        },
        {//MOLD生産中
          result: values[1] ? values[1].hasConflict : false,
          errorMessage: checkMsg1
        },
        { //MOLDメンテナンス中
          result: values[2] ? values[2].mainteStatus === 1 ? true : false : false,
          errorMessage: this.state.dict.msg_warning_mold_under_maintenance
        },
        { //MACHINE作業中
          result: values[3] ? values[3].hasConflict : false,
          errorMessage: checkMsg3
        },
        {//MACHINE生産中
          result: values[4] ? values[4].hasConflict : false,
          errorMessage: checkMsg4
        },
        {//MACHINEメンテナンス中
          result: values[5] ? values[5].mainteStatus === 1 ? true : false : false,
          errorMessage: this.state.dict.msg_warning_machine_under_maintenance
        }
      ];
      me.showDialog();
    }).catch((err) => {
      var error = err;
      if (error['errorCode'] === 'E201') {
        me.$f7.dialog.alert(error.errorMessage);
      } else {
        me.setState(() => { throw new UnexpectedError(error); });
      }
    });
  }

  showDialog() {
    let me = this;
    let app = me.$f7;
    for (let key in this.checkResult) {
      let value = this.checkResult[key];
      if (value['result']) {
        this.checkResult[key].result = false;
        app.dialog.create({
          title: me.state.dict.application_title,
          text: value['errorMessage'],
          buttons: [{
            text: this.state.dict.cancel,
            onClick: function (dialog) {
              dialog.close();
            }
          }, {
            text: this.state.dict.ok,
            onClick: function () {
              me.showDialog();
            }
          }]
        }).open();
        break;
      }
      if (key === '7') {
        this.openModal();
      }
    }
  }

  registration(data) {
    var me = this;
    //Preloaderを表示
    //登録ボタンを非活性化し二度押しを防止する
    me.$f7.preloader.show();
    Work.register(data).then((R) => {
      //Preloaderを消去
      me.$f7.preloader.hide();
      if (R.errorMessage && R.errorMessage.length > 0) {
        me.$f7.dialog.create({
          title: me.state.dict.application_title,
          text: R.errorMessage,
          buttons: [{
            text: this.state.dict.ok,
            onClick: function () {
              data.isStart = false;
              me.registration(data);
            }
          }, {
            text: this.state.dict.no,
            onClick: function (dialog) {
              dialog.close();
            }
          }
          ]
        }).open();
      }

      me.$f7.dialog.alert(this.state.dict.msg_record_added, function () {
        me.machineReportInfo.reportDate = me.state.workingDate;
        me.onBackClick();
      });

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

  okModal() {
    let data = this.getFormData();
    data.isStart = true;
    let componentArray = this.state.componentArray;
    let componentIds = [];
    for (let key in componentArray) {
      componentIds.push(componentArray[key].componentId);
    }
    data.componentIdArray = componentIds;
    this.registration(data);
  }

  closeModal() {
    this.setState({
      modalIsOpen: false,
      errorisNotLogin: ''
    });
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

  afterOpenModal() {
    var me = this;
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
    const app = this.$f7;
    var today1 = new Date();
    // 作業日と端末の現在時刻をデフォルト表示。
    var today = new Date(this.state.workingDate + ' ' + today1.getHours() + ':' + today1.getMinutes() + ':00');
    this.startTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#work-start-input-page-start-time', {}, today);

    me.setState({
      workStartTime: moment(today).format('YYYY-MM-DDTHH:mm:00')
    });
    //開始登録時の時刻をセット
    var businessStartTime = this.state.businessStartTime;
    if (businessStartTime.length === 0) {
      businessStartTime = '08:00:00';
    } else if (businessStartTime.length === 4) {
      businessStartTime = '0' + businessStartTime + ':00';
    }

    var workStartTime = new Date(moment(this.state.workingDate).format('YYYY-MM-DD ' + businessStartTime));
    var workEndTime = new Date(moment(this.state.workingDate).add(1, 'days').format('YYYY-MM-DD ' + businessStartTime));

    this.startTimePicker.on('change', function (picker, value) {
      let changeWorkStartTime = me.convertDateArrToStr(value) + ':00';
      // 作業日の業務開始時刻より前、業務終了時間より後の値は許容しない。
      let checkDate = new Date(moment(changeWorkStartTime).format('YYYY-MM-DDTHH:mm:00'));
      if (checkDate.getTime() < workStartTime.getTime()) {
        me.setState({
          workStartTime: changeWorkStartTime,
          errorisNotLogin: me.state.dict.msg_error_producint_work_datetime_order
        });
      } else if (checkDate.getTime() > workEndTime.getTime()) {
        me.setState({
          workStartTime: changeWorkStartTime,
          errorisNotLogin: me.state.dict.msg_error_work_datetime_order
        });
      } else {
        me.setState({
          workStartTime: changeWorkStartTime,
          errorisNotLogin: ''
        });
      }

    });

  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  touchChangeTime(arg) {
    if (arg === 'yesterday') {
      this.setState({
        workingDate: moment(new Date(), 'YYYY/MM/DD').subtract(1, 'days').format('YYYY/MM/DD')
      });
    } else if (arg === 'tomorrow') {
      this.setState({
        workingDate: moment(new Date(), 'YYYY/MM/DD').add(1, 'days').format('YYYY/MM/DD')
      });
    } else {
      this.setState({
        workingDate: moment(new Date(), 'YYYY/MM/DD').format('YYYY/MM/DD')
      });
    }
  }

  setWorkPhaseItems() {
    var me = this;
    let oldItemWorkPhases = this.itemWorkPhases;
    let newItemWorkPhases = [];
    //ログインユーザーの所属
    Authentication.whoAmI()
      .then((responseWho) => {
        let loginDepartment = responseWho.department;
        let workCopyInfo = me.props.workCopyInfo;
        if (workCopyInfo.procCd === undefined) {
          this.setState({
            procCd: responseWho.procCd
          });
        }
        //ログインユーザーに所属が定義されているとき、その所属が利用可能な工程のみ表示
        for (let i = 0; i < oldItemWorkPhases.length; i++) {
          if (loginDepartment && loginDepartment !== '' && loginDepartment !== '0') {
            if (oldItemWorkPhases[i].departmentIds.includes(parseInt(loginDepartment))) {
              if (oldItemWorkPhases[i].directFlg === parseInt(this.state.directFlg)) {
                newItemWorkPhases.push(oldItemWorkPhases[i]);
              }
            }
          }
        }

        me.workPhases = newItemWorkPhases;
        me.createPickerWorkPhase(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * ラジオボタン変更時
   * @param {} event 
   */
  radioDirectChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    //クリアボタンでクリアされたら関連づくIDをクリアする
    this.setState({
      workPhaseChoiceSeq: 0,
      workPhaseName: '',
      workCategory: 0,
      workCategoryName: ''
    });
    this.workPhases = [];
    this.setWorkPhaseItems();
  }

  handleComponentClear(index, event) {
    let me = this;
    if (event.target.value === '') {
      let componentArray = me.state.componentArray;

      if (event.target.name.indexOf('componentCode') >= 0) {
        if (componentArray.length > 0) {
          componentArray.splice(index, 1);
          me.setState({
            componentArray: componentArray
          });
        }
      }

    }
  }
  renderRadio(value) {
    return (
      <Block>
        <Radio
          className='no-fastclick'
          checked={parseInt(this.state.directFlg) === value}
          onChange={this.radioDirectChange.bind(this)}
          name="directFlg"
          value={value}
        />
      </Block>
    );
  }
  render() {
    return (
      <DocumentTitle title={this.state.dict.work_start}>
        <Page id="work-start-input-page"
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
          onPageInit={this.onPageInit.bind(this)}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.work_start}</BlockTitle>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.working_date + this.state.required}</Label>
              <Input type="text" name="workingDate"
                readonly
                inputId="work-start-input-page-working-date"
                errorMessage={this.state.msgWorkingDate}
                errorMessageForce={this.state.msgWorkingDate !== ''}
                value={this.state.workingDate} />
            </ListItem>
            <ListItem>
              <Button fill onClick={this.touchChangeTime.bind(this, 'yesterday')}> {this.state.dict.yesterday}</Button>
              <Button fill onClick={this.touchChangeTime.bind(this, 'today')}> {this.state.dict.today}</Button>
              <Button fill onClick={this.touchChangeTime.bind(this, 'tomorrow')}> {this.state.dict.tomorrow}</Button>
            </ListItem>
            <ListItemRow>
              <div>{this.renderRadio(1)}</div>
              <ListItemCell>{this.state.directFlgs.length > 0 ? this.state.directFlgs[1].choice : ''}</ListItemCell>
              <div>{this.renderRadio(0)}</div>
              <ListItemCell>{this.state.directFlgs.length > 0 ? this.state.directFlgs[0].choice : ''} </ListItemCell>
            </ListItemRow> 
            <ListItem >
              <Label>{this.state.dict.work_phase + this.state.required}</Label>
              <Input type="text"
                name="workPhase"
                value={this.state.workPhaseName}
                clearButton
                readonly
                errorMessage={this.state.msgWorkPhase}
                errorMessageForce={this.state.msgWorkPhase !== ''}
                inputId="work-start-input-page-work-phase"
                onInputClear={this.handleClear.bind(this)} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_category}</Label>
              <Input type="text"
                name="workCategory"
                value={this.state.workCategoryName}
                clearButton
                readonly
                disabled={this.state.workPhaseChoiceSeq === undefined ||this.state.workPhaseChoiceSeq === 0}
                inputId="work-start-input-page-work-category"
                onInputClear={this.handleClear.bind(this)} />
            </ListItem>
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.mold_id}</Label>
              <Input type="text" name="moldId"
                value={this.state.moldId}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-start-input-page-mold-id"
                onChange={this.handleChange.bind(this)}
                maxlength={45} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonMoldQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.mold_name}</Label>
              <Input>{this.state.moldName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonMoldSearch.bind(this)}></Button>
              </div>
            </ListItem>

            <ListItem className="custom-list-item" >
              <Label >{this.state.dict.component_code}</Label>
              <Input type="text" name="componentCode"
                value={this.state.componentCode}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-start-input-page-component-code"
                onChange={this.handleChange.bind(this)}
                maxlength={45} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonComponentQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.component_name}</Label>
              <Input>{this.state.componentName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonComponentSearch.bind(this)}></Button>
              </div>
            </ListItem>
          </List>

          {this.state.componentArray.map((item, index) => {
            return <List key={index} noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem >
                <Col width="80">
                  <Label >{this.state.dict.component_code}</Label>
                  <Input type="text" name={'componentCode' + index}
                    value={item.componentCode}
                    clearButton
                    readonly
                    onInputClear={this.handleComponentClear.bind(this, index)}
                    inputId={'work-start-input-page-component-code' + index}
                  />
                </Col>
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.component_name}</Label>
              </ListItem>
              <ListItem>
                <Col width="80">{item.componentName}</Col>
              </ListItem>
            </List>;
          })
          }

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem className="custom-list-item" >

              <Label >{this.state.dict.machine_id}</Label>
              <Input type="text" name="machineId"
                value={this.state.machineId}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-start-input-page-machine-id"
                onChange={this.handleChange.bind(this)} maxlength={45} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonMachineQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.machine_name}</Label>
              <Input>{this.state.machineName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonMachineSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.direction_code}</Label>
              <Input type="text" name="directionCode"
                value={this.state.directionCode}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-start-input-page-direction-code"
                onChange={this.handleChange.bind(this)}
                maxlength={45} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonDirectionCodeQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_proc_cd + this.state.requiredProcessCode}</Label>
              <Input type="text" name="procCd"
                value={this.state.procCd}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                errorMessage={this.state.msgProcCd}
                errorMessageForce={this.state.msgProcCd !== ''}
                onChange={this.handleChange.bind(this)}
                inputId="work-start-input-page-work-proc-cd"
                maxlength={100} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_code}</Label>
              <Input type="text" name="workCode"
                value={this.state.workCode}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                onChange={this.handleChange.bind(this)}
                inputId="work-start-input-page-work-code"
                maxlength={100} />
            </ListItem>
          </List>

          <Block>
            <Row>
              <Col>
                <Button fill text={this.state.dict.record_register} onClick={this.buttonRegistration.bind(this)}></Button>
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
            parentSelector={() => { return document.querySelector('#work-start-input-page'); }}
          >
            <Block className="no-margin-bottom">
              {this.state.dict.msg_confirm_start_work}
            </Block>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.work_start_time}</Label>
                <Input type="text"
                  name="workStartTime"
                  readonly
                  inputId="work-start-input-page-start-time"
                  errorMessage={this.state.errorisNotLogin}
                  errorMessageForce={this.state.errorisNotLogin !== ''} />
              </ListItem>
            </List>

            <Block>
              <Row>
                <Col width="50">
                  <Button fill onClick={this.okModal.bind(this)} disabled={this.state.errorisNotLogin.length > 0}>{this.state.dict.ok}</Button>
                </Col>
                <Col width="50">
                  <Button fill onClick={this.closeModal.bind(this)}>{this.state.dict.cancel}</Button>
                </Col>
              </Row>
            </Block>
          </Modal>
        </Page>
      </DocumentTitle >
    );
  }

}
function mapStateToProps(state) {
  return {
    workCopyInfo: state.core.work.workCopyInfo,
    reportInfo: state.machine.machineReport.reportInfo
  };
}

function mapDispatchToProps(dispatch) {

  return {
    updateMachineReportInfo(value) {
      dispatch(updateMachineReportInfo(value));
    },
    clearWorkCopyInfo(value) {
      dispatch(clearWorkCopyInfo(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkStartInputPage);