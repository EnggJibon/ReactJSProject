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
  CardFooter,
  CardContent,
  Link,
} from 'framework7-react';
import { Dom7 } from 'framework7';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { API_BASE_URL } from 'karte/shared/logics/api-agent';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import Choice from 'karte/shared/master/choice';
import Authentication from 'karte/shared/logics/authentication';
import Issue from 'karte/apps/core/logics/issue';
import moment from 'moment';
import FileUtil from 'karte/shared/logics/fileutil';
import MoldMaster from 'karte/shared/master/mold';
import Machine from 'karte/shared/master/machine';
import Component from 'karte/shared/master/component';
import { connect } from 'react-redux';
import { mainteInputAdd } from 'karte/apps/mold/reducers/mold-maintenance-reducer';
import { mainteInputAddMachine } from 'karte/apps/machine/reducers/machine-maintenance-reducer';
import Procedure from 'karte/shared/master/procedure';

class IssueRegisterPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        issue_input: '',
        registration_date: '',
        machine_id: '',
        machine_name: '',
        mold_id: '',
        mold_name: '',
        mold_after_mainte_total_shot_count: '',
        component_code: '',
        quantity: '',
        mold_mainte_type: '',
        issue_measure_due_date: '',
        issue_measure_status: '',
        issue_measuer_completed_date: '',
        issue_measure_summary: '',
        camera: '',
        delete_record: '',
        issue_taken_date: '',
        registration: '',
        issue_reported_department: '',
        issue_report_phase: '',
        issue_remarks: '',
        issue_report_category1: '',
        issue_report_category2: '',
        issue_report_category3: '',
        issue_memo01: '',
        issue_memo02: '',
        issue_memo03: '',
        issue: '',
        image_file: '',
        close: '',
        record_register: '',
        update: '',
        temporarily_saved: '',
        sp_mold_maintenance: '',
        msg_error_num_over_zero: '',
        msg_confirm_delete: '',
        mst_error_record_not_found: '',
        msg_record_added: '',
        msg_record_updated: '',
        cancel: '',
        ok: '',
        no: '',
        yes: '',
        msg_error_over_length_with_item: '',
        msg_error_not_null: '',
        msg_error_value_invalid: '',
        sp_machine_maintenance: '',
        procedure_code: '',
        lot_number: '',
        issue_happened_at: ''
      },
      required:'',
      result:'',
      menus: [],
      id: '',
      registerDate: moment(new Date()).format('YYYY/MM/DD'),
      machineUuid: '',
      machineId: '',
      machineName: '',
      moldUuid: '',
      moldId: '',
      moldName: '',
      componentId: '',
      componentCode: '',
      componentName: '',
      procedureId: '',
      procedureCode: '',
      procedureName: '',
      procedureCodeName: '',
      lotNumber: '',
      shotCountAtIssue: '',
      errorMessageShotCountAtIssue: '',
      quantity: '',
      errorMessageQuantity: '',
      reportDepartment: '',
      reportDepartmentName: '',
      reportPhase: '',
      reportPhaseText: '',
      reportCategory1: '',
      reportCategory1Text: '',
      reportCategory2: '',
      reportCategory2Text: '',
      reportCategory3: '',
      reportCategory3Text: '',
      memo01: '',
      memo02: '',
      memo03: '',
      mainteType: '',
      mainteTypeText: '',
      measureDueDate: '',
      errorMessageMeasureDueDate: '',
      measureStatus: '0',// 初期値は対策ステータスの未対応（連番0）を表示する
      measureStatusText: '',
      measuerCompletedDate: '',
      issue: '',
      measureSummary: '',
      tblIssueImageFileVoList: [],
      editImgIndex: null,
      copy: false,
      happenedAt: moment(new Date()).format('YYYY/MM/DD HH:mm')
    };
    this.departments = [];
    this.reportPhases = [];
    this.reportCategory1s = [];
    this.reportCategory2s = [];
    this.reportCategory3s = [];
    this.mainteTypes = [];
    this.measureStatuss = [];
    this.measureStatusObject = {};
    this.loadDetail();
    this.image = document.createElement('img');
    this.machineNames = [];
    this.checkMachineNams = [];
    this.procedures = [];
    this.productionLots = [];
  }

  componentDidMount() {
    var me = this;
    const app = me.$f7;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.loadMeasureStatus();
        me.loadMainteType();

        //作成したオブジェクトはページ終了処理で廃棄(destroy)する
        me.registerDateCalendar = app.calendar.create(
          CalendarUtil.getCalendarProperties('#issue-register-page-register-date', {
            change: function (calendar, value) {
              me.setState({
                registerDate: moment(new Date(value)).format('YYYY/MM/DD')
              });
            }
          }));
        me.measureDueDateCalendar = app.calendar.create(
          CalendarUtil.getCalendarProperties('#issue-register-page-measure-due-date', {
            change: function (calendar, value) {
              me.setState({
                measureDueDate: moment(new Date(value)).format('YYYY/MM/DD')
              });
              me.setState({ errorMessageMeasureDueDate: '' });
            }
          }));
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    Dom7('#issue-register-page-after-mainte-shot-count').on('keydown', this.handleKeyPress);
    Dom7('#issue-register-page-issue-count').on('keydown', this.handleKeyPress);
  }

  componentWillUmount() {
    Dom7('#issue-register-page-after-mainte-shot-count').off('keydown', this.handleKeyPress);
    Dom7('#issue-register-page-issue-count').off('keydown', this.handleKeyPress);
  }

  handleKeyPress(event) {
    const invalidChars = ['+', 'e', '.', 'E'];
    if (invalidChars.indexOf(event.key) !== -1) {
      event.preventDefault();
    }
  }
  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    let issueId = me.$f7route.query.id;
    //ログインユーザーの所属、所属選択肢読み込み、所属Picker作成。
    Promise.all([Authentication.whoAmI(),
      !issueId ? Choice.categories('mst_user.department', {}) : null
    ])
      .then((values) => {
        let responseWho = values[0];
        let responseChoice = values[1];
        if (!issueId) {
          me.department = responseWho.department;
          me.departments = [...responseChoice.mstChoiceVo];
          me.createPickerDepartment(true);
          me.setHappenPickerDefault();
        }

        //me.loadMachineNams();
        me.createMachineAutocomplete();
        me.createMoldAutocomplete();
        me.createComponentAutocomplete();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  loadDetail() {
    let me = this;
    const app = me.$f7;
    let issueId = me.$f7route.query.id;
    if (!issueId || issueId === 'date') {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-register', { reloadAll: true });
      return;
    }
    let copy = me.$f7route.query.copy === '1';
    Issue.getIssue(issueId)
      .then((response) => {
        let info = response.tblIssueVoList[0];
        let detail = {
          id: issueId,
          registerDate: info.reportDate && info.reportDate.length > 0 ? moment(new Date(info.reportDate)).format('YYYY/MM/DD') : '',
          machineUuid: info.machineUuid,
          machineId: info.machineId,
          machineName: info.machineName,
          moldUuid: info.moldUuid,
          moldId: info.moldId,
          moldName: info.moldName,
          componentId: info.componentId,
          componentCode: info.componentCode,
          componentName: info.componentName,
          procedureId: info.procedureId,
          procedureCode: info.procedureCode,
          procedureName: info.procedureName,
          procedureCodeName: info.procedureCode + ' ' + info.procedureName,
          lotNumber: info.lotNumber,
          shotCountAtIssue: info.shotCountAtIssue,
          quantity: info.quantity,
          reportDepartment: info.reportDepartment,
          //reportDepartmentName: info.reportDepartmentName,
          reportPhase: info.reportPhase,
          //reportPhaseText: info.reportPhaseText,
          reportCategory1: info.reportCategory1,
          //reportCategory1Text: info.reportCategory1Text,
          reportCategory2: info.reportCategory2,
          //reportCategory2Text: info.reportCategory2Text,
          reportCategory3: info.reportCategory3,
          //reportCategory3Text: info.reportCategory3Text,
          memo01: info.memo01,
          memo02: info.memo02,
          memo03: info.memo03,
          mainteType: info.mainteType,
          // mainteTypeText: info.mainteTypeText,
          measureDueDate: info.measureDueDate && info.measureDueDate.length > 0 ? moment(new Date(info.measureDueDate)).format('YYYY/MM/DD') : '',
          measureStatus: info.measureStatus,
          // measureStatusText: this.measureStatusObject[info.measureStatusText],
          measuerCompletedDate: info.measuerCompletedDate && info.measuerCompletedDate.length > 0 ? moment(new Date(info.measuerCompletedDate)).format('YYYY/MM/DD') : '',
          issue: info.issue,
          measureSummary: info.measureSummary,
          tblIssueImageFileVoList: [],//info.tblIssueImageFileVoList ? info.tblIssueImageFileVoList : []
          happenedAt: moment(info.happenedAt).format('YYYY/MM/DD HH:mm')
        };
        
        this.setState({ ...detail });
        
        me.happenedAtPicker = CalendarUtil.createDateTimePicker(app, me.state.dict.close, '#issue-register-happened-at', {}, new Date(me.state.happenedAt));
        
        me.happenedAtPicker.on('change', function (picker, value) {
          let happenedAtVal = me.convertDateArrToStr(value) + ':00';
          me.setState({
            happenedAt: moment(new Date(happenedAtVal)).format('YYYY/MM/DD HH:mm')
          });
        });

        if (copy) {
          //コピーのときは取得したデータをもとに新規登録
          me.prepareForCopy(detail);
        }
        else {
          this.setState({ ...detail });
          if (info.tblIssueImageFileVoList) {
            for (let key in info.tblIssueImageFileVoList) {
              let value = info.tblIssueImageFileVoList[key];
              this.imgLoad(API_BASE_URL + 'files/downloadImageVideo/image/' + value.fileUuid).then((response) => {
                info.tblIssueImageFileVoList[key]['src'] = response.src;
                info.tblIssueImageFileVoList[key]['file'] = response.blob;
                detail.tblIssueImageFileVoList = info.tblIssueImageFileVoList;
                this.setState({ ...detail });
              }).catch(() => {
                info.tblIssueImageFileVoList[key]['src'] = '';
                info.tblIssueImageFileVoList[key]['file'] = '';
                info.tblIssueImageFileVoList[key]['notFound'] = '1';
                detail.tblIssueImageFileVoList = info.tblIssueImageFileVoList;
                this.setState({ ...detail });
              });
            }
          }
          // 所属Picker作成。
          Choice.categories('mst_user.department', {})
            .then((responseChoice) => {
              me.departments = [...responseChoice.mstChoiceVo];
              me.createPickerDepartment(true);
            })
            .catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });

          //部品工程番号
          me.loadProcedure(detail);
        }
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  setHappenPickerDefault(){
    var me = this;
    const app = me.$f7;
    me.happenedAtPicker = CalendarUtil.createDateTimePicker(app, me.state.dict.close, '#issue-register-happened-at', {}, new Date());
    me.happenedAtPicker.on('change', function (picker, value) {
      let happenedAtVal = me.convertDateArrToStr(value) + ':00';
      me.setState({
        happenedAt: moment(new Date(happenedAtVal)).format('YYYY/MM/DD HH:mm')
      });
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

  /**
   * コピー登録のために既存のデータを修正する
   * @param {} detail 
   */
  prepareForCopy(detail) {
    let me = this;
    const app = me.$f7;
    //新規登録用に初期化
    detail.id = '';
    detail.registerDate = moment(new Date()).format('YYYY/MM/DD');  //日付
    detail.quantity = 0;        //数量
    detail.measureStatus = '0'; // 対策ステータスの未対応（連番0）に初期化
    //detail.measureStatusText = '';  //対策ステータス文言
    detail.measureDueDate = ''; //対策期限
    detail.measuerCompletedDate = ''; //対策完了日
    detail.measureSummary = ''; //対策内容
    detail.copy = true;
    //金型のショット数は取り直す
    if(detail.happenedAt && detail.happenedAt !== ''){
      me.happenedAtPicker = CalendarUtil.createDateTimePicker(app, me.state.dict.close, '#issue-register-happened-at', {}, new Date(detail.happenedAt));
    } else {
      me.happenedAtPicker = CalendarUtil.createDateTimePicker(app, me.state.dict.close, '#issue-register-happened-at', {}, new Date());
    }
    if (detail.moldId && detail.moldId !== '') {
      MoldMaster.getMoldDetail({
        moldId: detail.moldId
      }).then((response) => {
        detail.shotCountAtIssue = response.afterMainteTotalShotCount;
        me.setState({ ...detail });
      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    } else {
      me.setState({ ...detail });
    }
    // 所属Picker作成。
    Choice.categories('mst_user.department', {})
      .then((responseChoice) => {
        me.departments = [...responseChoice.mstChoiceVo];
        me.createPickerDepartment(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

  }

  imgLoad(imgUrl) {
    return new Promise((resolve, reject) => {
      FileUtil.download(imgUrl).then((response) => {
        var blob = response;
        let oFileReader = new FileReader();
        oFileReader.onloadend = function (e) {
          let base64 = e.target.result;
          resolve({ src: base64, blob: blob });
        };
        oFileReader.readAsDataURL(blob);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  /**
   * 発生場所Picker作成
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
      if (me.department === department.seq) {
        defaultValue = me.department;
        defaultName = department.choice;
      }
      if (parseInt(me.state.reportDepartment) === parseInt(department.seq)) {
        defaultValue = department.seq;
        defaultName = department.choice;
      }
    }
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    if (_displayValues.length > 0) {
      me.pickerDepartment = me.createPicker('#issue-register-page-report-department', _values, _displayValues,
        //Col Change Callback
        (picker, value, displayValue) => {
          this.changeClearPickerItems('reportDepartment');
          const oldReportDepartment = me.state.reportDepartment;
          me.setState({ reportDepartment: value });
          me.setState({ reportDepartmentName: displayValue });
          //所在地が変わったら傘下の設置場所を読み込む
          if (oldReportDepartment !== value) {
            me.loadReportPhase();
          }
          if (value !== '') {
            me.setState({ errorMessageLocation: '' });
          }
        }
      );
    }
    if (setDefault && defaultValue !== null) {
      me.pickerDepartment.setValue([defaultValue], 0);
      me.setState({ reportDepartment: defaultValue });
      me.setState({ reportDepartmentName: defaultName });
      me.loadReportPhase();
    }
  }
  /**
   * 不具合工程読み込み
   */
  loadReportPhase() {
    var me = this;
    var selectedReportDepartment = me.state.reportDepartment;
    var reportDepartment = me.departments.find((reportDepartment) => { return (reportDepartment.seq === selectedReportDepartment); });
    if (reportDepartment) {
      Choice.categories('tbl_issue.report_phase', { parentSeq: reportDepartment.seq })
        .then((response) => {
          me.reportPhases = [...response.mstChoiceVo];
          me.createPickerReportPhase(true);
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }
  /**
  * 不具合工程Picker作成
  */
  createPickerReportPhase(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;

    for (var i = 0; i < me.reportPhases.length; i++) {
      let reportPhases = me.reportPhases[i];
      _values.push(reportPhases.seq);
      _displayValues.push(reportPhases.choice);

      if (parseInt(me.state.reportPhase) === parseInt(reportPhases.seq)) {
        defaultValue = reportPhases.seq;
        defaultName = reportPhases.choice;
      }
    }
    me.setState({ reportPhase: '' });
    me.setState({ reportPhaseText: '' });
    if (me.pickerReportPhase) {
      me.pickerReportPhase.destroy();
    }
    if (_displayValues.length > 0) {
      me.pickerReportPhase = me.createPicker('#issue-register-page-report-phase', _values, _displayValues,
        //Col Change Callback
        (picker, value, displayValue) => {
          this.changeClearPickerItems('reportPhase');
          const oldReportPhase = me.state.reportPhase;
          me.setState({ reportPhase: value });
          me.setState({ reportPhaseText: displayValue });
          //不具合工程が変わったら傘下の設置場所を読み込む
          if (oldReportPhase !== value) {
            me.loadReportCategory1();
          }
        }
      );
    }
    if (setDefault && defaultValue !== null) {
      me.pickerReportPhase.setValue([defaultValue], 0);
      me.setState({ reportPhase: defaultValue });
      me.setState({ reportPhaseText: defaultName });
      me.loadReportCategory1();
    }
  }
  /**
   * 不具合大分類読み込み
   */
  loadReportCategory1() {
    var me = this;
    var selectedReportPhase = me.state.reportPhase;
    var reportPhases = me.reportPhases.find((reportPhases) => { return (reportPhases.seq === selectedReportPhase); });
    if (reportPhases) {
      Choice.categories('tbl_issue.report_category1', { parentSeq: reportPhases.seq })
        .then((response) => {
          me.reportCategory1s = [...response.mstChoiceVo];
          me.createPickerReportCategory1(true);
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  /**
   * 不具合中分類Picker作成
   */
  createPickerReportCategory1(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.reportCategory1s.length; i++) {
      let reportCategory1s = me.reportCategory1s[i];
      _values.push(reportCategory1s.seq);
      _displayValues.push(reportCategory1s.choice);
      if (parseInt(me.state.reportCategory1) === parseInt(reportCategory1s.seq)) {
        defaultValue = reportCategory1s.seq;
        defaultName = reportCategory1s.choice;
      }
    }
    me.setState({ reportCategory1: '' });
    me.setState({ reportCategory1Text: '' });
    if (me.pickerReportCategory1) {
      me.pickerReportCategory1.destroy();
    }
    if (_displayValues.length > 0) {
      me.pickerReportCategory1 = me.createPicker('#issue-register-page-report-category1', _values, _displayValues,
        //Col Change Callback
        (picker, value, displayValue) => {
          this.changeClearPickerItems('reportCategory1');
          const oldReportCategory1 = me.state.reportCategory1;
          me.setState({ reportCategory1: value });
          me.setState({ reportCategory1Text: displayValue });
          //不具合中分類が変わったら傘下の設置場所を読み込む
          if (oldReportCategory1 !== value) {
            me.loadReportcategory2();
          }
        }
      );
    }
    if (setDefault && defaultValue !== null) {
      me.pickerReportCategory1.setValue([defaultValue], 0);
      me.setState({ reportCategory1: defaultValue });
      me.setState({ reportCategory1Text: defaultName });
      me.loadReportcategory2();
    }
  }


  /**
   * 不具合中分類読み込み
   */
  loadReportcategory2() {
    var me = this;
    var selectedCategory1 = me.state.reportCategory1;
    var reportCategory1 = me.reportCategory1s.find((reportCategory1s) => { return (reportCategory1s.seq === selectedCategory1); });
    if (reportCategory1) {
      Choice.categories('tbl_issue.report_category2', { parentSeq: reportCategory1.seq })
        .then((response) => {
          me.reportCategory2s = [...response.mstChoiceVo];
          me.createPickerReportCategory2(true);
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  /**
   * 不具合中分類Picker作成
   */
  createPickerReportCategory2(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.reportCategory2s.length; i++) {
      let reportCategory2s = me.reportCategory2s[i];
      _values.push(reportCategory2s.seq);
      _displayValues.push(reportCategory2s.choice);
      if (parseInt(me.state.reportCategory2) === parseInt(reportCategory2s.seq)) {
        defaultValue = reportCategory2s.seq;
        defaultName = reportCategory2s.choice;
      }
    }
    me.setState({ reportCategory2: '' });
    me.setState({ reportCategory2Text: '' });
    if (me.pickerReportCategory2) {
      me.pickerReportCategory2.destroy();
    }
    if (_displayValues.length > 0) {
      me.pickerReportCategory2 = me.createPicker('#issue-register-page-report-category2', _values, _displayValues,
        //Col Change Callback
        (picker, value, displayValue) => {
          this.changeClearPickerItems('reportCategory2');
          const oldReportCategory2 = me.state.reportCategory2;
          me.setState({ reportCategory2: value });
          me.setState({ reportCategory2Text: displayValue });
          if (oldReportCategory2 !== value) {
            me.loadReportcategory3();
          }
        }
      );
    }
    if (setDefault && defaultValue !== null) {
      me.pickerReportCategory2.setValue([defaultValue], 0);
      me.setState({ reportCategory2: defaultValue });
      me.setState({ reportCategory2Text: defaultName });
      me.loadReportcategory3();
    }
  }


  /**
   * 不具合小分類読み込み
   */
  loadReportcategory3() {
    var me = this;
    var selectedCategory2 = me.state.reportCategory2;
    var reportCategory2 = me.reportCategory2s.find((reportCategory2s) => { return (reportCategory2s.seq === selectedCategory2); });
    if (reportCategory2) {
      Choice.categories('tbl_issue.report_category3', { parentSeq: reportCategory2.seq })
        .then((response) => {
          me.reportCategory3s = [...response.mstChoiceVo];
          me.createPickerReportCategory3(true);
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }
  /**
   * 不具合小分類Picker作成
   */
  createPickerReportCategory3(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.reportCategory3s.length; i++) {
      let reportCategory3 = me.reportCategory3s[i];
      _values.push(reportCategory3.seq);
      _displayValues.push(reportCategory3.choice);
      if (parseInt(me.state.reportCategory3) === parseInt(reportCategory3.seq)) {
        defaultValue = reportCategory3.seq;
        defaultName = reportCategory3.choice;
      }
    }
    me.setState({ reportCategory3: '' });
    me.setState({ reportCategory3Text: '' });
    if (me.pickerReportCategory3) {
      me.pickerReportCategory3.destroy();
    }
    if (_displayValues.length > 0) {
      me.pickerReportCategory3 = me.createPicker('#issue-register-page-report-category3', _values, _displayValues,
        //Col Change Callback
        (picker, value, displayValue) => {
          this.changeClearPickerItems('reportCategory3');
          me.setState({ reportCategory3: value });
          me.setState({ reportCategory3Text: displayValue });
        }
      );
    }
    if (setDefault && defaultValue !== null) {
      me.pickerReportCategory3.setValue([defaultValue], 0);
      me.setState({ reportCategory3: defaultValue });
      me.setState({ reportCategory3Text: defaultName });
    }
  }

  /**
   * メンテナンス分類読み込み
   */
  loadMainteType() {
    var me = this;
    Choice.categories('tbl_mold_maintenance_remodeling.mainte_type', {})
      .then((response) => {
        me.mainteTypes = [...response.mstChoiceVo];
        me.createPickerMainteTypes(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }
  /**
   * メンテナンス分類Picker作成
   */
  createPickerMainteTypes(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.mainteTypes.length; i++) {
      let mainteTypes = me.mainteTypes[i];
      _values.push(mainteTypes.seq);
      _displayValues.push(mainteTypes.choice);
      if (parseInt(me.state.mainteType) === parseInt(mainteTypes.seq)) {
        defaultValue = mainteTypes.seq;
        defaultName = mainteTypes.choice;
      }
    }
    me.setState({ mainteType: '' });
    me.setState({ mainteTypeText: '' });
    if (me.pickerMainteTypes) {
      me.pickerMainteTypes.destroy();
    }
    me.pickerMainteTypes = me.createPicker('#issue-register-page-mainte-type', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ mainteType: value });
        me.setState({ mainteTypeText: displayValue });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMainteTypes.setValue([defaultValue], 0);
      me.setState({ mainteType: defaultValue });
      me.setState({ mainteTypeText: defaultName });
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
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.measureStatuss.length; i++) {
      let measureStatuss = me.measureStatuss[i];
      _values.push(measureStatuss.seq);
      _displayValues.push(measureStatuss.choice);
      this.measureStatusObject[measureStatuss.seq] = measureStatuss.choice;
      if (parseInt(me.state.measureStatus) === parseInt(measureStatuss.seq)) {
        defaultValue = measureStatuss.seq;
        defaultName = measureStatuss.choice;
      }
    }
    me.setState({ measureStatus: '' });
    me.setState({ measureStatusText: '' });
    if (me.pickerMeasureStatus) {
      me.pickerMeasureStatus.destroy();
    }
    me.pickerMeasureStatus = me.createPicker('#issue-register-page-measure-status', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ measureStatus: value });
        me.setState({ measureStatusText: displayValue });
        let status = ['20', '30', '50'];
        if (status.includes(value)) {
          me.setState({ measuerCompletedDate: moment(new Date()).format('YYYY/MM/DD') });
        } else {
          me.setState({ measuerCompletedDate: '' });
        }
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

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
    var me = this;
    if (me.registerDateCalendar) {
      me.registerDateCalendar.destroy();
    }
    if (me.measureDueDateCalendar) {
      me.measureDueDateCalendar.destroy();
    }
    if (me.happenedAtCalendar) {
      me.happenAtCalendar.destroy();
    }
  }

  /**
   * 戻る
   */
  onBackClick() {
    //編集モードのときは不具合一覧に戻ること
    if (this.$f7route.query.id) {
      this.$f7router.back();
      //this.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-list', { pushState: true });
    } else {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-sub-menu', { pushState: true });
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
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', { props: { onQrRead: this.onComponentQrRead.bind(this) } });
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
          response.mstComponents[0].componentId = response.mstComponents[0].id;
          this.loadMoldForComponent(response.mstComponents[0]);
          this.loadProcedure(response.mstComponents[0]);
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
      inputEl: '#issue-register-page-machine-id',
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
            //me.createPickerMachineName(true, item.machineId);
          }
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
            machineUuid: response.mstMachineAutoComplete[0].machineUuid,
            machineId: response.mstMachineAutoComplete[0].machineId,
            machineName: response.mstMachineAutoComplete[0].machineName,
          };
          this.setState(item);
          if (this.checkMachineNams.indexOf(item.machineId) < 0) {
            this.checkMachineNams.push(item.machineId);
            this.machineNames.push(item);
            //this.createPickerMachineName(true, item.machineId);
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
        //me.createPickerMachineName(true, null);
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

  createPickerMachineName(setDefault, value) {
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
      if (value === machine.machineId || me.state.machineId === machine.machineId) {
        defaultValue = machine.machineId;
        defaultName = machine.machineName;
        defaultUuid = machine.machineUuid;
      }
    }
    if (me.pickerMachineName) {
      me.pickerMachineName.destroy();
    }
    me.pickerMachineName = me.createPicker('#issue-register-page-machine-name', _values, _displayValues,
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
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch', { props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }

  /**
   * 金型検索ボタン
   */
  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', { props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
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
    var me = this;
    MoldMaster.getMoldDetail({
      moldId: moldId
    }).then((response) => {
      me.setState({
        shotCountAtIssue: response.afterMainteTotalShotCount
      });
      if (response.mstMoldComponentRelationVo.length > 0) {
        if (response.mstMoldComponentRelationVo.length === 1) {
          let item = {
            componentCode: response.mstMoldComponentRelationVo[0].componentCode,
            componentId: response.mstMoldComponentRelationVo[0].componentId,
            componentName: response.mstMoldComponentRelationVo[0].componentName,
          };
          me.setState(item,()=>{
            me.loadProcedure(item);
          });
        } else {
          let data = response.mstMoldComponentRelationVo;
          var timeInterval = setInterval(() => {  
            if(me.$f7router.allowPageChange){  
              clearInterval(timeInterval);      
              me.$f7router.navigate(APP_DIR_PATH + '/singlecomponent', { props: { data: data, onComplete: me.onSingleComponentComplete.bind(me) } });
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
    let data = {
      componentCode: item.componentCode,
      componentId: item.componentId,
      componentName: item.componentName,
    };
    this.setState(data,()=>{
      this.loadProcedure(data);
    });
  }
  /**
   * 金型ID
   */
  createMoldAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#issue-register-page-mold-id',
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
        MoldMaster.getMoldLikeWithoutDispose({
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

  /**
   * 出荷情報の部品コード
   */
  createComponentAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#issue-register-page-component-code',
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
      },
      on: {
        change: function (value) {
          let item = {
            componentId: value[0].id,
            componentCode: value[0].componentCode,
            componentName: value[0].componentName,
          };
          me.setState(item);
          me.loadMoldForComponent(item);
          me.loadProcedure(item);
        },
        closed: function (autocomplete) {
          if (me.state.componentName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              componentCode: '',
              componentName: '',
              componentId: ''
            });
          }
        }
      },
    });
  }
  /**
   * 部品検索ボタン
   */
  buttonComponentSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/componentSearch', { props: { onSelectedCell: this.onComponentSelectedCell.bind(this) } });
  }

  onComponentSelectedCell(item) {
    let data = {
      componentCode: item.componentCode,
      componentId: item.id,
      componentName: item.componentName,
    };
    this.setState(data);
    this.loadMoldForComponent(data);
    this.loadProcedure(data);
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
            shotCountAtIssue: data.mstMold.afterMainteTotalShotCount,
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
              me.$f7router.navigate(APP_DIR_PATH + '/singlemold', { props: { data: molds, onComplete: me.onSingleMoldComplete.bind(me) } });
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
      shotCountAtIssue: item.afterMainteTotalShotCount,
      moldId: item.moldId,
      moldName: item.moldName,
      moldUuid: item.uuid,
    });
  }

  //部品工程番号
  loadProcedure(item) {
    if (item.componentId === undefined || item.componentId === null || item.componentId.trim() === '') return;
    let me = this;
    Procedure.getProcedureForComponent(item.componentId)
      .then((response) => {
        me.procedures = response.mstProcedures;
        me.createPickerProcedure(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }
  /**
   * 部品工程番号
   * @param {*} setDefault 
   */
  createPickerProcedure(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.procedures.length; i++) {
      let procedure = me.procedures[i];
      _values.push(procedure.id);
      let codeName = procedure.procedureCode + ' ' + procedure.procedureName;
      _displayValues.push(codeName);
      if (me.state.procedureId === procedure.id) {
        defaultValue = procedure.id;
        defaultName = codeName;
      }
    }
    if (me.pickerProcedures !== undefined) {
      me.pickerProcedures.destroy();
    }

    let pickerProcedure = this.createPicker('#issue-register-page-procedure-code', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        let codeName = displayValue;
        codeName = codeName.split(' ');
        // if (value !== '') {
        //   me.state.errorMessageProcedureId = '';
        // }
        let prevProcedureId = _values[parseInt(_values.indexOf(value)) - 1];
        if (prevProcedureId !== '' && prevProcedureId !== undefined) {
          me.loadProductionLot(me.state.componentId, prevProcedureId);
        } else {
          if (me.pickerProductionLots !== undefined) {
            me.pickerProductionLots.destroy();
          }
        }
        me.setState({
          procedureId: value,
          procedureCodeName: displayValue,
          procedureCode: codeName[0],
          procedureName: codeName[1],
        });
      }
    );
    me.pickerProcedures = pickerProcedure;
    if (setDefault && defaultValue !== null) {
      pickerProcedure.setValue([defaultValue], 0);
      let codeName = defaultName;
      codeName = codeName.split(' ');
      let prevProcedureId = _values[parseInt(_values.indexOf(defaultValue)) - 1];
      if (prevProcedureId !== '' && prevProcedureId !== undefined) {
        me.loadProductionLot(me.state.componentId, prevProcedureId);
      }
      me.setState({
        procedureId: defaultValue,
        procedureCodeName: defaultName,
        procedureCode: codeName[0],
        procedureName: codeName[1],
      });
    }
  }

  //ロット番号
  loadProductionLot(componentId, prevProcedureId) {
    let registerDate = this.state.registerDate;
    let me = this;
    Procedure.getProductionLotList({
      componentId: componentId,
      prevProcedureId: prevProcedureId,
      productionDate: registerDate
    }).then((response) => {
      me.productionLots = response.productions || [];
      if (me.productionLots.length > 0) me.createPickerLotNumber(true);
    }).catch((err) => {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }
  /**
   * ロット番号
   * @param {*} setDefault 
   */
  createPickerLotNumber(setDefault) {
    var me = this;
    var _values = [''];
    var _displayValues = [''];
    var defaultValue = null;
    for (var i = 0; i < me.productionLots.length; i++) {
      let productionLot = me.productionLots[i];
      let codeName = productionLot.lotNumber;
      _values.push(codeName);
      _displayValues.push(codeName);
      if (me.state.lotNumber === productionLot.LotNumber) {
        defaultValue = codeName;
      }
    }
    if (me.pickerProductionLots !== undefined) {
      me.pickerProductionLots.destroy();
    }
    let pickerProductionLot = this.createPicker('#issue-register-page-lot-number', _values, _displayValues,
      //Col Change Callback
      (picker, value) => {
        document.getElementById('issue-register-page-lot-number').readOnly = false;
        picker.inputEl.readonly = false;
        me.setState({
          lotNumber: value
        });
      }
    );
    document.getElementById('issue-register-page-lot-number').readOnly = false;
    me.pickerProductionLots = pickerProductionLot;
    if (setDefault && defaultValue !== null) {
      pickerProductionLot.setValue([defaultValue], 0);
      me.setState({
        lotNumber: defaultValue
      });
    }
  }

  /**
   * カメラフォームボタン
   */
  buttonCameraForm() {
    this.$f7router.navigate(APP_DIR_PATH + '/imgcap', { props: { onCapture: this.onImgCapture.bind(this) } });
  }

  onImgCapture(captured) {
    let me = this;
    let type = captured.blob.type;
    let fileExtension = '.jpg';
    if (type.indexOf('png') >= 0) {
      fileExtension = '.png';
    }
    if (type.indexOf('gif') >= 0) {
      fileExtension = '.gif';
    }
    let tblIssueImageFileVoList = this.state.tblIssueImageFileVoList;
    let seq = tblIssueImageFileVoList.length + 1;
    let src = captured.dataUrl;
    var fileOfBlob = new File([captured.blob], new Date().getTime() + fileExtension);
    tblIssueImageFileVoList.push({
      fileUuid: null,
      fileExtension: fileExtension,
      fileType: 1,
      issueId: me.$f7route.query.id,
      remarks: '',
      seq: seq,
      src: src,
      file: fileOfBlob,
      takenDate: moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
    });
    me.setState({
      tblIssueImageFileVoList: tblIssueImageFileVoList
    });
  }
  /**
   * ファイル選択ボタン
   */
  buttonFileSelect(event) {
    let me = this;
    let files = event.target.files || [];
    if (files.length <= 0) return;
    let file = files[0];
    let type = file.type;
    let fileExtension = '.jpg';
    if (type.indexOf('png') >= 0) {
      fileExtension = '.png';
    }
    if (type.indexOf('gif') >= 0) {
      fileExtension = '.gif';
    }

    let tblIssueImageFileVoList = this.state.tblIssueImageFileVoList;
    let seq = tblIssueImageFileVoList.length + 1;
    if (tblIssueImageFileVoList.length === 0) {
      seq = 0;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      let src = e.target.result;
      FileUtil.shrinkImg(src, 750, 1000).then(shrinked => {
        tblIssueImageFileVoList.push({
          fileUuid: null,
          fileExtension: fileExtension,
          fileType: 1,
          issueId: me.$f7route.query.id,
          remarks: '',
          seq: seq,
          src: shrinked.dataUrl,
          file: new File([shrinked.blob], new Date().getTime() + fileExtension),
          takenDate: moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
        });
        me.setState({
          tblIssueImageFileVoList: tblIssueImageFileVoList
        });
        let fileInput = document.getElementById('issue-register-page-photos').childNodes;
        fileInput[0].value = '';
      });
    };
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
      //this.createPickerMachineName(false, null);
    }
    if (event.target.value !== '') {
      let name = event.target.name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.setState({ ['errorMessage' + name]: '' });
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
      Dom7('#issue-register-page-mold-id').blur();
    }
    if (event.target.name === 'machineId') {
      this.setState({
        machineName: '',
        machineUuid: ''
      });
      //this.createPickerMachineName(false, null);
      Dom7('#issue-register-page-machine-id').blur();
    }
    if (event.target.name === 'machineName') {
      this.setState({
        machineId: '',
        machineUuid: ''
      });
    }
    if (event.target.name === 'componentCode') {
      this.setState({
        componentId: '',
        componentName: '',
        procedureId: '',
        procedureCode: '',
        procedureName: '',
        procedureCodeName: '',
        lotNumber: ''
      });
      if (this.pickerProcedures !== undefined) {
        this.pickerProcedures.destroy();
      }
      if (this.pickerProductionLots !== undefined) {
        this.pickerProductionLots.destroy();
      }
      Dom7('#issue-register-page-component-code').blur();
    }
    if (event.target.name === 'procedureCode') {
      this.setState({
        procedureId: '',
        procedureCode: '',
        procedureName: '',
        procedureCodeName: '',
        lotNumber: ''
      });
      this.createPickerProcedure(false);
      if (this.pickerProductionLots !== undefined) {
        this.pickerProductionLots.destroy();
      }
    }
    //IDに対応する名称、下位のState値、Pickerのアイテムをクリア
    this.clearPickerItems();
  }

  /**
   * Pickerアイテムのクリア
   */
  clearPickerItems() {
    if (this.state.reportDepartment === '') {
      this.setState({ reportDepartmentName: '' });
      this.setState({ reportPhase: '' });
      this.setState({ reportPhaseText: '' });
      this.setState({ reportCategory1: '' });
      this.setState({ reportCategory1Text: '' });
      this.setState({ reportCategory2: '' });
      this.setState({ reportCategory2Text: '' });
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
      //クリアボタンで消去されると次に開いたときPickerの変更イベントが起きないので再作成する
      this.createPickerDepartment(false);
    }
    if (this.state.reportPhase === '') {
      this.setState({ reportPhaseText: '' });
      this.setState({ reportCategory1: '' });
      this.setState({ reportCategory1Text: '' });
      this.setState({ reportCategory2: '' });
      this.setState({ reportCategory2Text: '' });
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
      this.createPickerReportPhase(false);
    }
    if (this.state.reportCategory1 === '') {
      this.setState({ reportCategory1Text: '' });
      this.setState({ reportCategory2: '' });
      this.setState({ reportCategory2Text: '' });
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
      this.createPickerReportCategory1(false);
    }
    if (this.state.reportCategory2 === '') {
      this.setState({ reportCategory2Text: '' });
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
      this.createPickerReportCategory2(false);
    }
    if (this.state.reportCategory3 === '') {
      this.setState({ reportCategory3Text: '' });
      this.createPickerReportCategory3(false);
    }
    if (this.state.measureStatus === '') {
      this.setState({ measureStatusText: '' });
      this.createPickerMeasureStatus(false);
    }
    if (this.state.mainteType === '') {
      this.setState({ mainteTypeText: '' });
      this.createPickerMainteTypes(false);
    }
  }

  changeClearPickerItems(item) {
    if (item === 'reportDepartment') {
      this.setState({ reportPhase: '' });
      this.setState({ reportPhaseText: '' });
      this.setState({ reportCategory1: '' });
      this.setState({ reportCategory1Text: '' });
      this.setState({ reportCategory2: '' });
      this.setState({ reportCategory2Text: '' });
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
    }
    if (item === 'reportPhase') {
      this.setState({ reportCategory1: '' });
      this.setState({ reportCategory1Text: '' });
      this.setState({ reportCategory2: '' });
      this.setState({ reportCategory2Text: '' });
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
    }
    if (item === 'reportCategory1') {
      this.setState({ reportCategory2: '' });
      this.setState({ reportCategory2Text: '' });
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
    }
    if (item === 'reportCategory2') {
      this.setState({ reportCategory3: '' });
      this.setState({ reportCategory3Text: '' });
    }
  }

  sendToImgEdit(editImgIndex, event) {
    const img = event.target;
    let tblIssueImageFileVoList = this.state.tblIssueImageFileVoList;
    let imageSrc = tblIssueImageFileVoList[editImgIndex].src;
    if (!imageSrc) {
      alert('Edit target is not captured.');
    } else {
      this.setState({
        editImgIndex: editImgIndex
      });
      this.$f7router.navigate(APP_DIR_PATH + '/imgedit', { props: { onCapture: this.onImgEdited.bind(this), imageSrc: img } });
    }
  }

  onImgEdited(edited) {
    if (this.state.editImgIndex !== null) {
      let tblIssueImageFileVoList = this.state.tblIssueImageFileVoList;
      tblIssueImageFileVoList[this.state.editImgIndex].file = edited.blob;
      tblIssueImageFileVoList[this.state.editImgIndex].fileUuid = null;
      tblIssueImageFileVoList[this.state.editImgIndex].src = edited.dataUrl;
      this.setState({
        tblIssueImageFileVoList: tblIssueImageFileVoList
      });
    }
  }
  /**
   * 登録ボタン
   */
  getFormData(newImages) {
    let data = {
      id: this.state.id,
      reportDate: moment(new Date(this.state.registerDate)).format('YYYY/MM/DD 00:00:00'),
      moldUuid: this.state.moldUuid,
      moldId: this.state.moldId,
      moldName: this.state.moldName,
      machineUuid: this.state.machineUuid,
      machineId: this.state.machineId,
      machineName: this.state.machineName,
      componentId: this.state.componentId,
      componentCode: this.state.componentCode,
      componentName: this.state.componentName,
      procedureId: this.state.procedureId,
      procedureCode: this.state.procedureCode,
      procedureName: this.state.procedureName,
      lotNumber: this.state.lotNumber,
      issue: this.state.issue,
      measureStatus: this.state.measureStatus,
      measureSummary: this.state.measureSummary,
      shotCountAtIssue: this.state.shotCountAtIssue,
      quantity: this.state.quantity,
      tblIssueImageFileVoList: newImages ? newImages : [],
      measureDueDate: this.state.measureDueDate !== '' ? moment(new Date(this.state.measureDueDate)).format('YYYY/MM/DD 00:00:00') : null,
      reportDepartment: this.state.reportDepartment,
      reportDepartmentName: this.state.reportDepartmentName,
      reportPhase: this.state.reportPhase,
      reportPhaseText: this.state.reportPhaseText,
      reportCategory1: this.state.reportCategory1,
      reportCategory1Text: this.state.reportCategory1Text,
      reportCategory2: this.state.reportCategory2,
      reportCategory2Text: this.state.reportCategory2Text,
      reportCategory3: this.state.reportCategory3,
      reportCategory3Text: this.state.reportCategory3Text,
      memo01: this.state.memo01,
      memo02: this.state.memo02,
      memo03: this.state.memo03,
      mainteType: this.state.mainteType,
      mainteTypeText: this.state.mainteTypeText,
      happenedAt: this.state.happenedAt !== '' ? moment(this.state.happenedAt).format('YYYY/MM/DD HH:mm:00') : null
    };
    return data;
  }

  buttonTemporarilySaved() {
    let me = this;
    var reg = /(\w*)%s(.*)%s(.*)/g;
    if (this.state.shotCountAtIssue !== '' && !/^(-)?[0-9]{1,}$/.test(this.state.shotCountAtIssue)) {
      this.setState({ errorMessageShotCountAtIssue: me.state.dict.msg_error_value_invalid });
      Dom7('#issue-register-page-after-mainte-shot-count').focus();
      return;
    } else {
      this.setState({ errorMessageShotCountAtIssue: '' });
    }
    if (this.state.shotCountAtIssue > 999999999 || this.state.shotCountAtIssue < -999999999) {
      this.setState({ errorMessageShotCountAtIssue: me.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.mold_after_mainte_total_shot_count + '$29$3') });
      Dom7('#issue-register-page-after-mainte-shot-count').focus();
      return;
    } else {
      this.setState({ errorMessageShotCountAtIssue: '' });
    }
    if (this.state.quantity !== '' && !/^[0-9]+$/.test(this.state.quantity)) {
      this.setState({ errorMessageQuantity: me.state.dict.msg_error_num_over_zero });
      Dom7('#issue-register-page-issue-count').focus();
      return;
    } else {
      this.setState({ errorMessageQuantity: '' });
    }
    if (this.state.quantity > 999999999) {
      this.setState({ errorMessageQuantity: me.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.quantity + '$29$3') });
      Dom7('#issue-register-page-issue-count').focus();
      return;
    } else {
      this.setState({ errorMessageQuantity: '' });
    }
    if (this.state.measureDueDate === '') {
      this.setState({ errorMessageMeasureDueDate: me.state.dict.msg_error_not_null });
      Dom7('#issue-register-page-measure-due-date').focus();
      return;
    } else {
      this.setState({ errorMessageMeasureDueDate: '' });
    }
    let newImages = [];
    let blobs = [];
    for (let key in this.state.tblIssueImageFileVoList) {
      let value = this.state.tblIssueImageFileVoList[key];
      if (value) {
        if (!value.fileUuid) {
          blobs.push(value.file);
        }
        newImages.push(value);
      }
    }
    if (blobs.length > 0) {
      //Preloaderを表示
      //登録ボタンを非活性化し二度押しを防止する
      me.$f7.preloader.show();
      FileUtil.uploadsBlob(blobs, 'image', '15100')
        .then((response) => {
          let fileUuid = response.fileUuid;
          fileUuid = fileUuid.split(',');
          let imgIndex = 0;
          for (let key in newImages) {
            if (!newImages[key].fileUuid) {
              newImages[key].fileUuid = fileUuid[imgIndex];
              imgIndex++;
            }
          }
          let data = this.getFormData(newImages);
          //APIデータ登録
          Issue.register(data).then(() => {
            //Preloaderを消去
            me.$f7.preloader.hide();

            me.$f7.dialog.create({
              text: this.state.dict.msg_record_updated,
              buttons: [{
                text: this.state.dict.ok
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
        }).catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          if (error['errorCode'] === 'E201') {
            me.$f7.dialog.alert(error.errorMessage);
          } else {
            me.setState(() => { throw new UnexpectedError(error); });
          }
        });
    } else {
      //Preloaderを表示
      //登録ボタンを非活性化し二度押しを防止する
      me.$f7.preloader.show();
      let data = this.getFormData(newImages);
      //APIデータ登録
      Issue.register(data).then(() => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        //メインメニューに戻る
        me.$f7.dialog.create({
          text: this.state.dict.msg_record_updated,
          buttons: [{
            text: this.state.dict.ok
          }]
        }).open();
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
  }

  buttonRegistration() {
    let me = this;
    var reg = /(\w*)%s(.*)%s(.*)/g;
    if (this.state.shotCountAtIssue !== '' && !/^(-)?[0-9]{1,}$/.test(this.state.shotCountAtIssue)) {
      this.setState({ errorMessageShotCountAtIssue: me.state.dict.msg_error_value_invalid });
      Dom7('#issue-register-page-after-mainte-shot-count').focus();
      return;
    } else {
      this.setState({ errorMessageShotCountAtIssue: '' });
    }
    if (this.state.shotCountAtIssue > 999999999 || this.state.shotCountAtIssue < -999999999) {
      this.setState({ errorMessageShotCountAtIssue: me.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.mold_after_mainte_total_shot_count + '$29$3') });
      Dom7('#issue-register-page-after-mainte-shot-count').focus();
      return;
    } else {
      this.setState({ errorMessageShotCountAtIssue: '' });
    }
    if (this.state.quantity !== '' && !/^[0-9]+$/.test(this.state.quantity)) {
      this.setState({ errorMessageQuantity: me.state.dict.msg_error_num_over_zero });
      Dom7('#issue-register-page-issue-count').focus();
      return;
    } else {
      this.setState({ errorMessageQuantity: '' });
    }
    if (this.state.quantity > 999999999) {
      this.setState({ errorMessageQuantity: me.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.quantity + '$29$3') });
      Dom7('#issue-register-page-issue-count').focus();
      return;
    } else {
      this.setState({ errorMessageQuantity: '' });
    }
    if (this.state.measureDueDate === '') {
      this.setState({ errorMessageMeasureDueDate: me.state.dict.msg_error_not_null });
      Dom7('#issue-register-page-measure-due-date').focus();
      return;
    } else {
      this.setState({ errorMessageMeasureDueDate: '' });
    }
    let newImages = [];
    let blobs = [];
    for (let key in this.state.tblIssueImageFileVoList) {
      let value = this.state.tblIssueImageFileVoList[key];
      if (value) {
        if (!value.fileUuid) {
          blobs.push(value.file);
        }
        newImages.push(value);
      }
    }
    if (blobs.length > 0) {
      //Preloaderを表示
      //登録ボタンを非活性化し二度押しを防止する
      me.$f7.preloader.show();
      FileUtil.uploadsBlob(blobs, 'image', '15100')
        .then((response) => {
          let fileUuid = response.fileUuid;
          fileUuid = fileUuid.split(',');
          let imgIndex = 0;
          for (let key in newImages) {
            if (!newImages[key].fileUuid) {
              newImages[key].fileUuid = fileUuid[imgIndex];
              imgIndex++;
            }
          }
          let data = this.getFormData(newImages);
          //APIデータ登録
          Issue.register(data).then(() => {
            //Preloaderを消去
            me.$f7.preloader.hide();

            me.$f7.dialog.create({
              text: data.id === '' ? this.state.dict.msg_record_added : this.state.dict.msg_record_updated,
              buttons: [{
                text: this.state.dict.ok,
                onClick: function () {
                  if (data.id) {
                    me.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-list', { pushState: true });
                  } else {
                    me.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-sub-menu', { pushState: true });
                  }
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
        }).catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          if (error['errorCode'] === 'E201') {
            me.$f7.dialog.alert(error.errorMessage);
          } else {
            me.setState(() => { throw new UnexpectedError(error); });
          }
        });
    } else {
      //Preloaderを表示
      //登録ボタンを非活性化し二度押しを防止する
      me.$f7.preloader.show();
      let data = this.getFormData(newImages);
      //APIデータ登録
      Issue.register(data).then(() => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        //メインメニューに戻る
        me.$f7.dialog.create({
          text: data.id === '' ? this.state.dict.msg_record_added : this.state.dict.msg_record_updated,
          buttons: [{
            text: this.state.dict.ok,
            onClick: function () {
              if (data.id) {
                me.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-list', { pushState: true });
              } else {
                me.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-sub-menu', { pushState: true });
              }
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
  }

  handleImgRemark(index, event) {
    let tblIssueImageFileVoList = this.state.tblIssueImageFileVoList;
    tblIssueImageFileVoList[index]['remarks'] = event.target.value;
    this.setState({
      tblIssueImageFileVoList: tblIssueImageFileVoList
    });
  }

  deleteImg(index) {
    let me = this;
    me.$f7.dialog.create({
      text: this.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          let tblIssueImageFileVoList = me.state.tblIssueImageFileVoList;
          delete tblIssueImageFileVoList[index];
          me.setState({
            tblIssueImageFileVoList: tblIssueImageFileVoList
          });
        }
      }, {
        text: this.state.dict.no,
        onClick: function (dialog) {
          dialog.close();
        }
      }]
    }).open();
  }

  buttonDelete() {
    let me = this;
    let app = me.$f7;
    me.$f7.dialog.create({
      text: this.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          Issue.deleteIssue(me.state.id)
            .then((response) => {
              if (!response.error) {
                //メインメニューに戻る
                me.$f7.views.main.router.navigate(APP_DIR_PATH + '/issue-list', { pushState: true });
              } else {
                app.dialog.alert(response.errorMessage);
              }
            }).catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        }
      }, {
        text: this.state.dict.no,
        onClick: function (dialog) {
          dialog.close();
        }
      }]
    }).open();
  }

  buttonMoldMaintenance() {
    let data = this.getFormData(null);
    this.props.mainteInputAdd(data);
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-input', { pushState: true });
  }

  buttonMachineMaintenance() {
    let data = this.getFormData(null);
    this.props.mainteInputAddMachine(data);
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-input', { pushState: true });
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.issue_input}>
        <Page onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.issue_input}</BlockTitle>
          <List form={true} id="form" noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.registration_date}</Label> {/* 初期値システム日付 */}
              <Input type="text" name="registerDate" value={this.state.registerDate} readonly inputId="issue-register-page-register-date" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_happened_at}</Label> {/* 初期値システム日付 */}
              <Input type="text" name="happenedAt" 
                value={this.state.happenedAt}
                //errorMessage={this.state.msgWorkEndTime}
                //errorMessageForce={this.state.msgWorkEndTime !== ''}
                readonly inputId="issue-register-happened-at" />
            </ListItem>
            <ListItem className="custom-list-item" >
              <Label >{this.state.dict.machine_id}</Label>
              <Input type="text" name="machineId" value={this.state.machineId} clearButton onInputClear={this.handleClear.bind(this)} inputId="issue-register-page-machine-id" onChange={this.handleChange.bind(this)} maxlength={45} autocomplete="off" />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonMachineQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.machine_name}</Label>
            </ListItem>
            <ListItem className="custom-list-item" >
              {/* <Label>{this.state.dict.machine_name}</Label> ログインユーザーの所属に等しい設備をピッカーから選択 */}
              {/* <Input type="text" name="machineName" value={this.state.machineName} clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="issue-register-page-machine-name" onChange={this.handleChange.bind(this)} /> */}
              <Input>{this.state.machineName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonMachineSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item" >
              <Label >{this.state.dict.mold_id}</Label>
              <Input type="text" name="moldId" value={this.state.moldId} clearButton onInputClear={this.handleClear.bind(this)} inputId="issue-register-page-mold-id" onChange={this.handleChange.bind(this)} maxlength={45} autocomplete="off" />
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
                <Button small fill iconF7="search" onClick={this.buttonMoldSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.mold_after_mainte_total_shot_count}</Label>
              <Input type="number" name="shotCountAtIssue" value={this.state.shotCountAtIssue} inputId="issue-register-page-after-mainte-shot-count" clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageShotCountAtIssue} errorMessageForce={this.state.errorMessageShotCountAtIssue !== ''} />
            </ListItem>
            <ListItem className="custom-list-item" >
              <Label >{this.state.dict.component_code}</Label>
              <Input type="text" name="componentCode" value={this.state.componentCode} clearButton onInputClear={this.handleClear.bind(this)} inputId="issue-register-page-component-code" onChange={this.handleChange.bind(this)} maxlength={45} autocomplete="off" />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonComponentQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Input>{this.state.componentName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonComponentSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.procedure_code}</Label> {/* 部品工程番号＋名称 */}
              <Input type="text" name="procedureCode" inputId="issue-register-page-procedure-code" value={this.state.procedureCodeName} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageProcedureCode} errorMessageForce={this.state.errorMessageProcedureCode !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.lot_number}</Label>
              <Input type="text" name="lotNumber" inputId="issue-register-page-lot-number" value={this.state.lotNumber} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageLotNumber} errorMessageForce={this.state.errorMessageLotNumber !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.quantity}</Label>
              <Input type="number" name="quantity" value={this.state.quantity}
                inputId="issue-register-page-issue-count" clearButton onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageQuantity} errorMessageForce={this.state.errorMessageQuantity !== ''} />
            </ListItem>
            <ListItem >
              <Label>{this.state.dict.issue_reported_department}</Label> {/* ログインユーザーの所属を初期セット */}
              <Input type="text" name="reportDepartment" value={this.state.reportDepartmentName} clearButton readonly inputId="issue-register-page-report-department" onInputClear={this.handleClear.bind(this)} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_report_phase}</Label> {/* 発生場所が選択されたらピッカー作成 */}
              <Input type="text" name="reportPhase" value={this.state.reportPhaseText} onInputClear={this.handleClear.bind(this)} clearButton readonly inputId="issue-register-page-report-phase" disabled={this.state.reportDepartment === ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_report_category1}</Label> {/* 不具合工程が選択されたらピッカー作成 */}
              <Input type="text" name="reportCategory1" value={this.state.reportCategory1Text} onInputClear={this.handleClear.bind(this)} clearButton readonly inputId="issue-register-page-report-category1" disabled={this.state.reportPhase === ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_report_category2}</Label> {/* 不具合大分類が選択されたらピッカー作成 */}
              <Input type="text" name="reportCategory2" value={this.state.reportCategory2Text} onInputClear={this.handleClear.bind(this)} clearButton readonly inputId="issue-register-page-report-category2" disabled={this.state.reportCategory1 === ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_report_category3}</Label> {/* 不具合中分類が選択されたらピッカー作成 */}
              <Input type="text" name="reportCategory3" value={this.state.reportCategory3Text} onInputClear={this.handleClear.bind(this)} clearButton readonly inputId="issue-register-page-report-category3" disabled={this.state.reportCategory2 === ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.mold_mainte_type}</Label>
              <Input type="text" name="mainteType" value={this.state.mainteTypeText} onInputClear={this.handleClear.bind(this)} clearButton readonly inputId="issue-register-page-mainte-type" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue}</Label>
              <Input type="textarea" name="issue" value={this.state.issue} clearButton inputId="issue-register-page-issue" onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} maxlength={200} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_memo01}</Label> {/* 部品工程番号＋名称 */}
              <Input type="text" name="memo01" inputId="memo01" value={this.state.memo01} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageMemo01} errorMessageForce={this.state.errorMessageMemo01 !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_memo02}</Label> {/* 部品工程番号＋名称 */}
              <Input type="text" name="memo02" inputId="memo02" value={this.state.memo02} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageMemo02} errorMessageForce={this.state.errorMessageMemo02 !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_memo03}</Label> {/* 部品工程番号＋名称 */}
              <Input type="text" name="memo03" inputId="memo03" value={this.state.memo03} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageMemo03} errorMessageForce={this.state.errorMessageMemo03 !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_measure_due_date + this.state.required}</Label> {/* 初期値システム日付 */}
              <Input type="text" name="measureDueDate" value={this.state.measureDueDate} readonly inputId="issue-register-page-measure-due-date" errorMessage={this.state.errorMessageMeasureDueDate} errorMessageForce={this.state.errorMessageMeasureDueDate !== ''} onInputClear={this.handleClear.bind(this)} clearButton />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_measure_status}</Label> {/* 初期値：未対応 */}
              <Input type="text" name="measureStatus" value={this.state.measureStatusText} onInputClear={this.handleClear.bind(this)} clearButton readonly inputId="issue-register-page-measure-status" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_measuer_completed_date}</Label> {/* 初期値ブランク */}
              <Input type="text" name="measuerCompletedDate" value={this.state.measuerCompletedDate} readonly inputId="issue-register-page-measure-completed-date" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.issue_measure_summary}</Label>
              <Input type="textarea" name="measureSummary" value={this.state.measureSummary} clearButton inputId="issue-register-page-measure-summary" onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} maxlength={200} />
            </ListItem>
          </List>
          <BlockTitle>{this.state.dict.image}</BlockTitle>
          <Block>
            <Row >
              <Col width="50">
                <Button small fill iconF7="camera" onClick={this.buttonCameraForm.bind(this)}></Button>
              </Col>
              <Col width="50" style={{ float: 'left', position: 'relative', height: 28, overflow: 'hidden' }}>
                <Button small fill iconF7="photos"></Button>
                <Input type="file" id="issue-register-page-photos" accept="image/*" onChange={this.buttonFileSelect.bind(this)} />
              </Col>
            </Row>
          </Block>

          {/** 写真の数だけ動的生成するので別ファンクションで生成すること */}
          {this.state.tblIssueImageFileVoList ? this.state.tblIssueImageFileVoList.map((item, index) => {
            if (!item) {
              return null;
            }
            return <Card key={index}>
              <CardContent>
                <List>
                  <ListItem>
                    <div className="preloader-modal">
                      <div className="preloader color-white">
                        <span className="preloader-inner">
                          <span className="preloader-inner-gap"></span>
                          <span className="preloader-inner-left">
                            <span className="preloader-inner-half-circle"></span>
                          </span>
                          <span className="preloader-inner-right">
                            <span className="preloader-inner-half-circle"></span>
                          </span>
                        </span>
                      </div>
                    </div>
                    {
                      !item.notFound
                        ?
                        <img className="contain" src={item.src} width="100%" height="200" alt="photo_1" id={'img' + index} onClick={this.sendToImgEdit.bind(this, index)} />
                        :
                        <img className="contain" src={item.src} style={{ background: '#fff' }} width="100%" height="200" alt="photo_1" id={'img' + index} onClick={this.sendToImgEdit.bind(this, index)} />
                    }
                  </ListItem>
                  <ListItem>
                    <Col width="50">{this.state.dict.issue_taken_date}</Col>
                    <Col width="50">{moment(new Date(item.takenDate)).format('YYYY/MM/DD HH:mm')}</Col>
                  </ListItem>
                  <ListItem>
                    <Label>{this.state.dict.issue_remarks}</Label>
                    <Input type="textarea" name="photoComment_1" value={item.remarks} clearButton onChange={this.handleImgRemark.bind(this, index)} inputId="issue-register-page-photo-comment-1" maxlength={200} />
                  </ListItem>
                </List>
              </CardContent>
              <CardFooter>
                <p></p>
                <Link onClick={this.deleteImg.bind(this, index)}>{this.state.dict.delete_record}</Link>
              </CardFooter>
            </Card>;
          }) : null}
          <Block>
            <List>
              {this.state.id.length <= 0 || this.state.copy ?
                <List>
                  <Row>
                    <Col>
                      <Button fill text={this.state.dict.record_register} onClick={this.buttonRegistration.bind(this)}></Button>
                    </Col>
                  </Row>
                </List>
                :
                <List>
                  <Row>
                    <Col width="33">
                      <Button fill text={this.state.dict.temporarily_saved} onClick={this.buttonTemporarilySaved.bind(this)}></Button>
                    </Col>
                    <Col width="33">
                      <Button fill text={this.state.dict.update} onClick={this.buttonRegistration.bind(this)}></Button>
                    </Col>
                    <Col width="33">
                      <Button fill text={this.state.dict.delete_record} onClick={this.buttonDelete.bind(this)}></Button>
                    </Col>
                  </Row>
                  <List>
                    <Row>
                      {this.state.moldId.length > 0 ?
                        <Col width="100">
                          <Button fill text={this.state.dict.sp_mold_maintenance} onClick={this.buttonMoldMaintenance.bind(this)} />
                        </Col> : null}<List></List>
                      {this.state.machineId.length > 0 ?
                        <Col width="100">
                          <Button fill text={this.state.dict.sp_machine_maintenance} onClick={this.buttonMachineMaintenance.bind(this)} />
                        </Col> : null}
                    </Row>
                  </List>
                </List>
              }
            </List>
          </Block>
        </Page>
      </DocumentTitle>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    mainteInputAdd(value) {
      dispatch(mainteInputAdd(value));
    },
    mainteInputAddMachine(value) {
      dispatch(mainteInputAddMachine(value));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(IssueRegisterPage);
