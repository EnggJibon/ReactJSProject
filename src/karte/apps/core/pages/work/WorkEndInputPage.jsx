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
import Choice from 'karte/shared/master/choice';
import Direction from 'karte/shared/master/direction';
import MoldMaster from 'karte/shared/master/mold';
import Machine from 'karte/shared/master/machine';
import Component from 'karte/shared/master/component';
import { connect } from 'react-redux';
import System from 'karte/shared/master/system';
import { /*clearNextWorkInfo*/ nextWorkInfoAdd } from 'karte/apps/core/reducers/work-reducer';
import { updateMachineReportInfo } from 'karte/apps/machine/reducers/machine-report-reducer';
import Authentication from 'karte/shared/logics/authentication';

export class WorkEndInputPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        work_end: '',
        working_date: '',
        work_start_time: '',
        work_end_time: '',
        working_time_minutes: '',
        time_unit_minute: '',
        work_break_time_minutes: '',
        work_actual_time_minutes: '',
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
        next_work_phase: '',

        close: '',
        cancel: '',
        yes: '',
        no: '',
        ok: '',
        msg_record_updated: '',
        msg_confirm_delete: '',
        msg_error_num_over_zero: '',
        msg_error_locked: '',
        msg_error_not_null: '',
        msg_error_work_datetime_order: '',
        mst_error_record_not_found: ''
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
      directFlg: null,
      isStart: false,
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

      modalIsOpen: false,
      msgWorkBreakTimeMinutes: '',
      msgWorkEndTime: '',
      msgProcCd: '',
      requireProcCdInWork: '',
      msgWorkPhase: '',
      nextWorkPhases: [],
      moldReadOnly: false,
      componentReadOnly: false,
      directionCode:''
    };
    this.openModal = this.openModal.bind(this);
    // this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.workPhases = [];
    this.itemWorkPhases = [];
    this.machineReportInfo = props.reportInfo;
    this.loadDetail();
  }

  loadDetail() {
    var me = this;
    const app = me.$f7;
    //クエリパラメータで指定されたIDを取得
    var id = this.$f7route.query.id;
    //which page did user come from  
    if (id) {
      //一覧で選択された作業実績IDを保持して、作業終了画面へ遷移する。
      me.$f7.preloader.show();
      Work.getWork(id)
        .then((response) => {
          me.$f7.preloader.hide();

          let workStartTime = '';
          let workEndTime = '';
          if (!response.error && response.tblWorks.length > 0) {
            let works = response.tblWorks[0];
            var today1 = new Date();
            let itemDate = moment(new Date()).format('YYYY/MM/DD');
            var today = new Date(itemDate + ' ' + today1.getHours() + ':' + today1.getMinutes() + ':00');
            workStartTime = works.startDatetimeStr ? moment(new Date(works.startDatetimeStr)).format('YYYY/MM/DD HH:mm') : '';
            workEndTime = works.endDatetimeStr ? moment(new Date(works.endDatetimeStr)).format('YYYY/MM/DD HH:mm') : moment(today).format('YYYY/MM/DD HH:mm');
            let workingTimeMinutes = me.calcCostMinutes(workStartTime, workEndTime);
            let detail = {
              id: works.id,
              workingDate: works.workingDate ? moment(new Date(works.workingDate)).format('YYYY/MM/DD') : '',
              workStartTime: workStartTime,
              workEndTime: workEndTime,
              workPhaseChoiceSeq: works.workPhaseChoiceSeq,
              workCategory: works.workCategory,
              componentCode: works.componentCode,
              componentId: works.componentId,
              componentName: works.componentName,

              directionId: works.directionId,
              directionCode: works.tblDirection ? works.tblDirection.directionCode : '',
              workPhaseId: works.workPhaseId,
              moldId: works.moldId,
              moldName: works.moldName,
              moldUuid: works.moldUuid,

              machineUuid: works.machineUuid,
              machineId: works.mstMachine ? works.mstMachine.machineId : '',
              machineName: works.mstMachine ? works.mstMachine.machineName : '',
              locked: works.locked,
              workCode: works.workCode,
              procCd: works.procCd,

              //作業時間
              workingTimeMinutes: works.workingTimeMinutes ? works.workingTimeMinutes : workingTimeMinutes,
              //実稼働時間
              workActualTimeMinutes: works.actualTimeMinutes ? works.actualTimeMinutes : workingTimeMinutes - this.state.workBreakTimeMinutes,
              workBreakTimeMinutes: works.breakTimeMinutes ? works.breakTimeMinutes : this.state.workBreakTimeMinutes
            };
            this.setState({ ...detail });
            me.workingDateCalendar = app.calendar.create(
              CalendarUtil.getCalendarProperties('#work-end-input-page-working-date', {
                change: function (calendar, value) {
                  me.setState({
                    workingDate: moment(new Date(value)).format('YYYY/MM/DD')
                  });
                }
              }));

            me.workStartTimePicker = CalendarUtil.createDateTimePicker(app, me.state.dict.close, '#work-end-input-page-work-start-time', {}, new Date(workStartTime));
            me.workEndTimePicker = CalendarUtil.createDateTimePicker(app, me.state.dict.close, '#work-end-input-page-work-end-time', {}, new Date(workEndTime));

            me.createMoldIdAutocomplete();
            me.createComponentAutocomplete();
            me.createMachineAutocomplete();
            me.createDirectionCodeAutocomplete();

            me.workStartTimePicker.on('change', function (picker, value) {
              let workStartTime = me.convertDateArrToStr(value) + ':00';
              let workingTimeMinutes = me.calcCostMinutes(workStartTime, me.state.workEndTime);
              me.setState({
                workingTimeMinutes: workingTimeMinutes,
                workActualTimeMinutes: workingTimeMinutes - me.state.workBreakTimeMinutes,
                workStartTime: moment(new Date(workStartTime)).format('YYYY/MM/DD HH:mm')
              });
            });

            me.workEndTimePicker.on('change', function (picker, value) {
              let workEndTime = me.convertDateArrToStr(value) + ':00';
              let workingTimeMinutes = me.calcCostMinutes(me.state.workStartTime, workEndTime);
              me.setState({
                workingTimeMinutes: workingTimeMinutes,
                workActualTimeMinutes: workingTimeMinutes - me.state.workBreakTimeMinutes,
                workEndTime: moment(new Date(workEndTime)).format('YYYY/MM/DD HH:mm')
              });
            });

            Work.getWorkPhase({
              //langId: me.getCookieLang()
            })
              .then((response) => {
                me.itemWorkPhases = [...response.mstWorkPhases];
                me.setWorkPhaseItems();
              })
              .catch((err) => {
                me.$f7.preloader.hide();
                var error = err;
                me.setState(() => { throw new UnexpectedError(error); });
              });
          }
        })
        .catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
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
        // let workCopyInfo = me.props.workCopyInfo;
        // if (workCopyInfo.procCd === undefined) {
        //   this.setState({
        //     procCd: responseWho.procCd
        //   });
        // }
        //ログインユーザーに所属が定義されているとき、その所属が利用可能な工程のみ表示
        for (let i = 0; i < oldItemWorkPhases.length; i++) {
          if (loginDepartment && loginDepartment !== '' && loginDepartment !== '0') {
            if (oldItemWorkPhases[i].departmentIds.includes(parseInt(loginDepartment))) {
              //if (oldItemWorkPhases[i].directFlg === parseInt(this.state.directFlg)) {
              newItemWorkPhases.push(oldItemWorkPhases[i]);
              //}
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

  createMoldIdAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#work-end-input-page-mold-id',
      openIn: 'dropdown',
      valueProperty: 'moldId',  //object's "value" property name
      textProperty: 'moldId', //object's "text" property name      
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          render(results);
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
            moldName: value[0].moldName
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

  componentDidMount() {
    var me = this;
    // const app = me.$f7;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

    System.load(['system.require_proc_cd_in_work'])
      .then((values) => {
        this.setState({
          requireProcCdInWork: values.cnfSystems[0].configValue
        });
        if(values.cnfSystems[0].configValue==='1')
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
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  /**
   * 削除
   */
  buttonDelete() {
    let me = this;
    if (me.state.locked === 1) {
      me.$f7.dialog.alert(me.state.dict.msg_error_locked);
      return;
    }
    me.$f7.dialog.create({
      title: me.state.dict.application_title,
      text: me.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          Work.deleteWorkById(me.state.id)
            .then((response) => {
              if (response.error) {
                me.$f7.dialog.alert(response.errorMessage);
              } else {
                //作業終了一覧画面に戻る
                //me.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-end-list', { pushState: true });
                me.onBackClick();
              }
            }).catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            })
            .catch((err) => {
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

  /**
    * ページ終了処理
    */
  onPageBeforeRemove() {
    var me = this;
    //作成したオブジェクトはページ終了処理で廃棄(destroy)する
    if (me.workingDateCalendar) {
      me.workingDateCalendar.destroy();
    }
    if (me.workStartTimePicker) {
      me.workStartTimePicker.destroy();
    }
    if (me.workEndTimePicker) {
      me.workEndTimePicker.destroy();
    }
  }

  /**
    * 戻る
    */
  onBackClick() {
    //ひとつ前の画面に戻る   
    let me = this;
    if(me.$f7route.query.pageName==='reportDetail'){
      let query = me.$f7route.query;
      delete query['id'];
      delete query['reportDetail'];
      let params = Object.keys(query).map(function (key) {
        if (query[key]) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
        } else {
          return '';
        }
      }).join('&');
      
      me.machineReportInfo.reload = '3';
      me.machineReportInfo.isChanged = '1';
      me.props.updateMachineReportInfo(me.machineReportInfo);
      me.$f7router.navigate(APP_DIR_PATH + '/report-detail?'+params, { pushState: true, reloadAll: true });
    }
    else if (me.$f7route.query.pageName==='workEndList') {
      me.$f7router.navigate(APP_DIR_PATH + '/work-end-list', { pushState: true, reloadAll: true });
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

    if (event.target.name === 'workBreakTimeMinutes') {
      let inputWorkBreakTimeMinutes = event.target.value === '' ? 0 : parseInt(event.target.value);
      this.setState({
        workActualTimeMinutes: this.state.workingTimeMinutes - inputWorkBreakTimeMinutes,
        workBreakTimeMinutes: inputWorkBreakTimeMinutes === 0 ? '' : inputWorkBreakTimeMinutes
      });
    }

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
    if (code) {
      this.setState({
        directionCode: code
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
      QRCodeParser.parseMachineID(code).then((response) => {
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
   * 手配・工事番号
   */
  createDirectionCodeAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#work-end-input-page-direction-code',
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
        })
          .then((response) => {
            let data = response.tblDirections;
            if (data.length === 0) {
              me.setState({
                directionId: ''
              });
            }
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
              moldReadOnly: true
            }
          );

        } else {
          me.setState(
            {
              moldId: '',
              moldName: '',
              moldUuid: '',
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
              componentReadOnly: true
            }
          );
        } else {
          me.setState(
            {
              componentCode: '',
              componentName: '',
              componentId: '',
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
      inputEl: '#work-end-input-page-machine-id',
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
        },
        closed: function (autocomplete) {
          if (me.state.machineName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              machineId: '',
              machineName: '',
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
      inputEl: '#work-end-input-page-component-code',
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
        },
        closed: function (autocomplete) {
          if (me.state.componentName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              componentId: '',
              componentName: '',
              componentCode: '',
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
    MoldMaster.getMoldForComponent(componentId)
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
    var me = this;
    MoldMaster.getMoldDetail({
      moldId: moldId
    }).then((response) => {
      me.setState({
        shotCountAtIssue: response.afterMainteTotalShotCount
      });
      if (response.mstMoldComponentRelationVo.length > 0) {
        if (response.mstMoldComponentRelationVo.length === 1) {
          me.setState({
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

      me.pickerWorkPhase = me.createPicker('#work-end-input-page-work-phase', _values, _displayValues,
        (picker, value, displayValue) => {
          const oldWorkPhaseChoiceSeq = me.state.workPhaseChoiceSeq;
          me.setState({
            workPhaseChoiceSeq: value,
            workPhaseName: displayValue,
            workCategory: 0,
            workCategoryName: ''
          });

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
      me.pickerWorkCategory = me.createPicker('#work-end-input-page-work-category', _values, _displayValues,
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
      endDatetimeStr: moment(this.state.workEndTime).format('YYYY/MM/DD HH:mm:00'),
      workingTimeMinutes: this.state.workingTimeMinutes,
      actualTimeMinutes: this.state.workActualTimeMinutes,
      breakTimeMinutes: this.state.workBreakTimeMinutes,
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
      directFlg: this.state.directFlg,
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
      productionId: this.state.productionId,
      isStart: this.state.isStart
    };
    return data;
  }

  check(param) {
    // 入力チェック
    //工程必須チェック
    if (param.workPhaseChoiceSeq === 0) {
      this.setState({ msgWorkPhase: this.state.dict.msg_error_not_null });
      return true;
    } else {
      this.setState({ msgWorkPhase: '' });
    }

    // 作業開始時に工程CDを必須にする(0:しない,1:する)
    if (this.state.requireProcCdInWork === '1' && param.procCd === '') {
      this.setState({ msgProcCd: this.state.dict.msg_error_not_null });
      return true;
    } else {
      this.setState({ msgProcCd: '' });

    }
    // 開始終了時刻前後チェック
    if (new Date(param.startDatetimeStr).getTime() > new Date(param.endDatetimeStr).getTime()) {
      this.setState({ msgWorkEndTime: this.state.dict.msg_error_work_datetime_order });
      return true;
    } else {
      this.setState({ msgWorkEndTime: '' });
    }
    // 休憩時間(分) 整数のみ許容
    if (param.breakTimeMinutes !== '' && !/^[0-9]+$/.test(param.breakTimeMinutes)) {
      this.setState({ msgWorkBreakTimeMinutes: this.state.dict.msg_error_num_over_zero });
      return true;
    } else {
      this.setState({ msgWorkBreakTimeMinutes: '' });
    }

    return false;
  }

  buttonRegistration() {
    var me = this;
    let data = this.getFormData();
    if (me.check(data)) {
      return;
    }

    me.registration(data);

  }

  registration(data) {
    var me = this;
    //Preloaderを表示
    //登録ボタンを非活性化し二度押しを防止する
    me.$f7.preloader.show();
    Work.update(data).then((R) => {
      //Preloaderを消去
      me.$f7.preloader.hide();
      //メインメニューに戻る
      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: this.state.dict.msg_record_updated,
        buttons: [{
          text: this.state.dict.ok,
          onClick: function () {
            if (R['errorMessage'] && R['errorMessage'] !== '') {
              me.$f7.dialog.create({
                title: me.state.dict.application_title,
                text: R.errorMessage,
                buttons: [{
                  text: me.state.dict.ok,
                  onClick: function () {
                    // 次工程があれば，次工程提案ダイアログを表示
                    if (data.workPhaseId.length > 0) {
                      me.getNextWorkPhaseList(data.workPhaseId);
                    }
                  }
                }]
              }).open();
            } else {
              // 次工程があれば，次工程提案ダイアログを表示
              if (data.workPhaseId.length > 0) {
                me.getNextWorkPhaseList(data.workPhaseId);
              }
            }

          }
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

  getNextWorkPhaseList(workPhaseId) {
    var me = this;
    Work.getNextWorkPhaseList(workPhaseId, {
      //langId: me.getCookieLang()
    }).then((res) => {
      if (res.mstWorkPhases.length > 0) {
        this.setState({
          nextWorkPhases: res.mstWorkPhases
        });

        this.openModal();
      } else {
        //次工程がなければ遷移元の画面に戻る。
        // this.$f7router.back();
        this.onBackClick();
        // this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-daily-report-list');
      }
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

  closeModal() {
    this.setState({ modalIsOpen: false });
    // ダイアログを閉じて、遷移元の画面に戻る。
    this.onBackClick();
    // this.$f7router.back();
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  workNavigate(nextWorkPhases) {
    var { nextWorkInfoAdd } = this.props;
    let workInfo = this.getFormData();
    // if (nextWorkPhases.workPhaseType === '1') {
    //   nextWorkInfoAdd(workInfo);
    //   this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-start', { pushState: true });
    // } else if (nextWorkPhases.workPhaseType === '5' || nextWorkPhases.workPhaseType === '7') {
    //   nextWorkInfoAdd(workInfo);
    //   this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input', { pushState: true });
    // } else {
    //   this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-sub-menu', { pushState: true });
    // }
    //工程タイプが生産のとき、生産開始
    //工程タイプが生産以外のとき、作業開始
    if (nextWorkPhases.workPhaseType === '1') {
      nextWorkInfoAdd(workInfo);
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-start', { pushState: true });
    } else {
      nextWorkInfoAdd(workInfo);
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/work-start-input', { pushState: true });
    }
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.work_end}>
        <Page id="work-end-input-page" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.work_end}</BlockTitle>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.working_date}</Label>
              <Input type="text" name="workingDate" readonly inputId="work-end-input-page-working-date"
                value={this.state.workingDate} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_start_time}</Label>
              <Input type="text" name="workStartTime" readonly inputId="work-end-input-page-work-start-time"
                value={this.state.workStartTime} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_end_time}</Label>
              <Input type="text" name="workEndTime"
                errorMessage={this.state.msgWorkEndTime}
                errorMessageForce={this.state.msgWorkEndTime !== ''}
                readonly inputId="work-end-input-page-work-end-time" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.working_time_minutes + '(' + this.state.dict.time_unit_minute + ')'}</Label>
              <Input type="number" name="workingTimeMinutes"
                value={this.state.workingTimeMinutes}
                readonly inputId="work-end-input-page-working-time-minutes" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_break_time_minutes + '(' + this.state.dict.time_unit_minute + ')'}</Label>
              <Input type="number" name="workBreakTimeMinutes"
                value={this.state.workBreakTimeMinutes}
                clearButton
                errorMessage={this.state.msgWorkBreakTimeMinutes}
                errorMessageForce={this.state.msgWorkBreakTimeMinutes !== ''}
                onChange={this.handleChange.bind(this)}
                inputId="work-end-input-page-work-break-time-minutes" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_actual_time_minutes + '(' + this.state.dict.time_unit_minute + ')'}</Label>
              <Input type="number" name="workActualTimeMinutes"
                value={this.state.workActualTimeMinutes}
                readonly inputId="work-end-input-page-work-actual-time-minutes" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_phase + this.state.required}</Label>
              <Input type="text"
                name="workPhase"
                value={this.state.workPhaseName}
                clearButton
                readonly
                errorMessage={this.state.msgWorkPhase}
                errorMessageForce={this.state.msgWorkPhase !== ''}
                inputId="work-end-input-page-work-phase"
                onInputClear={this.handleClear.bind(this)} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_category}</Label>
              <Input type="text"
                name="workCategory"
                value={this.state.workCategoryName}
                clearButton
                readonly
                disabled={this.state.workPhaseChoiceSeq === 0}
                inputId="work-end-input-page-work-category"
                onInputClear={this.handleClear.bind(this)} />
            </ListItem>
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.mold_id}</Label>
              <Input type="text" name="moldId"
                value={this.state.moldId}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-end-input-page-mold-id"
                onChange={this.handleChange.bind(this)}
                maxlength={45} />

              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonMoldQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.mold_name}</Label>
            </ListItem>
            <ListItem className="custom-list-item">
              <Input>{this.state.moldName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonMoldSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.component_code}</Label>
              <Input type="text" name="componentCode"
                value={this.state.componentCode}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-end-input-page-component-code"
                onChange={this.handleChange.bind(this)}
                maxlength={45} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonComponentQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem >
              <Label>{this.state.dict.component_name}</Label>
            </ListItem>
            <ListItem className="custom-list-item">
              <Input>{this.state.componentName}</Input>
              <div className="btn-absolute">
                <Button small fill iconF7="search" onClick={this.buttonComponentSearch.bind(this)}></Button>
              </div>
            </ListItem>

            <ListItem className="custom-list-item">
              <Label >{this.state.dict.machine_id}</Label>
              <Input type="text" name="machineId"
                value={this.state.machineId}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-end-input-page-machine-id"
                onChange={this.handleChange.bind(this)} maxlength={45} />

              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonMachineQRClick.bind(this)}></Button>
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
            <ListItem className="custom-list-item">

              <Label >{this.state.dict.direction_code}</Label>
              <Input type="text" name="directionCode"
                value={this.state.directionCode}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                inputId="work-end-input-page-direction-code"
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
                inputId="work-end-input-page-work-proc-cd"
                maxlength={100} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.work_code}</Label>
              <Input type="text" name="workCode"
                value={this.state.workCode}
                clearButton
                onInputClear={this.handleClear.bind(this)}
                onChange={this.handleChange.bind(this)}
                inputId="work-end-input-page-work-code"
                maxlength={100} />
            </ListItem>
          </List>

          <Block>
            <Row>
              <Col width="50">
                <Button fill text={this.state.dict.record_register} onClick={this.buttonRegistration.bind(this)}></Button>
              </Col>
              <Col width="50">
                <Button fill text={this.state.dict.delete_record} onClick={this.buttonDelete.bind(this)} ></Button>
              </Col>
            </Row>
          </Block>

          {/* モーダル上のボタン以外では閉じさせない */}
          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal.bind(this)}
            style={modalStyle}
            shouldCloseOnOverlayClick={false}
            parentSelector={() => { return document.querySelector('#work-end-input-page'); }}
          >

            <Block className="no-margin-bottom">
              {this.state.dict.next_work_phase}
            </Block>

            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              {this.state.nextWorkPhases.map((item, index) => {
                return (
                  <ListItem key={index} link={'#'} onClick={this.workNavigate.bind(this, item)} title={item.workPhaseName}></ListItem>
                );
              })
              }
            </List>

            <Block>
              <Row>
                <Col>
                  <Button fill onClick={this.closeModal.bind(this)}> {this.state.dict.close}</Button>
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
    nextWorkInfoAdd(value) {
      dispatch(nextWorkInfoAdd(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkEndInputPage);