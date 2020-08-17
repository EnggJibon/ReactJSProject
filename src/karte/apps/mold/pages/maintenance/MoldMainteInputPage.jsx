import React, { Fragment } from 'react';
import {
  Page,
  Button,
  Block,
  Row,
  Col,
  Icon,
  Tabs,
  Tab,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  Sheet,
  Card,
  CardContent,
  CardFooter,
  Link
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { API_BASE_URL } from 'karte/shared/logics/api-agent';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import moment from 'moment';
import Cookies from 'universal-cookie';
import FileUtil from 'karte/shared/logics/fileutil';
import MoldMaintenance from 'karte/apps/mold/logics/mold-maintenance';
import Choice from 'karte/shared/master/choice';
import { connect } from 'react-redux';
import { clearMoldId, mainteInputAdd, sendMoldInfo, moldPartReplaceRepairInput } from 'karte/apps/mold/reducers/mold-maintenance-reducer';
import TabHeader from 'karte/shared/components/TabHeader';
import Mold from 'karte/apps/mold/logics/mold';
import MaintenanceCycle from 'karte/shared/master/maintenance-cycle';
import System from 'karte/shared/master/system';
import Direction from 'karte/shared/master/direction';
import FileThumbnail from 'karte/shared/components/FileThumbnail';

export class MoldMainteInputPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        mold_id: '',
        mold_name: '',
        start_datetime: '',
        end_datetime: '',
        mold_mainte_type: '',
        maintenance_reason_category1: '',
        maintenance_reason_category2: '',
        maintenance_reason_category3: '',
        maintenance_reason: '',
        mold_maintenance_remodeling_report: '',
        direction_code: '',
        mst_error_record_not_found: '',
        
        sp_mold_maintenance: '',
        sp_mold_maintenance_start: '',
        sp_mold_maintenance_end: '',
        sp_regular_maintenance_proposal_list: '',
        mold_maintenance_end_registration: '',

        start_cancel: '',
        temporarily_saved: '',
        issue_measure_status: '',
        registration: '',
        work_start_time: '',
        work_end_time: '',
        time_unit_minute:'',
        maintenance_working_time_minutes: '',
        cancel: '',
        yes: '',
        no: '',
        msg_maintenance_end: '',
        msg_record_updated: '',
        msg_record_added: '',
        msg_confirm_delete: '',
        add_work: '',
        delete_work: '',
        maintenance_direction_category1: '',
        maintenance_direction_category2: '',
        maintenance_direction_category3: '',
        maintenance_direction: '',
        inspection_task_category1: '',
        inspection_task_category2: '',
        inspection_task_category3: '',
        mold_maintenance__task: '',
        delete_record: '',
        issue_taken_date: '',
        issue_remarks: '',
        measure: '',
        routine: '',
        inspection_result: '',
        msg_error_not_null_with_item: '',
        msg_error_no_indpection_item: '',
        msg_confirm_after_mainte_producing_time_reset: '',
        msg_confirm_after_mainte_shot_count_reset: '',
        msg_confirm_input_inspection_result: '',
        view_files: '',
        no_files_registered: '',
        ok: '',
        replace_or_repair_mold_part: '',
        msg_warning_not_replace_repair_parts: '',

        mold_mainte_cycle_code_01:'',
        maint_cycle_setting_value:'',
        maint_cycle_actual_value:'',

        
        after_mainte_total_expiration_time_day:'',
        after_mainte_total_production_time_hour:'',
        mold_after_mainte_total_shot_count:'',


        mold_last_production_date:'',
        mold_total_production_time_hour:'',
        mold_total_shot_count:'',
        mold_last_mainte_date:'',

      },
      allParams: {
        'moldId': '',
        'moldName': '',
        'mainteType': 0,
        'mainteTypeText': '',  //choice
        'maintenanceId': '',
        'afterMainteTotalProducingTimeHour': 0,
        'afterMainteTotalShotCount': 0,
        'resetAfterMainteTotalProducingTimeHourFlag': false,
        'resetAfterMainteTotalShotCountFlag': false,
        'measureStatus': '',
        'issueId': '', // ??id
        'temporarilySaved': 0, // 一次保存按?:1, Other:0
        'startDatetime': null,
        'endDatetime': null,
        'workingTimeMinutes': 0,
        'report': '',
        'directionId': null,
        'directionCode': null,
        'moldMaintenanceDetailVo': [
          {
            'seq': 1, //tab的索引
            'maintenanceId': '',

            'mainteReasonCategory1': '0',
            'mainteReasonCategory1Text': '',
            'mainteReasonCategory2': '0',
            'mainteReasonCategory2Text': '',
            'mainteReasonCategory3': '0',
            'mainteReasonCategory3Text': '',
            'maniteReason': '',

            'measureDirectionCategory1': '0',
            'measureDirectionCategory1Text': '',
            'measureDirectionCategory2': '0',
            'measureDirectionCategory2Text': '',
            'measureDirectionCategory3': '0',
            'measureDirectionCategory3Text': '',
            'measureDirection': ' ',

            'taskCategory1': '0',
            'taskCategory1Text': '',
            'taskCategory2': '0',
            'taskCategory2Text': '',
            'taskCategory3': '0',
            'taskCategory3Text': '',
            'task': ' ',

            'taskCategoryDefault1': '0',
            'taskCategoryDefault2': '0',
            'taskCategoryDefault3': '0',
            'moldMaintenanceDetailImageFileVos': []
          }
        ],
      },
      moldFiles: {
        'reportFilePath01': '',
        'reportFilePath02': '',
        'reportFilePath03': '',
        'reportFilePath04': '',
        'reportFilePath05': '',
        'reportFilePath06': '',
        'reportFilePath07': '',
        'reportFilePath08': '',
        'reportFilePath09': '',
        'reportFilePath10': '',
        'reportFilePathName01': '',
        'reportFilePathName02': '',
        'reportFilePathName03': '',
        'reportFilePathName04': '',
        'reportFilePathName05': '',
        'reportFilePathName06': '',
        'reportFilePathName07': '',
        'reportFilePathName08': '',
        'reportFilePathName09': '',
        'reportFilePathName10': ''
      },
      fileInfo: {
        'fileUuid': '',
        'uploadDate': '',
        'fileType': '',
        'uploadFileName': ''
      },
      allParamsResponse: {},
      //is end page or start page
      isEndPage: false,
      isReady: false,
      mainteTypeValue: '',
      measureStatus: '',
      //tab's number
      tabLinks: [{
        tabLinkId: 'mainteDetail_0',
        tabLinkText: '#  1',
        active: true
      }],
      //current tab's index
      currentTabIndex: 0,
      //the pic's index that will be edit
      editImgIndex: null,
      costMinutes: 0,
      mainteStartTime: null,
      mainteEndTime: null,
      fileListIsOpen: false,
      fileListEmptyIsOpen: false,
      fileListEmpty: true,
      mstMoldPartDetailMaintenanceList: [],

      mold_mainte_cycle_code_01_detail:'',

      //Mold Cycle condition state
      lapsed_days_after_last_maintenance_condition:'',
      prod_time_after_last_maint_condition:'',
      mold_shot_count_after_last_maint_condition:'',

      //Mold Cycle actual value state
      after_Mainte_Total_Days_Elapsed_detail:'',
      after_Mainte_Total_Producing_TimeHour_detail:'',
      after_Mainte_Total_Shot_Count_detail:'',

      mold_last_production_date_detail:'',
      mold_total_production_time_hour_detail:'',
      mold_total_shot_count_detail:'',
      mold_last_mainte_date_detail:'',
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.createPicker = this.createPicker.bind(this);
    this.clearPickerItems = this.clearPickerItems.bind(this);
    this.createPickerMaintenanceType = this.createPickerMaintenanceType.bind(this);
    this.loadPickerCategory2 = this.loadPickerCategory2.bind(this);
    this.loadPickerCategory3 = this.loadPickerCategory3.bind(this);
    this.createPickerCategory1 = this.createPickerCategory1.bind(this);
    this.createPickerCategory2 = this.createPickerCategory2.bind(this);
    this.createPickerCategory3 = this.createPickerCategory3.bind(this);
    this.handlerChangeTextarea = this.handlerChangeTextarea.bind(this);

    this.convertDateArrToStr = this.convertDateArrToStr.bind(this);
    this.converDateStrToArr = this.converDateStrToArr.bind(this);
    this.calcCostMinutes = this.calcCostMinutes.bind(this);
    //maintenanceType pickers' data
    this.maintenanceType = [];

    //maintenReason pickers' data
    this.mainteReasonCategory1 = [];
    this.mainteReasonCategory2 = [];
    this.mainteReasonCategory3 = [];

    //measuredirection tab group pickers' data
    this.measureDirectionCategory1 = [];
    this.measureDirectionCategory2 = [];
    this.measureDirectionCategory3 = [];

    //task tab group pickers' data
    this.taskCategory1 = [];
    this.taskCategory2 = [];
    this.taskCategory3 = [];

    //measureStatus pickers' data
    this.measureStatusList = [];
    this.loadDetail();
    this.detailResponse = {};
    //
    this.issueId = '';

    this.reportCategory = [];
    this.fileNameUuidList = [];

    this.fileNameUuid = [];

    this.referTblDirection = false; //手配・工事テーブルを参照するかどうか。システム設定で変わる
    this.warningReplaceRepair = this.warningReplaceRepair.bind(this);
  }

  componentDidMount() {
    var me = this;
    System.load(['system.use_direction_table_for_maintenance'])
      .then((values) => {
        me.referTblDirection = values.cnfSystems[0].configValue === '1';
        if (me.referTblDirection) {
          me.createDirectionCodeAutocomplete();
        }
      })
      .catch((err) => {
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
      inputEl: '#mold-mainte-input-page-direction-code',
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
            var newParams = me.state.allParams;
            newParams.directionId = null;
            me.setState({allParams: newParams});
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
          var newParams = me.state.allParams;
          newParams.directionId = value[0].id;
          newParams.directionCode = value[0].directionCode;
          me.setState({allParams: newParams});
          //me.loadDateByDirectionId(value[0].id);
        },
        closed: function (autocomplete) {
          if (me.state.allParams.directionId === '' || me.state.allParams.directionId === null) {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            var newParams = me.state.allParams;
            newParams.directionId = null;
            newParams.directionCode = null;
            me.setState({allParams: newParams});
          }
        }
      },
    });
  }

  removeCompletedStatus(mstChoiceVo) {
    var newMstChoice = [];
    for (var i = 0; i < mstChoiceVo.length; i++) {
      var choice = mstChoiceVo[i];
      if (choice.seq !== '50') {
        newMstChoice.push(choice);
      }
    }
    return newMstChoice;
  }

  formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  checkMoldDetails(){
    var me = this;
    var moldID = me.state.allParams.moldId;
    Mold.getMoldDetails(moldID).then((response) => {
      me.setState({mold_last_production_date_detail: response.lastProductionDateStr});
      me.setState({mold_total_production_time_hour_detail: response.totalProducingTimeHour_CommaSeparated});
      me.setState({mold_total_shot_count_detail: response.totalShotCount_CommaSeparated});
      me.setState({mold_last_mainte_date_detail: response.lastMainteDateStr});
      me.setState({mold_mainte_cycle_code_01_detail: response.mainteCycleCode01});
      me.setState({after_Mainte_Total_Producing_TimeHour_detail: response.afterMainteTotalProducingTimeHour_CommaSeparated});
      me.setState({after_Mainte_Total_Shot_Count_detail: response.afterMainteTotalShotCount_CommaSeparated});


      
      var dt1 = new Date();
      var dt2 = new Date(this.state.mold_last_mainte_date_detail);
      me.setState({after_Mainte_Total_Days_Elapsed_detail: this.formatNumber(Math.floor((Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) - Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) ) /(1000 * 60 * 60 * 24)))});
    }
    ).then(()=>{ 
      me.checkMoldCycleDetails();
    })        
      .catch(() => {
        me.$f7.preloader.hide();
      });
  }

  checkMoldCycleDetails(){
    var me = this;
    var _type = '1';
    var cycleCode = me.state.mold_mainte_cycle_code_01_detail;
    if(cycleCode !== ''){
      MaintenanceCycle.getMaintenanceCycle(_type,cycleCode).then((response) => {
        me.setState({lapsed_days_after_last_maintenance_condition: response.tblMaintenanceCyclePtnList[0].mainteConditionsCol01_CommaSeparated});
        me.setState({prod_time_after_last_maint_condition: response.tblMaintenanceCyclePtnList[0].mainteConditionsCol02_CommaSeparated});
        me.setState({mold_shot_count_after_last_maint_condition: response.tblMaintenanceCyclePtnList[0].mainteConditionsCol03_CommaSeparated});
      }
      )
        .catch(() => {
          me.$f7.preloader.hide();
        });
    }
    else
    {
      me.setState({lapsed_days_after_last_maintenance_condition: '0'});
      me.setState({prod_time_after_last_maint_condition: '0'});
      me.setState({mold_shot_count_after_last_maint_condition: '0'});
    }
  }

  loadDetail() {
    var me = this;
    //クエリパラメータで指定されたIDを取得
    var id = this.$f7route.query.id;
    //load dict first
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.checkMoldDetails();
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    //which page did user come from
    if (id) {
      me.$f7.preloader.show();
      MoldMaintenance.getReplaceRepairMoldPartList(id).then((response)=>{

        if(response.length > 0) {
          me.setState({
            mstMoldPartDetailMaintenanceList: response
          });
        } else {
          me.setState({
            showMsg: me.state.dict.mst_error_record_not_found,
            mstMoldPartDetailMaintenanceList: response
          });
        }
        me.$f7.preloader.hide();
      }).catch(function(err){
        me.$f7.preloader.hide();
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

      MoldMaintenance.getInitTabData(id)
        .then((response) => {
          this.setState({
            isEndPage: true
          });
          this.detailResponse = response;
          this.issueId = response.issueId;
          this.getUploadedFileIds(response.moldId);
          me.$f7.preloader.hide();
          if (response.moldMaintenanceDetailVo.length === 0) {
            me.initMainteDetail(response);
          } else {
            for (var index = 0; index < response.moldMaintenanceDetailVo.length; index++) {
              var mainteReasonCategory1 = response.moldMaintenanceDetailVo[index].mainteReasonCategory1;
              if (mainteReasonCategory1 === '') {
                response.moldMaintenanceDetailVo[index].mainteReasonCategory1 = '0';
              }
              var mainteReasonCategory2 = response.moldMaintenanceDetailVo[index].mainteReasonCategory2;
              if (mainteReasonCategory2 === '') {
                response.moldMaintenanceDetailVo[index].mainteReasonCategory2 = '0';
              }
              var mainteReasonCategory3 = response.moldMaintenanceDetailVo[index].mainteReasonCategory3;
              if (mainteReasonCategory3 === '') {
                response.moldMaintenanceDetailVo[index].mainteReasonCategory3 = '0';
              }

              var measureDirectionCategory1 = response.moldMaintenanceDetailVo[index].measureDirectionCategory1;
              if (measureDirectionCategory1 === '') {
                response.moldMaintenanceDetailVo[index].measureDirectionCategory1 = '0';
              }

              var measureDirectionCategory2 = response.moldMaintenanceDetailVo[index].measureDirectionCategory2;
              if (measureDirectionCategory2 === '') {
                response.moldMaintenanceDetailVo[index].measureDirectionCategory2 = '0';
              }

              var measureDirectionCategory3 = response.moldMaintenanceDetailVo[index].measureDirectionCategory3;
              if (measureDirectionCategory3 === '') {
                response.moldMaintenanceDetailVo[index].measureDirectionCategory3 = '0';
              }

              var taskCategory1 = response.moldMaintenanceDetailVo[index].taskCategory1;
              if (taskCategory1 === '') {
                response.moldMaintenanceDetailVo[index].taskCategory1 = '0';
              } else {
                response.moldMaintenanceDetailVo[index].taskCategoryDefault1 = taskCategory1;
              }

              var taskCategory2 = response.moldMaintenanceDetailVo[index].taskCategory2;
              if (taskCategory2 === '') {
                response.moldMaintenanceDetailVo[index].taskCategory2 = '0';
              } else {
                response.moldMaintenanceDetailVo[index].taskCategoryDefault2 = taskCategory2;
              }

              var taskCategory3 = response.moldMaintenanceDetailVo[index].taskCategory3;
              if (taskCategory3 === '') {
                response.moldMaintenanceDetailVo[index].taskCategory3 = '0';
              } else {
                response.moldMaintenanceDetailVo[index].taskCategoryDefault3 = taskCategory3;
              }
            }
            me.setState({
              allParams: response,
            });
            me.generateTablinks(0, response.moldMaintenanceDetailVo.length);
            me.initTabPickers(0);
            me.showPicsInTab(0);
            me.checkMoldDetails();
          }

          Choice.categories(
            'tbl_mold_maintenance_remodeling.mainte_type',
            {
              parentSeq: '',
              //langId: me.getCookieLang()
            }
          )
            .then((response) => {
              me.maintenanceType = [...response.mstChoiceVo];
              me.createPickerMaintenanceType(true);
            })
            .catch((err) => {
              me.$f7.preloader.hide();
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });

          me.loadPickerCategory1(function () {
            if (response.moldMaintenanceDetailVo[0].mainteReasonCategory1) {
              me.createPickerCategory1(true);
            } else {
              me.createPickerCategory1();
            }
          });

          if (me.issueId) {
            Choice.categories('tbl_issue.measure_status', /*{ langId: me.getCookieLang() }*/)
              .then((response) => {
                me.measureStatusList = [...response.mstChoiceVo];
                me.createPickerMeasureStatus(true);
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
    } else {
      //if refresh the page
      if (me.state.allParams.moldUuid === undefined && this.props.defaultValObject === undefined) {
        me.$f7.views.main.router.navigate(APP_DIR_PATH + '/', { reloadAll: true });
        return;
      }
      me.generateTablinks(0);
      var allParams = me.state.allParams;
      var defaultValObject = this.props.defaultValObject;
      var moldInfo = this.props.moldInfo;

      if (defaultValObject && defaultValObject.id) {
        allParams.mainteType = defaultValObject.mainteType;
        allParams.measureStatus = 10; //不具合が選択されているときのみ表示。対策中にセットする
        // allParams.moldMaintenanceDetailVo[0].mainteReasonCategory1 = defaultValObject.reportCategory1 === '' ? '0' : defaultValObject.reportCategory1;
        // allParams.moldMaintenanceDetailVo[0].mainteReasonCategory2 = defaultValObject.reportCategory2 === '' ? '0' : defaultValObject.reportCategory2;
        // allParams.moldMaintenanceDetailVo[0].mainteReasonCategory3 = defaultValObject.reportCategory3 === '' ? '0' : defaultValObject.reportCategory3;

        var reportCategory1 = defaultValObject.reportCategory1 === '' ? '0' : defaultValObject.reportCategory1;
        var reportCategory2 = defaultValObject.reportCategory2 === '' ? '0' : defaultValObject.reportCategory2;
        var reportCategory3 = defaultValObject.reportCategory3 === '' ? '0' : defaultValObject.reportCategory3;
        this.reportCategory = [
          { reportCategory: reportCategory1, isLooped: false, parentSeq: '' },
          { reportCategory: reportCategory2, isLooped: false, parentSeq: '' },
          { reportCategory: reportCategory3, isLooped: false, parentSeq: '' }
        ];

        me.getChoiceTxtBySeq();

        allParams.moldMaintenanceDetailVo[0].maniteReason = defaultValObject.issue;
        this.issueId = defaultValObject.id;
        allParams.moldId = defaultValObject.moldId;
        allParams.moldName = defaultValObject.moldName;
        allParams.moldUuid = defaultValObject.moldUuid;
        this.setState({
          allParams: allParams,
          isEndPage: false
        });
      } else {
        allParams.moldId = moldInfo.moldId;
        allParams.moldName = moldInfo.moldName;
        allParams.moldUuid = moldInfo.moldUuid;
        this.setState({
          allParams: allParams,
          isEndPage: false
        });

      }
      me.initTabPickers(0);
      me.prepareCommonPickers();
      this.getUploadedFileIds(this.state.allParams.moldId);
    }
  }

  tabChange(tabIndex) {
    this.setState({
      currentTabIndex: tabIndex,
      errorMessageTaskCategory1: '',
      errorMessageTaskCategory2: '',
      errorMessageTaskCategory3: ''
    });
    //change data when tab click
    this.initTabPickers(tabIndex);
    this.showPicsInTab(tabIndex);
  }

  //initital one tab's pickers default data
  initTabPickers(tabIndex) {
    var me = this;
    var newAllParams = this.state.allParams;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[tabIndex];
    if (moldMaintenanceDetailVo.measureDirectionCategory1) {
      this.loadPickerMeasureCate1(function () {
        me.createPickerMeasureCate1(true);
      });
    } else {
      this.loadPickerMeasureCate1(function () {
        me.createPickerMeasureCate1();
      });
    }

    if (moldMaintenanceDetailVo.taskCategory1) {
      me.loadPickerTaskCate1(function () {
        me.createPickerTaskCate1(true);
      });
    } else {
      me.loadPickerTaskCate1(function () {
        me.createPickerTaskCate1();
      });
    }
  }

  //show pics in one tab
  showPicsInTab(tabIndex) {
    if (this.$f7route.query.id) {
      this.formatPicList(tabIndex);
    }
  }

  handlerChangeTextarea(tabIndex, str, e) {
    var newAllParams = this.state.allParams;
    if (str === 'maniteReason' && tabIndex === -99) {
      newAllParams.moldMaintenanceDetailVo.map(function (item) {
        item.maniteReason = e.target.value;
        return item;
      });
    }
    else if (str === 'report' && tabIndex === -99) {
      newAllParams.report = e.target.value;
    }
    else {
      var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[tabIndex];
      moldMaintenanceDetailVo[str] = e.target.value;
    }

    this.setState({
      allParams: newAllParams
    });
  }

  clearTextarea(tabIndex, str) {
    var newAllParams = this.state.allParams;
    if (str === 'maniteReason' && tabIndex === -99) {
      newAllParams.moldMaintenanceDetailVo.map(function (item) {
        item.maniteReason = '';
        return item;
      });
    } else if (str === 'report' && tabIndex === -99) {
      newAllParams.report = '';
    }
    else {

      var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[tabIndex];
      moldMaintenanceDetailVo[str] = '';
    }

    this.setState({
      allParams: newAllParams
    });
  }

  renderTabs() {
    var me = this;
    var moldMaintenanceDetailVo = this.state.allParams.moldMaintenanceDetailVo;
    if (moldMaintenanceDetailVo.length <= 0) return;
    return moldMaintenanceDetailVo.map(function (item, index) {
      return (
        <Tab tabActive={index === me.state.currentTabIndex} id="mainteDetail_0" key={index}>
          {/* 対策指示分類 */}
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{me.state.dict.maintenance_direction_category1}</Label>
              <Input type="text" name={'measureDirectionCategory1_' + index}
                value={item.measureDirectionCategory1Text} onInputClear={me.handleClear.bind(me, 'measureDirectionCategory1_' + index, index)} required validate
                errorMessage={me.state.errorMessageCate1} errorMessageForce={me.state.errorMessageCate1 !== ''}
                readonly clearButton inputId={'mold-mainte-input-page-measure-direction-category1_' + index} />
            </ListItem>
            <ListItem>
              <Label>{me.state.dict.maintenance_direction_category2}</Label>
              <Input type="text" name={'measureDirectionCategory2_' + index}
                disabled={item.measureDirectionCategory1 === '0'}
                value={item.measureDirectionCategory2Text} onInputClear={me.handleClear.bind(me, 'measureDirectionCategory2_' + index, index)} required validate
                errorMessage={me.state.errorMessageCate2} errorMessageForce={me.state.errorMessageCate2 !== ''}
                readonly clearButton inputId={'mold-mainte-input-page-measure-direction-category2_' + index} />
            </ListItem>
            <ListItem>
              <Label>{me.state.dict.maintenance_direction_category3}</Label>
              <Input type="text" name={'measureDirectionCategory3_' + index}
                disabled={item.measureDirectionCategory2 === '0'}
                value={item.measureDirectionCategory3Text} onInputClear={me.handleClear.bind(me, 'measureDirectionCategory3_' + index, index)} required validate
                errorMessage={me.state.errorMessageCate3} errorMessageForce={me.state.errorMessageCate3 !== ''}
                readonly clearButton inputId={'mold-mainte-input-page-measure-direction-category3_' + index} />
            </ListItem>
            <ListItem>
              <Label>{me.state.dict.maintenance_direction}</Label>
              <Input type="textarea" maxlength={200} name={'measureDirection' + index} clearButton inputId={'mold-mainte-input-page-measure-direction_' + index}
                onChange={me.handlerChangeTextarea.bind(this, index, 'measureDirection')}
                onInputClear={me.clearTextarea.bind(me, index, 'measureDirection')}
                value={item.measureDirection} />
            </ListItem>
          </List>
          {/* 作業分類 */}
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{me.state.dict.inspection_task_category1}</Label>
              <Input type="text" name={'taskCategory1_' + index}
                value={item.taskCategory1Text} onInputClear={me.handleClear.bind(me, 'taskCategory1_' + index, index)} required validate
                errorMessage={me.state.errorMessageTaskCategory1} errorMessageForce={me.state.errorMessageTaskCategory1 !== ''}
                readonly clearButton inputId={'mold-mainte-input-page-task-category1_' + index} />
            </ListItem>
            <ListItem>
              <Label>{me.state.dict.inspection_task_category2}</Label>
              <Input type="text" name={'taskCategory2_' + index}
                disabled={item.taskCategory1 === '0'}
                value={item.taskCategory2Text} onInputClear={me.handleClear.bind(me, 'taskCategory2_' + index, index)} required validate
                errorMessage={me.state.errorMessageTaskCategory2} errorMessageForce={me.state.errorMessageTaskCategory2 !== ''}
                readonly clearButton inputId={'mold-mainte-input-page-task-category2_' + index} />
            </ListItem>
            <ListItem>
              <Label>{me.state.dict.inspection_task_category3}</Label>
              <Input type="text" name={'taskCategory3_' + index}
                disabled={item.taskCategory2 === '0'}
                value={item.taskCategory3Text} onInputClear={me.handleClear.bind(me, 'taskCategory3_' + index, index)} required validate
                errorMessage={me.state.errorMessageTaskCategory3} errorMessageForce={me.state.errorMessageTaskCategory3 !== ''}
                readonly clearButton inputId={'mold-mainte-input-page-task-category3_' + index} />
            </ListItem>
            <ListItem>
              <Label>{me.state.dict.mold_maintenance__task}</Label>
              <Input type="textarea" maxlength={200} name={'task_' + index} clearButton inputId={'mold-mainte-input-page-task_' + index}
                onChange={me.handlerChangeTextarea.bind(this, index, 'task')}
                onInputClear={me.clearTextarea.bind(me, index, 'task')}
                value={item.task} />
            </ListItem>
          </List>


          <Block>
            <Row>
              <Col width="33">
                <Button small fill iconF7="camera" onClick={me.buttonCameraForm.bind(me)}></Button>
              </Col>
              <Col width="33" style={{ position: 'relative', height: 28, overflow: 'hidden' }}>
                <Button small fill iconF7="photos"></Button>
                <Input type="file" id="mold-mainte-page-photos" accept="image/*" onChange={me.buttonFileSelect.bind(me)}/>
              </Col>
              <Col width="33">
                <Button className="normalFont fontWeight400" small fill onClick={me.selectItemCategory.bind(me)}>{me.state.dict.inspection_result}</Button>
              </Col>
            </Row>
          </Block>

          {/** 写真の数だけ動的生成するので別ファンクションで生成すること */}
          {
            item.moldMaintenanceDetailImageFileVos.map((picture, picIndex) => {
              return <Card key={picIndex}>
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
                        !picture.notFound
                          ?
                          <img className="contain" src={picture.src} width="100%" height="200" alt="photo_1" id={'img' + picIndex} onClick={me.sendToImgEdit.bind(me, picIndex, index)} />
                          :
                          <img className="contain" src={picture.src} style={{ background: '#fff' }} width="100%" height="200" alt="photo_1" id={'img' + picIndex} onClick={me.sendToImgEdit.bind(me, picIndex, index)} />
                      }
                    </ListItem>
                    <ListItem>
                      <Col width="50">{me.state.dict.issue_taken_date}</Col>
                      <Col width="50">{moment(new Date(picture.takenDateStr)).format('YYYY/MM/DD HH:mm')}</Col>
                    </ListItem>
                    <ListItem>
                      <Label>{me.state.dict.issue_remarks}</Label>
                      <Input type="textarea" name="photoComment_1" value={picture.remarks} clearButton onChange={me.handleImgRemark.bind(me, picIndex, index)} inputId="mold-mainte-page-photo-comment-1" maxlength={200} />
                    </ListItem>
                  </List>
                </CardContent>
                <CardFooter>
                  <p></p>
                  <Link onClick={me.deleteImg.bind(me, picIndex, index)}>{me.state.dict.delete_record}</Link>
                </CardFooter>
              </Card>;
            })
          }
        </Tab>
      );
    });
    //   : null;
  }

  initMainteDetail(response) {
    var item = {
      'seq': 1,
      'maintenanceId': '',

      'mainteReasonCategory1': '0',
      'mainteReasonCategory1Text': '',
      'mainteReasonCategory2': '0',
      'mainteReasonCategory2Text': '',
      'mainteReasonCategory3': '0',
      'mainteReasonCategory3Text': '',
      'maniteReason': '',

      'measureDirectionCategory1': '0',
      'measureDirectionCategory1Text': '',
      'measureDirectionCategory2': '0',
      'measureDirectionCategory2Text': '',
      'measureDirectionCategory3': '0',
      'measureDirectionCategory3Text': '',
      'measureDirection': '',

      'taskCategory1': '0',
      'taskCategory1Text': '',
      'taskCategory2': '0',
      'taskCategory2Text': '',
      'taskCategory3': '0',
      'taskCategory3Text': '',
      'task': '',

      'moldMaintenanceDetailImageFileVos': []
    };

    response.moldMaintenanceDetailVo.push(item);

    this.setState({
      allParams: response,
      currentTabIndex: response.moldMaintenanceDetailVo.length - 1
    });
    this.generateTablinks(1);
    this.initTabPickers(this.state.currentTabIndex);
    this.showPicsInTab(this.state.currentTabIndex);
  }

  //add one tab
  addMainteDetail() {
    var newAllParams = this.state.allParams;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo;
    var item = {
      'seq': moldMaintenanceDetailVo.length + 1,
      'maintenanceId': '',

      'mainteReasonCategory1': '0',
      'mainteReasonCategory1Text': '',
      'mainteReasonCategory2': '0',
      'mainteReasonCategory2Text': '',
      'mainteReasonCategory3': '0',
      'mainteReasonCategory3Text': '',
      'maniteReason': '',

      'measureDirectionCategory1': '0',
      'measureDirectionCategory1Text': '',
      'measureDirectionCategory2': '0',
      'measureDirectionCategory2Text': '',
      'measureDirectionCategory3': '0',
      'measureDirectionCategory3Text': '',
      'measureDirection': '',

      'taskCategory1': '0',
      'taskCategory1Text': '',
      'taskCategory2': '0',
      'taskCategory2Text': '',
      'taskCategory3': '0',
      'taskCategory3Text': '',
      'task': '',

      'moldMaintenanceDetailImageFileVos': []
    };
    if (newAllParams.moldMaintenanceDetailVo.length > 0) {
      var firstCommonItem = newAllParams.moldMaintenanceDetailVo[0];
      item.mainteReasonCategory1 = firstCommonItem.mainteReasonCategory1;
      item.mainteReasonCategory1Text = firstCommonItem.mainteReasonCategory1Text;
      item.mainteReasonCategory2 = firstCommonItem.mainteReasonCategory2;
      item.mainteReasonCategory2Text = firstCommonItem.mainteReasonCategory2Text;
      item.mainteReasonCategory3 = firstCommonItem.mainteReasonCategory3;
      item.mainteReasonCategory3Text = firstCommonItem.mainteReasonCategory3Text;
      item.maniteReason = firstCommonItem.maniteReason;
    }
    moldMaintenanceDetailVo.push(item);

    this.setState({
      allParams: newAllParams,
      currentTabIndex: moldMaintenanceDetailVo.length - 1,
      errorMessageTaskCategory1: '',
      errorMessageTaskCategory2: '',
      errorMessageTaskCategory3: ''
    }, () => {
      this.generateTablinks(1);
      this.initTabPickers(this.state.currentTabIndex);
      this.showPicsInTab(this.state.currentTabIndex);
  
      document.getElementById('mold-mainte-input-page-detail-tab').scrollIntoView(true);
  
    });
    //更新後のcurrentTabIndexに依存しているため、setStateのcallbackへ移動。
    // this.generateTablinks(1);
    // this.initTabPickers(this.state.currentTabIndex);
    // this.showPicsInTab(this.state.currentTabIndex);

    // document.getElementById('mold-mainte-input-page-detail-tab').scrollIntoView(true);
  }

  deleteMainteDetail() {
    var newAllParams = this.state.allParams;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo;
    moldMaintenanceDetailVo.splice(currentTabIndex, 1);
    this.setState({
      allParams: newAllParams,
      currentTabIndex: currentTabIndex - 1
    }, ()=> {
      this.generateTablinks(-1);
      document.getElementById('mold-mainte-input-page-detail-tab').scrollIntoView(true);
    });
    //    this.generateTablinks(-1);  //更新後のcurrentTabIndexに依存しているため、setStateのcallbackへ移動。
  }

  //if add tab, flag = 1;  if delete tab flag = -1, if show tab flag=0;
  generateTablinks(flag, num) {
    var newArr = [];
    var newAllParams = this.state.allParams;
    var len = num ? num : newAllParams.moldMaintenanceDetailVo.length;

    if (flag === 1) {
      if (this.state.isEndPage) {
        for (let i = 0; i < len; i++) {
          if (i === len - 1) {
            newArr.push({
              tabLinkId: 'mainteDetail_' + (i),
              tabLinkText: '#  ' + (i + 1),
              active: true
            });
          } else {
            newArr.push({
              tabLinkId: 'mainteDetail_' + (i),
              tabLinkText: '#  ' + (i + 1),
              active: false
            });
          }
        }
      } else {
        for (let i = 0; i < len; i++) {
          if (i === this.state.currentTabIndex) {
            newArr.push({
              tabLinkId: 'mainteDetail_' + (i),
              tabLinkText: '#  ' + (i + 1),
              active: true
            });
          } else {
            newArr.push({
              tabLinkId: 'mainteDetail_' + (i),
              tabLinkText: '#  ' + (i + 1),
              active: false
            });
          }
        }
      }
    } else if (flag === -1) {
      for (let i = 0; i < len; i++) {
        if (i === this.state.currentTabIndex) {
          newArr.push({
            tabLinkId: 'mainteDetail_' + (i),
            tabLinkText: '#  ' + (i + 1),
            active: true
          });
        } else {
          newArr.push({
            tabLinkId: 'mainteDetail_' + (i),
            tabLinkText: '#  ' + (i + 1),
            active: false
          });
        }
      }
    } else if (flag === 0) {
      for (let i = 0; i < len; i++) {
        newArr.push({
          tabLinkId: 'mainteDetail_' + (i),
          tabLinkText: '#  ' + (i + 1),
          active: false
        });
      }
      newArr[0].active = true;
    }

    this.setState({
      tabLinks: newArr
    });
  }

  //---------------------------------------------------------------------pickers---------------------------------------------
  //=======================================================reason picker=====================================================
  createPickerCategory1(setDefault) {
    var me = this;
    var newAllParams = this.state.allParams;
    if (newAllParams.id) {
      newAllParams = this.detailResponse;
    }
    // var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[0];
    if (me.pickerCategory1) {
      me.pickerCategory1.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    var data = moldMaintenanceDetailVo;

    for (var i = 0; i < me.mainteReasonCategory1.length; i++) {
      var item = me.mainteReasonCategory1[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if ((item.seq) === data.mainteReasonCategory1) {
        defaultValue = item.seq;
        defaultName = item.choice;
      }
    }
    me.pickerCategory1 = me.createPicker('#mold-mainte-input-page-mainte-reason-category1', _values, _displayValues,
      (picker, value, displayValue) => {
        const category1seq = moldMaintenanceDetailVo.mainteReasonCategory1;
        // moldMaintenanceDetailVo.mainteReasonCategory1 = value;
        // moldMaintenanceDetailVo.mainteReasonCategory1Text = displayValue;
        if (category1seq !== value) {
          newAllParams.moldMaintenanceDetailVo.map(function (item) {
            item.mainteReasonCategory1 = value;
            item.mainteReasonCategory1Text = displayValue;
            item.mainteReasonCategory2 = '0';
            item.mainteReasonCategory3 = '0';
            item.mainteReasonCategory2Text = '';
            item.mainteReasonCategory3Text = '';
            return item;
          });
        }
        me.setState({ allParams: newAllParams });
        me.loadPickerCategory2(function () {
          me.createPickerCategory2();
        });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerCategory1.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.mainteReasonCategory1 = defaultValue;
      moldMaintenanceDetailVo.mainteReasonCategory1Text = defaultName;
      me.setState({ allParams: newAllParams });
      me.loadPickerCategory2(function () {
        me.createPickerCategory2(true, data);
      });
    }
  }

  createPickerCategory2(setDefault, obj) {
    var me = this;
    var newAllParams = this.state.allParams;

    if (newAllParams.id) {
      newAllParams = this.detailResponse;
    }
    // var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[0];
    if (me.pickerCategory2) {
      me.pickerCategory2.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.mainteReasonCategory2.length; i++) {
      let item = me.mainteReasonCategory2[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if (obj && obj.mainteReasonCategory2) {
        if ((item.seq) === obj.mainteReasonCategory2) {
          defaultValue = item.seq;
          defaultName = item.choice;
          me.loadPickerCategory3(function () {
            me.createPickerCategory3(true, obj);
          });
        }
      }
    }
    me.pickerCategory2 = me.createPicker('#mold-mainte-input-page-mainte-reason-category2', _values, _displayValues,
      (picker, value, displayValue) => {
        const category2seq = moldMaintenanceDetailVo.mainteReasonCategory2;
        // moldMaintenanceDetailVo.mainteReasonCategory2 = value;
        // moldMaintenanceDetailVo.mainteReasonCategory2Text = displayValue;
        if (category2seq !== value) {
          newAllParams.moldMaintenanceDetailVo.map(function (item) {
            item.mainteReasonCategory2 = value;
            item.mainteReasonCategory2Text = displayValue;
            item.mainteReasonCategory3 = '0';
            item.mainteReasonCategory3Text = '';
            return item;
          });
        }
        me.setState({ allParams: newAllParams });
        me.loadPickerCategory3(function () {
          me.createPickerCategory3();
        });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerCategory2.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.mainteReasonCategory2 = defaultValue;
      moldMaintenanceDetailVo.mainteReasonCategory2Text = defaultName;
      me.setState({ allParams: newAllParams });
      me.loadPickerCategory3(function () {
        me.createPickerCategory3(true, obj);
      });
    }
  }

  createPickerCategory3(setDefault, obj) {
    var me = this;
    var newAllParams = this.state.allParams;
    // var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[0];
    if (me.pickerCategory3) {
      me.pickerCategory3.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.mainteReasonCategory3.length; i++) {
      let item = me.mainteReasonCategory3[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if (obj && obj.mainteReasonCategory3) {
        if ((item.seq) === obj.mainteReasonCategory3) {
          defaultValue = item.seq;
          defaultName = item.choice;
        }
      }
    }
    me.pickerCategory3 = me.createPicker('#mold-mainte-input-page-mainte-reason-category3', _values, _displayValues,
      (picker, value, displayValue) => {
        // moldMaintenanceDetailVo.mainteReasonCategory3 = value;
        // moldMaintenanceDetailVo.mainteReasonCategory3Text = displayValue;
        newAllParams.moldMaintenanceDetailVo.map(function (item) {
          item.mainteReasonCategory3 = value;
          item.mainteReasonCategory3Text = displayValue;
          return item;
        });
        me.setState({ allParams: newAllParams });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerCategory3.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.mainteReasonCategory3 = defaultValue;
      moldMaintenanceDetailVo.mainteReasonCategory3Text = defaultName;
      me.setState({ allParams: newAllParams });
    }
  }

  loadPickerCategory1(callback) {
    var me = this;
    Choice.categories('tbl_mold_maintenance_detail.mainte_reason_category1', {
      parentSeq: '',
      //langId: me.getCookieLang()
    })
      .then((response) => {
        me.mainteReasonCategory1 = [...response.mstChoiceVo];
        callback();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  loadPickerCategory2(callback) {
    var me = this;
    var moldMaintenanceDetailVo = this.state.allParams.moldMaintenanceDetailVo[0];
    var category1seq = moldMaintenanceDetailVo.mainteReasonCategory1;
    var obj = me.mainteReasonCategory1.find((item) => { return (item.seq === category1seq); });
    if (obj && obj.seq) {
      Choice.categories('tbl_mold_maintenance_detail.mainte_reason_category2', {
        parentSeq: obj.seq,
        //langId: me.getCookieLang()
      })
        .then((response) => {
          me.mainteReasonCategory2 = [...response.mstChoiceVo];
          callback();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  loadPickerCategory3(callback) {
    var me = this;
    var moldMaintenanceDetailVo = this.state.allParams.moldMaintenanceDetailVo[0];
    var category2seq = moldMaintenanceDetailVo.mainteReasonCategory2;
    var obj = me.mainteReasonCategory2.find((item) => { return (item.seq === category2seq); });
    if (obj && obj.seq) {
      Choice.categories('tbl_mold_maintenance_detail.mainte_reason_category3', {
        parentSeq: obj.seq,
        //langId: me.getCookieLang()
      })
        .then((response) => {
          me.mainteReasonCategory3 = [...response.mstChoiceVo];
          callback();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  //=======================================================measure pickers=================================================
  createPickerMeasureCate1(setDefault) {
    var me = this;
    var newAllParams = this.state.allParams;
    if (newAllParams.id) {
      newAllParams = this.detailResponse;
    }
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[currentTabIndex];
    if (me.pickerMeasureCate1) {
      me.pickerMeasureCate1.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    var data = moldMaintenanceDetailVo;
    for (var i = 0; i < me.measureDirectionCategory1.length; i++) {
      var item = me.measureDirectionCategory1[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if ((item.seq) === data.measureDirectionCategory1) {
        defaultValue = item.seq;
        defaultName = item.choice;
        me.loadPickerMeasureCate2(function () {
          me.createPickerMeasureCate2(true, data);
        });
      }
    }
    me.pickerMeasureCate1 = me.createPicker('#mold-mainte-input-page-measure-direction-category1_' + (currentTabIndex), _values, _displayValues,
      (picker, value, displayValue) => {
        const MeasureCategory1seq = moldMaintenanceDetailVo.measureDirectionCategory1;
        moldMaintenanceDetailVo.measureDirectionCategory1 = value;
        moldMaintenanceDetailVo.measureDirectionCategory1Text = displayValue;
        if (MeasureCategory1seq !== value) {
          moldMaintenanceDetailVo.measureDirectionCategory2 = '0';
          moldMaintenanceDetailVo.measureDirectionCategory2Text = '';
          moldMaintenanceDetailVo.measureDirectionCategory3 = '0';
          moldMaintenanceDetailVo.measureDirectionCategory3Text = '';
        }
        me.setState({ allParams: newAllParams });
        me.loadPickerMeasureCate2(function () {
          me.createPickerMeasureCate2();
        });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMeasureCate1.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.measureDirectionCategory1 = defaultValue;
      moldMaintenanceDetailVo.measureDirectionCategory1Text = defaultName;
      me.setState({ allParams: newAllParams });
      me.loadPickerMeasureCate2(function () {
        me.createPickerMeasureCate2(true, data);
      });
    }
  }

  createPickerMeasureCate2(setDefault, obj) {
    var me = this;
    var newAllParams = this.state.allParams;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[currentTabIndex];
    if (me.pickerMeasureCate2) {
      me.pickerMeasureCate2.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.measureDirectionCategory2.length; i++) {
      let item = me.measureDirectionCategory2[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if (obj && obj.measureDirectionCategory2) {
        if ((item.seq) === obj.measureDirectionCategory2) {
          defaultValue = item.seq;
          defaultName = item.choice;
          me.loadPickerMeasureCate3(function () {
            me.createPickerMeasureCate3(true, obj);
          });
        }
      }
    }
    me.pickerMeasureCate2 = me.createPicker('#mold-mainte-input-page-measure-direction-category2_' + (currentTabIndex), _values, _displayValues,
      (picker, value, displayValue) => {
        const MeasureCategory2seq = moldMaintenanceDetailVo.measureDirectionCategory2;
        moldMaintenanceDetailVo.measureDirectionCategory2 = value;
        moldMaintenanceDetailVo.measureDirectionCategory2Text = displayValue;
        if (MeasureCategory2seq !== value) {
          moldMaintenanceDetailVo.measureDirectionCategory3 = '0';
          moldMaintenanceDetailVo.measureDirectionCategory3Text = '';
        }
        me.setState({ allParams: newAllParams });
        me.loadPickerMeasureCate3(function () {
          me.createPickerMeasureCate3();
        });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMeasureCate2.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.measureDirectionCategory2 = defaultValue;
      moldMaintenanceDetailVo.measureDirectionCategory2Text = defaultName;
      me.setState({ allParams: newAllParams });
      me.loadPickerMeasureCate3(function () {
        me.createPickerMeasureCate3(true, obj);
      });
    }
  }

  createPickerMeasureCate3(setDefault, obj) {
    var me = this;
    var newAllParams = this.state.allParams;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[currentTabIndex];
    if (me.pickerMeasureCate3) {
      me.pickerMeasureCate3.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.measureDirectionCategory3.length; i++) {
      let item = me.measureDirectionCategory3[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if (obj && obj.measureDirectionCategory3) {
        if ((item.seq) === obj.measureDirectionCategory3) {
          defaultValue = item.seq;
          defaultName = item.choice;
        }
      }
    }
    me.pickerMeasureCate3 = me.createPicker('#mold-mainte-input-page-measure-direction-category3_' + (currentTabIndex), _values, _displayValues,
      (picker, value, displayValue) => {
        moldMaintenanceDetailVo.measureDirectionCategory3 = value;
        moldMaintenanceDetailVo.measureDirectionCategory3Text = displayValue;
        me.setState({ allParams: newAllParams });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMeasureCate3.setValue([defaultValue], 0);

      moldMaintenanceDetailVo.measureDirectionCategory3 = defaultValue;
      moldMaintenanceDetailVo.measureDirectionCategory3Text = defaultName;
      me.setState({ allParams: newAllParams });
    }
  }

  loadPickerMeasureCate1(callback) {
    var me = this;
    Choice.categories('tbl_mold_maintenance_detail.measure_direction_category1', {
      parentSeq: '',
      //langId: me.getCookieLang()
    })
      .then((response) => {
        me.measureDirectionCategory1 = [...response.mstChoiceVo];
        callback();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  loadPickerMeasureCate2(callback) {
    var me = this;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = this.state.allParams.moldMaintenanceDetailVo[currentTabIndex];
    var MeasureCategory1seq = moldMaintenanceDetailVo.measureDirectionCategory1;
    var bool = me.measureDirectionCategory1.find((item) => { return (item.seq === MeasureCategory1seq); });
    if (bool) {
      Choice.categories('tbl_mold_maintenance_detail.measure_direction_category2', {
        parentSeq: MeasureCategory1seq,
        //langId: me.getCookieLang()
      })
        .then((response) => {
          me.measureDirectionCategory2 = [...response.mstChoiceVo];
          callback();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  loadPickerMeasureCate3(callback) {
    var me = this;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = this.state.allParams.moldMaintenanceDetailVo[currentTabIndex];
    var MeasureCategory2seq = moldMaintenanceDetailVo.measureDirectionCategory2;
    var bool = me.measureDirectionCategory2.find((item) => { return (item.seq === MeasureCategory2seq); });
    if (bool) {
      Choice.categories('tbl_mold_maintenance_detail.measure_direction_category3', {
        parentSeq: MeasureCategory2seq,
        //langId: me.getCookieLang()
      })
        .then((response) => {
          me.measureDirectionCategory3 = [...response.mstChoiceVo];
          callback();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  //=======================================================task picker=====================================================
  createPickerTaskCate1(setDefault) {
    var me = this;
    var newAllParams = this.state.allParams;
    if (newAllParams.id) {
      newAllParams = this.detailResponse;
    }
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[currentTabIndex];
    if (me.pickerTaskCate1) {
      me.pickerTaskCate1.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    var data = moldMaintenanceDetailVo;
    for (var i = 0; i < me.taskCategory1.length; i++) {
      var item = me.taskCategory1[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if ((item.seq) === data.taskCategory1) {
        defaultValue = item.seq;
        defaultName = item.choice;
        me.loadPickerTaskCate2(function () {
          me.createPickerTaskCate2(true, data);
        });
      }
    }
    me.pickerTaskCate1 = me.createPicker('#mold-mainte-input-page-task-category1_' + (currentTabIndex), _values, _displayValues,
      (picker, value, displayValue) => {
        const taskCategory1seq = moldMaintenanceDetailVo.taskCategory1;
        moldMaintenanceDetailVo.taskCategory1 = value;
        moldMaintenanceDetailVo.taskCategory1Text = displayValue;
        if (taskCategory1seq !== value) {
          moldMaintenanceDetailVo.taskCategory2 = '0';
          moldMaintenanceDetailVo.taskCategory2Text = '';
          moldMaintenanceDetailVo.taskCategory3 = '0';
          moldMaintenanceDetailVo.taskCategory3Text = '';
        }
        me.setState({
          allParams: newAllParams,
          errorMessageTaskCategory1: ''
        });
        me.loadPickerTaskCate2(function () {
          me.createPickerTaskCate2();
        });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerTaskCate1.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.taskCategory1 = defaultValue;
      moldMaintenanceDetailVo.taskCategory1Text = defaultName;
      me.setState({allParams: newAllParams});
      me.loadPickerTaskCate2(function () {
        me.createPickerTaskCate2(true, data);
      });
    }
  }

  createPickerTaskCate2(setDefault, obj) {
    var me = this;
    var newAllParams = this.state.allParams;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[currentTabIndex];
    if (me.pickerTaskCate2) {
      me.pickerTaskCate2.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.taskCategory2.length; i++) {
      let item = me.taskCategory2[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if (obj && obj.taskCategory2) {
        if ((item.seq) === obj.taskCategory2) {
          defaultValue = item.seq;
          defaultName = item.choice;
          me.loadPickerTaskCate3(function () {
            me.createPickerTaskCate3(true, obj);
          });
        }
      }
    }
    me.pickerTaskCate2 = me.createPicker('#mold-mainte-input-page-task-category2_' + (currentTabIndex), _values, _displayValues,
      (picker, value, displayValue) => {
        const taskCategory2seq = moldMaintenanceDetailVo.taskCategory2;
        moldMaintenanceDetailVo.taskCategory2 = value;
        moldMaintenanceDetailVo.taskCategory2Text = displayValue;
        if (taskCategory2seq !== value) {
          moldMaintenanceDetailVo.taskCategory3 = '0';
          moldMaintenanceDetailVo.taskCategory3Text = '';
        }
        me.setState({
          allParams: newAllParams,
          errorMessageTaskCategory2: ''
        });
        me.loadPickerTaskCate3(function () {
          me.createPickerTaskCate3();
        });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerTaskCate2.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.taskCategory2 = defaultValue;
      moldMaintenanceDetailVo.taskCategory2Text = defaultName;
      me.setState({ allParams: newAllParams });
      me.loadPickerTaskCate3(function () {
        me.createPickerTaskCate3(true, obj);
      });
    }
  }

  createPickerTaskCate3(setDefault, obj) {
    var me = this;
    var newAllParams = this.state.allParams;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[currentTabIndex];
    if (me.pickerTaskCate3) {
      me.pickerTaskCate3.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.taskCategory3.length; i++) {
      let item = me.taskCategory3[i];
      _values.push(item.seq);
      _displayValues.push(item.choice);
      if (obj && obj.taskCategory3) {
        if ((item.seq) === obj.taskCategory3) {
          defaultValue = item.seq;
          defaultName = item.choice;
        }
      }
    }
    me.pickerTaskCate3 = me.createPicker('#mold-mainte-input-page-task-category3_' + (currentTabIndex), _values, _displayValues,
      (picker, value, displayValue) => {
        moldMaintenanceDetailVo.taskCategory3 = value;
        moldMaintenanceDetailVo.taskCategory3Text = displayValue;
        me.setState({
          allParams: newAllParams,
          errorMessageTaskCategory3: ''
        });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerTaskCate3.setValue([defaultValue], 0);
      moldMaintenanceDetailVo.taskCategory3 = defaultValue;
      moldMaintenanceDetailVo.taskCategory3Text = defaultName;
      me.setState({ allParams: newAllParams });
    }
  }

  loadPickerTaskCate1(callback) {
    var me = this;
    Choice.categories('mst_mold_inspection_item.task_category1', {
      parentSeq: '',
      //langId: me.getCookieLang()
    })
      .then((response) => {
        me.taskCategory1 = [...response.mstChoiceVo];
        callback();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  loadPickerTaskCate2(callback) {
    var me = this;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = this.state.allParams.moldMaintenanceDetailVo[currentTabIndex];
    var taskCategory1seq = moldMaintenanceDetailVo.taskCategory1;
    var bool = me.taskCategory1.find((item) => { return (item.seq === taskCategory1seq); });
    if (bool) {
      Choice.categories('mst_mold_inspection_item.task_category2', {
        parentSeq: taskCategory1seq,
        //langId: me.getCookieLang()
      })
        .then((response) => {
          me.taskCategory2 = [...response.mstChoiceVo];
          callback();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  loadPickerTaskCate3(callback) {
    var me = this;
    var currentTabIndex = this.state.currentTabIndex;
    var moldMaintenanceDetailVo = this.state.allParams.moldMaintenanceDetailVo[currentTabIndex];
    var taskCategory2seq = moldMaintenanceDetailVo.taskCategory2;
    var bool = me.taskCategory2.find((item) => { return (item.seq === taskCategory2seq); });
    if (bool) {
      Choice.categories('mst_mold_inspection_item.task_category3', {
        parentSeq: taskCategory2seq,
        //langId: me.getCookieLang()
      })
        .then((response) => {
          me.taskCategory3 = [...response.mstChoiceVo];
          callback();
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

  buttonCameraForm() {
    this.$f7router.navigate(APP_DIR_PATH + '/imgcap', {props: { onCapture: this.onImgCapture.bind(this) } });
  }

  replaceMessageError(newValue){
    return this.state.dict.msg_error_not_null_with_item.replace('%s', newValue);
  }

  checkTaskCategoryNotNull(task){
    return task.taskCategory1!=='0';
  }

  checkTaskCategoryIsChanged(task){
    const isChange = task.taskCategory1!==task.taskCategoryDefault1 || task.taskCategory2!==task.taskCategoryDefault2 || task.taskCategory3!==task.taskCategoryDefault3;
    const isNotAnwser = this.checkIsNotAnwser(task);
    const isNotNull = this.checkTaskCategoryNotNull(task);
    return isNotNull && (isChange || isNotAnwser);
  }

  checkIsNotAnwser(task) {
    if (!task.moldInspectionResultVos) return true;
    let inspectionResult = task.moldInspectionResultVos.find((item) => item.inspectionResult && item.inspectionResult !== '' );
    return !inspectionResult;
  }

  async popupQuestionRegsiter() {
    const me = this;
    const taskCate = this.state.allParams.moldMaintenanceDetailVo.find((item) => me.checkTaskCategoryIsChanged(item) );
    let machineInspection = [];
    let currentTabIndex = 0;
    if (taskCate) {
      currentTabIndex = taskCate.seq-1;
      await this.getMoldInspectionItem(taskCate, currentTabIndex);
      machineInspection = this.state.allParams.moldMaintenanceDetailVo[currentTabIndex].moldInspectionResultVos;
    }
    if (!taskCate || !machineInspection.length) {
      return this.buttonEndRegister();
    }
    this.$f7.dialog.create({
      title: this.state.dict.application_title,
      text: this.state.dict.msg_confirm_input_inspection_result,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          me.openPageInsp(currentTabIndex);
        }
      },
      {
        text: this.state.dict.no,
        onClick: function () {
          let newAllParams = me.state.allParams;
          newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldInspectionResultVos = [];
          me.setState({allParams: newAllParams});
          me.buttonEndRegister();
        }
      }]
    }).open();
  }

  async getMoldInspectionItem(taskCate, currentTabIndex){
    const me = this;
    const params = `taskCategory1=${taskCate.taskCategory1}&taskCategory2=${taskCate.taskCategory2}&taskCategory3=${taskCate.taskCategory3}`;
    await MoldMaintenance.getItems(params)
      .then((response) => {
        let newAllParams = this.state.allParams;
        if (response.moldInspectionItemVos.length) {
          newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldInspectionResultVos = response.moldInspectionItemVos;
          newAllParams.moldMaintenanceDetailVo[currentTabIndex].taskCategoryDefault1 = taskCate.taskCategory1;
          newAllParams.moldMaintenanceDetailVo[currentTabIndex].taskCategoryDefault2 = taskCate.taskCategory2;
          newAllParams.moldMaintenanceDetailVo[currentTabIndex].taskCategoryDefault3 = taskCate.taskCategory3;
        } else {
          newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldInspectionResultVos = [];
        }
        me.setState({allParams: newAllParams});
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  async selectItemCategory() {
    const dict = this.state.dict;
    const currentTabIndex = this.state.currentTabIndex;
    const taskCate = this.state.allParams.moldMaintenanceDetailVo[currentTabIndex];
    if (!this.checkTaskCategoryNotNull(taskCate)) {
      return this.setState({
        errorMessageTaskCategory1: taskCate.taskCategory1==='0' ? this.replaceMessageError(dict.inspection_task_category1) : ''
      });
    }
    if (taskCate.moldInspectionResultVos && taskCate.moldInspectionResultVos.length && taskCate.taskCategory1===taskCate.taskCategoryDefault1 && taskCate.taskCategory2===taskCate.taskCategoryDefault2 && taskCate.taskCategory3===taskCate.taskCategoryDefault3) {
      return this.openPageInsp(currentTabIndex);
    }
    await this.getMoldInspectionItem(taskCate, currentTabIndex);
    const newAllParams = this.state.allParams.moldMaintenanceDetailVo[currentTabIndex];
    if (newAllParams.moldInspectionResultVos && newAllParams.moldInspectionResultVos.length) {
      return this.openPageInsp(currentTabIndex);
    }
    this.$f7.dialog.alert(this.state.dict.msg_error_no_indpection_item);
  }

  openPageInsp(currentTabIndex){
    const moldInfo = {...this.props.moldInfo,...this.state.allParams};
    this.props.sendMoldInfo(moldInfo);
    this.$f7router.navigate(`${APP_DIR_PATH}/mold-mainte-insp?tab=${currentTabIndex}`);
  }

  onImgCapture(captured) {
    let me = this;
    let currentTabIndex = me.state.currentTabIndex;
    let type = captured.blob.type;
    let fileExtension = '.jpg';
    if (type.indexOf('png') >= 0) {
      fileExtension = '.png';
    }
    if (type.indexOf('gif') >= 0) {
      fileExtension = '.gif';
    }
    let newAllParams = this.state.allParams;
    let picList = newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldMaintenanceDetailImageFileVos;
    let seq = 1;
    if (picList.length !== 0) {
      seq = parseInt(newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldMaintenanceDetailImageFileVos[picList.length - 1].seq) + 1;
    }
    let src = captured.dataUrl;
    var fileOfBlob = new File([captured.blob], new Date().getTime() + fileExtension);
    picList.push({
      fileUuid: null,
      fileExtension: fileExtension,
      fileType: 1,
      remarks: '',
      seq: seq + '',
      src: src,
      file: fileOfBlob,
      takenDateStr: moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
    });
    me.setState({
      allParams: newAllParams
    });
  }
  /**
    * ファイル選択ボタン
    */
  buttonFileSelect(event) {
    let me = this;
    let currentTabIndex = me.state.currentTabIndex;
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

    let newAllParams = this.state.allParams;
    let picList = newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldMaintenanceDetailImageFileVos;
    let seq = 1;
    if (picList.length !== 0) {
      seq = parseInt(newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldMaintenanceDetailImageFileVos[picList.length - 1].seq) + 1;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      let src = e.target.result;
      FileUtil.shrinkImg(src, 750, 1000).then(shrinked=>{
        picList.push({
          fileUuid: null,
          fileExtension: fileExtension,
          fileType: 1,
          remarks: '',
          seq: seq + '',
          src: shrinked.dataUrl,
          file: new File([shrinked.blob], new Date().getTime() + fileExtension),
          takenDateStr: moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
        });
        me.setState({
          allParams: newAllParams
        });
        let fileInput = document.getElementById('mold-mainte-page-photos').childNodes;
        fileInput[0].value = '';
      });
    };
  }

  sendToImgEdit(editImgIndex, tabIndex, event) {
    const img = event.target;
    if (!img.src) {
      alert('Edit target is not captured.');
    } else {
      this.setState({
        editImgIndex: editImgIndex
      });
      this.$f7router.navigate(APP_DIR_PATH + '/imgedit', {props: { onCapture: this.onImgEdited.bind(this), imageSrc: img } });
    }
  }

  onImgEdited(edited) {
    var editImgIndex = this.state.editImgIndex;
    var currentTabIndex = this.state.currentTabIndex;
    var newAllParams = this.state.allParams;
    if (this.state.editImgIndex !== null) {
      let picList = newAllParams.moldMaintenanceDetailVo[currentTabIndex].moldMaintenanceDetailImageFileVos[editImgIndex];
      picList.file = edited.blob;
      picList.fileUuid = null;
      picList.src = edited.dataUrl;
      this.setState({
        allParams: newAllParams
      });
    }
  }

  handleImgRemark(index, tabIndex, event) {
    var newAllParams = this.state.allParams;
    let picList = newAllParams.moldMaintenanceDetailVo[tabIndex].moldMaintenanceDetailImageFileVos;
    picList[index]['remarks'] = event.target.value;
    this.setState({
      allParams: newAllParams
    });
  }

  deleteImg(index, tabIndex) {
    let me = this;
    me.$f7.dialog.create({
      title:me.state.dict.application_title,
      text: me.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          let newAllParams = me.state.allParams;
          let picList = newAllParams.moldMaintenanceDetailVo[tabIndex].moldMaintenanceDetailImageFileVos;
          picList.splice(index, 1);
          me.setState({
            allParams: newAllParams
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

  getCookieLang() {
    const cookies = new Cookies();
    return cookies.get('LANG');
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

  afterOpenModal() {
    var me = this;
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
    if (this.endTimePicker) {
      this.endTimePicker.destroy();
    }
    const app = this.$f7;
    var allParams = this.state.allParams;
    this.startTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#mold-mainte-input-page-start-time');
    //開始日付に金型メンテナンス開始登録時の時刻をセット
    var startDatetime = this.state.allParams.startDatetime;
    var endDatetime = null;
    var today = new Date();
    var todayStr = me.convertDateArrToStr([today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()]);
    if (!startDatetime) {
      startDatetime = todayStr;
    }
    endDatetime = todayStr;
    this.setState({
      costMinutes: me.calcCostMinutes(startDatetime, endDatetime)
    });

    this.startTimePicker.setValue(this.converDateStrToArr(startDatetime), 0);
    allParams.startDatetime = startDatetime;
    allParams.endDatetime = endDatetime;
    this.startTimePicker.on('change', function (picker, value) {
      allParams.startDatetime = me.convertDateArrToStr(value) + ':' + today.getSeconds();
      me.setState({
        allParams: allParams,
        costMinutes: me.calcCostMinutes(me.convertDateArrToStr(value), allParams.endDatetime)
      });
    });

    //終了日付に現在時刻をデフォルトセット
    this.endTimePicker = CalendarUtil.createDateTimePicker(app, this.state.dict.close, '#mold-mainte-input-page-end-time');
    this.endTimePicker.setValue([today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds()], 0);
    this.endTimePicker.on('change', function (picker, value) {
      allParams.endDatetime = me.convertDateArrToStr(value) + ':' + today.getSeconds();
      me.setState({
        allParams: allParams,
        costMinutes: me.calcCostMinutes(allParams.startDatetime, me.convertDateArrToStr(value))
      });
    });

  }

  closeModal() {
    this.setState({ modalIsOpen: false });
    this.setState({ fileListIsOpen: false });
    this.setState({ fileListEmptyIsOpen: false });
  }

  handleChangeCostMinutes(e) {
    this.setState({
      costMinutes: e.target.value
    });
  }

  handleChange(event) {
    var newAllParams = this.state.allParams;
    newAllParams[event.target.name] = event.target.value;
    this.setState({allParams: newAllParams});
  }

  formatPicList(tabIndex) {
    var me = this;
    var newAllParams = this.state.allParams;
    var arr = newAllParams.moldMaintenanceDetailVo[tabIndex].moldMaintenanceDetailImageFileVos;
    if (arr && arr.length <= 0) return;
    for (let key in arr) {
      let value = arr[key];
      this.imgLoad(API_BASE_URL + 'files/downloadImageVideo/image/' + value.fileUuid).then((response) => {
        arr[key]['src'] = response.src;
        arr[key]['file'] = response.blob;

        me.setState({
          allParams: newAllParams
        });
      }).catch(() => {
        arr[key]['src'] = '';
        arr[key]['file'] = '';
        arr[key]['notFound'] = '1';
        me.setState({
          allParams: newAllParams
        });
      });
    }
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
    * ページ終了処理
    */
  onPageBeforeRemove() {
    if (this.startTimePicker) {
      this.startTimePicker.destroy();
    }
    if (this.endTimePicker) {
      this.endTimePicker.destroy();
    }
    if (this.pickerMaintenanceType) {
      this.pickerMaintenanceType.destroy();
    }
    if (this.pickerCategory1) {
      this.pickerCategory1.destroy();
    }
    if (this.pickerCategory2) {
      this.pickerCategory2.destroy();
    }
    if (this.pickerCategory3) {
      this.pickerCategory3.destroy();
    }
  }

  /**
    * 戻る
    */
  onBackClick() {
    //ひとつ前の画面に戻る
    // this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-start-issue', { pushState: false, reloadAll: true });
    this.clearProps();
    this.$f7router.back();
  }

  getChoiceTxtBySeq() {
    let me = this;

    let allParams = this.state.allParams;
    let reportCategory = this.reportCategory;

    for (let index = 0; index < reportCategory.length; index++) {
      let categoryData = [];
      let choiceTxtBySeqData = [];
      if (reportCategory[index].isLooped === false) {
        reportCategory[index].isLooped = true;
        if (reportCategory[index].reportCategory !== '0') {
          let mainteCategory = 'tbl_mold_maintenance_detail.mainte_reason_category' + (index + 1);
          Choice.categories(mainteCategory, {
            parentSeq: index === 0 ? '' : reportCategory[index - 1].parentSeq,
            //langId: me.getCookieLang()
          })
            .then((response1) => {
              //get data
              categoryData = response1.mstChoiceVo;
              let category = 'tbl_issue.report_category' + (index + 1);
              Choice.GetChoiceTxtBySeq(
                category,
                {
                  seq: reportCategory[index].reportCategory,
                  //langId: me.getCookieLang()
                }
              )
                .then((response2) => {
                  choiceTxtBySeqData = response2.mstChoice;
                  for (let i = 0; i < categoryData.length; i++) {
                    if (choiceTxtBySeqData[0].choice === categoryData[i].choice) {
                      if (index === 0) {
                        allParams.moldMaintenanceDetailVo[0].mainteReasonCategory1 = categoryData[i].seq;
                      } else if (index === 1) {
                        allParams.moldMaintenanceDetailVo[0].mainteReasonCategory2 = categoryData[i].seq;
                      } else if (index === 2) {
                        allParams.moldMaintenanceDetailVo[0].mainteReasonCategory3 = categoryData[i].seq;
                      }

                      reportCategory[index].parentSeq = categoryData[i].seq;
                      this.reportCategory = reportCategory;
                      me.setState({
                        allParams: allParams,
                        isEndPage: false
                      });

                      me.createPickerCategory1(true);
                      me.createPickerCategory2(true);
                      me.createPickerCategory3(true);
                      break;
                    }
                  }

                  if (reportCategory[index].parentSeq !== '') {
                    me.getChoiceTxtBySeq();
                  }

                })
                .catch((err) => {
                  let error = err;
                  me.setState(() => { throw new UnexpectedError(error); });
                });
            })
            .catch((err) => {
              let error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        }

        break;
      }
    }

  }

  prepareCommonPickers() {
    var me = this;
    //get data mainte_type
    Choice.categories(
      'tbl_mold_maintenance_remodeling.mainte_type',
      {
        parentSeq: ''//,
        //langId: me.getCookieLang()
      }
    )
      .then((response) => {
        me.maintenanceType = [...response.mstChoiceVo];
        me.createPickerMaintenanceType(true);
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    //get data reason_category1
    me.loadPickerCategory1(function () {
      if (me.state.allParams.moldMaintenanceDetailVo[0].mainteReasonCategory1) {
        me.createPickerCategory1(true);
      } else {
        me.createPickerCategory1();
      }
    });

    //get data measure_status
    if (this.issueId) {
      Choice.categories('tbl_issue.measure_status', { /*langId: me.getCookieLang()*/ })
        .then((response) => {
          if (!this.$f7route.query.id) {
            //新規開始のときは完了を選択できないようにする
            me.measureStatusList = me.removeCompletedStatus([...response.mstChoiceVo]);
          }
          else {
            me.measureStatusList = [...response.mstChoiceVo];
          }
          me.createPickerMeasureStatus(true);
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }

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

  createPickerMaintenanceType(setDefault) {
    var me = this;
    var newAllParams = this.state.allParams;
    if (me.pickerMaintenanceType) {
      me.pickerMaintenanceType.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = '';
    var defaultName = '';
    for (var i = 0; i < me.maintenanceType.length; i++) {
      let maintenanceTypeItem = me.maintenanceType[i];
      _values.push(maintenanceTypeItem.seq);
      _displayValues.push(maintenanceTypeItem.choice);
      if (maintenanceTypeItem.seq === String(newAllParams.mainteType)) {
        defaultValue = maintenanceTypeItem.seq;
        defaultName = maintenanceTypeItem.choice;
      }
    }
    me.pickerMaintenanceType = me.createPicker('#mold-mainte-input-page-maintenance-type', _values, _displayValues,
      (picker, value, displayValue) => {
        newAllParams.mainteType = value;
        me.state.mainteTypeValue = displayValue;
        me.setState({ allParams: newAllParams });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMaintenanceType.setValue([defaultValue], 0);
      me.state.mainteTypeValue = defaultName;
    }
  }

  createPickerMeasureStatus(setDefault) {
    var me = this;
    var newAllParams = this.state.allParams;
    if (me.pickerMeasureStatus) {
      me.pickerMeasureStatus.destroy();
    }
    var _values = [];
    var _displayValues = [];
    var defaultValue = '';
    var defaultName = '';
    for (var i = 0; i < me.measureStatusList.length; i++) {
      let measureStatusItem = me.measureStatusList[i];
      _values.push(measureStatusItem.seq);
      _displayValues.push(measureStatusItem.choice);
      if (measureStatusItem.seq === String(newAllParams.measureStatus)) {
        defaultValue = measureStatusItem.seq;
        defaultName = measureStatusItem.choice;
      }
    }
    me.pickerMeasureStatus = me.createPicker('#mold-mainte-input-page-measure-status', _values, _displayValues,
      (picker, value, displayValue) => {
        newAllParams.measureStatus = value;
        me.setState({ measureStatus: displayValue });
        me.setState({ allParams: newAllParams });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerMeasureStatus.setValue([defaultValue], 0);
      me.setState({ measureStatus: defaultName });
    }
  }

  handleClear(str, tabIndex) {

    this.clearPickerItems(str, tabIndex);
  }



  handleClearText(event) {
    var newAllParams = this.state.allParams;
    newAllParams[event.target.name] = '';
    this.setState({allParams: newAllParams});
  }

  clearPickerItems(str, tabIndex) {
    var newAllParams = this.state.allParams;
    if (tabIndex !== -99) {
      var moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo[tabIndex];
      // 対策指示大分類
      if (str === 'measureDirectionCategory1_' + tabIndex) {
        moldMaintenanceDetailVo.measureDirectionCategory1 = '0';
        moldMaintenanceDetailVo.measureDirectionCategory2 = '0';
        moldMaintenanceDetailVo.measureDirectionCategory3 = '0';
        moldMaintenanceDetailVo.measureDirectionCategory1Text = '';
        moldMaintenanceDetailVo.measureDirectionCategory2Text = '';
        moldMaintenanceDetailVo.measureDirectionCategory3Text = '';

        this.createPickerMeasureCate1(false);
      }
      // 対策指示中分類

      if (str === 'measureDirectionCategory2_' + tabIndex) {
        moldMaintenanceDetailVo.measureDirectionCategory2 = '0';
        moldMaintenanceDetailVo.measureDirectionCategory3 = '0';
        moldMaintenanceDetailVo.measureDirectionCategory2Text = '';
        moldMaintenanceDetailVo.measureDirectionCategory3Text = '';
        this.createPickerMeasureCate2(false);
      }
      // 対策指示小分類

      if (str === 'measureDirectionCategory3_' + tabIndex) {
        moldMaintenanceDetailVo.measureDirectionCategory3 = '0';
        moldMaintenanceDetailVo.measureDirectionCategory3Text = '';

        this.createPickerMeasureCate3(false);
      }
      // 作業大分類
      if (str === 'taskCategory1_' + tabIndex) {
        moldMaintenanceDetailVo.taskCategory1 = '0';
        moldMaintenanceDetailVo.taskCategory2 = '0';
        moldMaintenanceDetailVo.taskCategory3 = '0';
        moldMaintenanceDetailVo.taskCategory1Text = '';
        moldMaintenanceDetailVo.taskCategory2Text = '';
        moldMaintenanceDetailVo.taskCategory3Text = '';
        this.createPickerTaskCate1(false);
      }

      // 作業中分類
      if (str === 'taskCategory2_' + tabIndex) {
        moldMaintenanceDetailVo.taskCategory2 = '0';
        moldMaintenanceDetailVo.taskCategory3 = '0';
        moldMaintenanceDetailVo.taskCategory2Text = '';
        moldMaintenanceDetailVo.taskCategory3Text = '';
        this.createPickerTaskCate2(false);
      }
      // 作業小分類
      if (str === 'taskCategory3_' + tabIndex) {
        moldMaintenanceDetailVo.taskCategory3 = '0';
        moldMaintenanceDetailVo.taskCategory3Text = '';
        this.createPickerTaskCate3(false);
      }
    }

    if (str === 'mainteType') {
      newAllParams.mainteType = '0';
      this.createPickerMaintenanceType(true);
    }
    if (str === 'measureStatus') {
      newAllParams.measureStatus = '0';
      this.createPickerMeasureStatus(true);
    }
    if (str === 'mainteReasonCategory1') {
      newAllParams.moldMaintenanceDetailVo.map(function (item) {
        item.mainteReasonCategory1 = '0';
        item.mainteReasonCategory2 = '0';
        item.mainteReasonCategory3 = '0';
        item.mainteReasonCategory1Text = '';
        item.mainteReasonCategory2Text = '';
        item.mainteReasonCategory3Text = '';
        return item;
      });
      this.createPickerCategory1(false);
    }
    if (str === 'mainteReasonCategory2') {
      newAllParams.moldMaintenanceDetailVo.map(function (item) {
        item.mainteReasonCategory2 = '0';
        item.mainteReasonCategory3 = '0';
        item.mainteReasonCategory2Text = '';
        item.mainteReasonCategory3Text = '';
        return item;
      });
      this.createPickerCategory2(false);
    }
    if (str === 'mainteReasonCategory3') {
      newAllParams.moldMaintenanceDetailVo.map(function (item) {
        item.mainteReasonCategory3 = '0';
        item.mainteReasonCategory3Text = '';
        return item;
      });
      this.createPickerCategory3();
    }
    this.setState({ allParams: newAllParams });
  }

  handleMainteReason(e) {
    var newAllParams = this.state.allParams;
    newAllParams.moldMaintenanceDetailVo.map(function (item) {
      item.maniteReason = e.target.value;
      return item;
    });
    this.setState({
      allParams: newAllParams
    });
  }
  /**
    * 登録ボタン
    */
  buttonRegister() {
    var me = this;
    var getMaintenanceIdParam = {};
    var defaultValObject = this.props.defaultValObject;
    var newAllParams = this.state.allParams;
    getMaintenanceIdParam['mainteType'] = this.state.allParams.mainteType;
    getMaintenanceIdParam['startDatetime'] = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
    if (defaultValObject && defaultValObject.id) {
      getMaintenanceIdParam['moldUuid'] = defaultValObject.moldUuid;
      getMaintenanceIdParam['moldId'] = defaultValObject.moldId;
      getMaintenanceIdParam['issueId'] = defaultValObject.id;
      newAllParams.issueId = defaultValObject.id;
    } else {
      getMaintenanceIdParam['moldUuid'] = this.props.moldInfo.moldUuid;
      getMaintenanceIdParam['moldId'] = this.props.moldInfo.moldId;
    }

    let blobs = [];
    let moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo;
    me.$f7.preloader.show();
    //find pics which will upload
    moldMaintenanceDetailVo.forEach(function (tabItemData) {
      if (tabItemData.moldMaintenanceDetailImageFileVos.length > 0) {
        tabItemData.moldMaintenanceDetailImageFileVos.map(function (picItem) {
          if (!picItem.fileUuid) {
            blobs.push(picItem.file);
          }
          return picItem;
        });
      }
    });
    //if it has pics to upload,call upload pics interface first
    if (blobs.length > 0) {
      FileUtil.uploadsBlob(blobs, 'image', '15200')
        .then((response) => {
          let fileUuid = response.fileUuid;
          fileUuid = fileUuid.split(',');
          var fileUuidIndex = 0;
          for (var key in moldMaintenanceDetailVo) {
            for (var imgIndex = 0; imgIndex < moldMaintenanceDetailVo[key].moldMaintenanceDetailImageFileVos.length; imgIndex++) {
              var item = moldMaintenanceDetailVo[key].moldMaintenanceDetailImageFileVos[imgIndex];
              if (!item.fileUuid) {
                item.fileUuid = fileUuid[fileUuidIndex];
                fileUuidIndex++;
              }
            }
          }

          MoldMaintenance.getMaintenanceId(getMaintenanceIdParam)
            .then((values) => {
              newAllParams.maintenanceId = values.id;
              if (values.error) {
                me.$f7.preloader.hide();
                me.$f7.dialog.alert(values.errorMessage);
              } else {
                MoldMaintenance.submitMaintenance(newAllParams)
                  .then(
                    (val) => {
                      me.$f7.preloader.hide();
                      if (!val.error) {
                        me.$f7.dialog.alert(me.state.dict.msg_record_added, function () {
                          me.$f7.views.main.router.navigate(APP_DIR_PATH + '/');
                        });
                      } else {
                        me.$f7.dialog.alert(val.error);
                      }
                    }
                  )
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
        }).catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    } else {
      me.$f7.preloader.show();
      MoldMaintenance.getMaintenanceId(getMaintenanceIdParam)
        .then((values) => {
          newAllParams.maintenanceId = values.id;
          newAllParams.moldId = me.props.moldId;
          newAllParams.moldName = me.props.moldName;
          newAllParams.moldUuid = me.props.moldUuid;
          if (values.error) {
            me.$f7.preloader.hide();
            me.$f7.dialog.alert(values.errorMessage);
          } else {
            // return;
            MoldMaintenance.submitMaintenance(newAllParams)
              .then(
                (val) => {
                  me.$f7.preloader.hide();
                  if (!val.error) {
                    me.$f7.dialog.alert(me.state.dict.msg_record_added, function () {
                      me.$f7.views.main.router.navigate(APP_DIR_PATH + '/');
                    });
                  } else {
                    me.$f7.dialog.alert(val.error);
                  }
                }
              )
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

  buttonViewFiles(){
    if(this.fileNameUuidList.length > 0){
      this.setState({fileListEmpty: false});
    }
    this.state.fileListEmpty ? this.$f7.dialog.alert(this.state.dict.no_files_registered) : this.setState({fileListIsOpen: true});
    this.setState({closeModal: true});
  }

  getUploadedFileIds(moldId){
    var id = moldId;
    const me = this;
    let nameArr = [];
    let uuidArr = [];
    Mold.getMoldDetails(id)
      .then((response) => {
        me.$f7.preloader.hide();
        me.setState({moldFiles: response});
        nameArr.push(me.state.moldFiles.reportFilePathName01);
        nameArr.push(me.state.moldFiles.reportFilePathName02);
        nameArr.push(me.state.moldFiles.reportFilePathName03);
        nameArr.push(me.state.moldFiles.reportFilePathName04);
        nameArr.push(me.state.moldFiles.reportFilePathName05);
        nameArr.push(me.state.moldFiles.reportFilePathName06);
        nameArr.push(me.state.moldFiles.reportFilePathName07);
        nameArr.push(me.state.moldFiles.reportFilePathName08);
        nameArr.push(me.state.moldFiles.reportFilePathName09);
        nameArr.push(me.state.moldFiles.reportFilePathName10);
        uuidArr.push(me.state.moldFiles.reportFilePath01);
        uuidArr.push(me.state.moldFiles.reportFilePath02);
        uuidArr.push(me.state.moldFiles.reportFilePath03);
        uuidArr.push(me.state.moldFiles.reportFilePath04);
        uuidArr.push(me.state.moldFiles.reportFilePath05);
        uuidArr.push(me.state.moldFiles.reportFilePath06);
        uuidArr.push(me.state.moldFiles.reportFilePath07);
        uuidArr.push(me.state.moldFiles.reportFilePath08);
        uuidArr.push(me.state.moldFiles.reportFilePath09);
        uuidArr.push(me.state.moldFiles.reportFilePath10);
        for(var i=0; i < uuidArr.length; i++){
          if(uuidArr[i] !== ''){
            this.fileNameUuidList.push(nameArr[i]+','+uuidArr[i]);

            this.fileNameUuid.push({name: nameArr[i], id: uuidArr[i]});
          }
        }
      })
      .catch((err) => {
        me.$f7.preloader.hide();
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
  }

  makeList() {
    const items = this.fileNameUuidList.sort();
    if (!items.length) return;
    let fileList = items.map((item) => this.makeListRow(item));
    return (
      <List className={'no-margin no-padding normalFont'}>
        {fileList}
      </List>
    );
  }

  makeListRow(item) {
    var nameUuid = item.split(',');
    return (
      <ListItem key={nameUuid[1]} onClick={()=>window.open(API_BASE_URL + 'files/download/doc/'+nameUuid[1])} swipeout id={item}>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <label>{nameUuid[0]}</label>
        </div>
      </ListItem>
    );
  }

  /**
   *
   * @param {*} callback
   */
  uploadPicBeforeSubmit(callback) {
    var newAllParams = this.state.allParams;
    const taskCate = newAllParams.moldMaintenanceDetailVo[0];
    if (taskCate.taskCategory1!==taskCate.taskCategoryDefault1 || taskCate.taskCategory2!==taskCate.taskCategoryDefault2 || taskCate.taskCategory3!==taskCate.taskCategoryDefault3) {
      newAllParams.moldMaintenanceDetailVo[0].moldInspectionResultVos = [];
    }
    let blobs = [];
    let moldMaintenanceDetailVo = newAllParams.moldMaintenanceDetailVo;
    //find pics which will upload
    moldMaintenanceDetailVo.forEach(function (tabItemData) {
      if (tabItemData.moldMaintenanceDetailImageFileVos.length > 0) {
        tabItemData.moldMaintenanceDetailImageFileVos.map(function (picItem) {
          if (!picItem.fileUuid) {
            blobs.push(picItem.file);
          }
          return picItem;
        });
      }
    });
    //if it has pics to upload,call upload pics interface first
    if (blobs.length > 0) {
      FileUtil.uploadsBlob(blobs, 'image', '15200')
        .then((response) => {
          let fileUuid = response.fileUuid;
          fileUuid = fileUuid.split(',');
          var fileUuidIndex = 0;
          for (var key in moldMaintenanceDetailVo) {
            for (var imgIndex = 0; imgIndex < moldMaintenanceDetailVo[key].moldMaintenanceDetailImageFileVos.length; imgIndex++) {
              var item = moldMaintenanceDetailVo[key].moldMaintenanceDetailImageFileVos[imgIndex];
              if (!item.fileUuid) {
                item.fileUuid = fileUuid[fileUuidIndex];
                fileUuidIndex++;
              }
            }
          }
          callback(newAllParams);
        });
    } else {
      callback(newAllParams);
    }
  }

  /**
   *
   */
  renderWorkDelete() {
    var workDelete = [];
    if (this.state.currentTabIndex > 0) {
      workDelete.push(
        <Fragment key={0}>
          <Col width="50" >
            <Button fill onClick={this.deleteMainteDetail.bind(this)}>{this.state.dict.delete_work}</Button>
          </Col>
        </Fragment>
      );
    }
    return workDelete;
  }

  /**
    * 終了登録
    */
  buttonEndRegister() {
    this.openModal();
  }

  /**
   *
   */
  buttonOk() {
    var me = this;

    var newAllParams = this.state.allParams;
    if (newAllParams.afterMainteTotalProducingTimeHour !== 0) {

      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: me.state.dict.msg_confirm_after_mainte_producing_time_reset,
        buttons: [{
          text: this.state.dict.yes,
          onClick: function () {
            newAllParams.resetAfterMainteTotalProducingTimeHourFlag = true;
            me.setState({ allParams: newAllParams });

            if (newAllParams.afterMainteTotalShotCount !== 0) {

              me.$f7.dialog.create({
                title: me.state.dict.application_title,
                text: me.state.dict.msg_confirm_after_mainte_shot_count_reset,
                buttons: [{
                  text: me.state.dict.yes,
                  onClick: function () {
                    newAllParams.resetAfterMainteTotalShotCountFlag = true;
                    me.setState({ allParams: newAllParams });

                    me.save();
                  }
                }, {
                  text: me.state.dict.no,
                  onClick: function (dialog) {
                    dialog.close();

                    me.save();
                  }
                }]
              }).open();
            } else {
              me.save();
            }
          }
        }, {
          text: me.state.dict.no,
          onClick: function (dialog) {
            dialog.close();

            if (newAllParams.afterMainteTotalShotCount !== 0) {

              me.$f7.dialog.create({
                title: me.state.dict.application_title,
                text: me.state.dict.msg_confirm_after_mainte_shot_count_reset,
                buttons: [{
                  text: me.state.dict.yes,
                  onClick: function () {
                    newAllParams.resetAfterMainteTotalShotCountFlag = true;
                    me.setState({ allParams: newAllParams });

                    me.save();
                  }
                }, {
                  text: me.state.dict.no,
                  onClick: function (dialog) {
                    dialog.close();

                    me.save();
                  }
                }]
              }).open();
            } else {
              me.save();
            }
          }
        }]
      }).open();
    } else if (newAllParams.afterMainteTotalShotCount !== 0) {

      me.$f7.dialog.create({
        title: me.state.dict.application_title,
        text: me.state.dict.msg_confirm_after_mainte_shot_count_reset,
        buttons: [{
          text: me.state.dict.yes,
          onClick: function () {
            newAllParams.resetAfterMainteTotalShotCountFlag = true;
            me.setState({ allParams: newAllParams });
            me.save();
          }
        }, {
          text: me.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
            me.save();
          }
        }]
      }).open();
    } else {
      me.save();
    }

  }

  /**
   *
   */
  save() {
    var me = this;
    var tblMoldlMaintenanceDetailPRVos = Object.values(this.props.moldPartReplaceRepair);
    this.$f7.preloader.show();
    this.uploadPicBeforeSubmit(function (params) {
      params.temporarilySaved = 0;
      params.workingTimeMinutes = me.state.costMinutes;
      MoldMaintenance.submitMaintenanceEnd(params, tblMoldlMaintenanceDetailPRVos)
        .then((res) => {
          me.$f7.preloader.hide();
          if (res.error) {
            me.$f7.dialog.alert(res.errorMessage);
          } else {
            MoldMaintenance.getOrderPointList(params.maintenanceId).then(resp=>{
              if(resp.obj.length > 0) {
                me.$f7.views.main.router.navigate(APP_DIR_PATH + '/moldpart-orderpoint?id='+params.maintenanceId);
              } else {
                me.$f7.dialog.alert(me.state.dict.msg_record_added, function () {
                  me.$f7.views.main.router.navigate(APP_DIR_PATH + '/');
                });
              }
            }).catch(err=>{
              me.$f7.preloader.hide();
              me.setState(() => { throw new UnexpectedError(err); });
            });
          }
          me.clearProps();
        })
        .catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    });
  }

  /**
    * 一次保存
    */
  buttonSaveRegister() {
    var me = this;
    var tblMoldlMaintenanceDetailPRVos = Object.values(this.props.moldPartReplaceRepair);
    this.$f7.preloader.show();

    this.uploadPicBeforeSubmit(function (params) {
      params.temporarilySaved = 1;
      MoldMaintenance.submitMaintenanceEnd(params, tblMoldlMaintenanceDetailPRVos)
        .then((res) => {
          me.$f7.preloader.hide();
          if (res.error) {
            me.$f7.dialog.alert(res.errorMessage);
          } else {
            me.$f7.dialog.alert(me.state.dict.msg_record_updated);
          }
          me.clearProps();
        })
        .catch((err) => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    });
  }

  /**
    * 開始取消
    */
  buttonCancleRegister() {
    var me = this;
    me.$f7.dialog.create({
      title:me.state.dict.application_title,
      text: me.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          MoldMaintenance.cancleMaintenance(me.$f7route.query.id)
            .then((response) => {
              if (!response.error) {
                //メインメニューに戻る
                me.$f7.views.main.router.navigate(APP_DIR_PATH + '/', { reloadAll: true });
              } else {
                me.$f7.dialog.alert(response.errorMessage);
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

  showTitle(){
    if (this.$f7route.query.id) {
      return this.state.dict.sp_mold_maintenance_end;
    }
    let title = this.state.dict.sp_mold_maintenance_start;
    if (this.props.defaultValObject && this.props.defaultValObject.id) {
      return `${title} (${this.state.dict.measure})`;
    }
    return `${title} (${this.state.dict.routine})`;
  }

  buttonReplaceRepair(e) {
    e.preventDefault();
    var id = this.props.f7route.query.id;
    if (this.state.mstMoldPartDetailMaintenanceList.length > 0)
    {
      if (id) {
        var arrReplaceRepair = Object.values(this.props.moldPartReplaceRepair);
        const moldPartReplaceRepair = {...arrReplaceRepair};
        this.props.moldPartReplaceRepairInput(moldPartReplaceRepair);
        this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-part-mainte-replace-repair?id='+id, { pushState: true });
      }
    }
    else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found);
    }
  }

  warningReplaceRepair() {
    var count1 = 0;
    var count2 = 0;
    var arrReplaceRepair = Object.values(this.props.moldPartReplaceRepair);
    if (arrReplaceRepair.length > 0) {
      for (var i=0; i<arrReplaceRepair.length; i++) {
        var item1 = arrReplaceRepair[i];
        if ((item1.warningRepair === true || item1.warningReplace === true) &&
          (item1.repairIsChecked === false && item1.replaceIsChecked === false)) {
          count1 += 1;
        }
      }
      this.dialogWarningReplaceRepair(count1);   
    }
    else if (this.state.mstMoldPartDetailMaintenanceList.length > 0) {
      for (var j=0; j<this.state.mstMoldPartDetailMaintenanceList.length; j++)
      {
        var item = this.state.mstMoldPartDetailMaintenanceList[j];
        var lastRplFloat = parseFloat((new Date().getTime() - new Date(item.lastRplDatetime).getTime())/((60*60*24*1000)));
        if ((item.aftRplShotCnt >= item.rplClShotCnt && item.rplClShotCnt !== 0) ||
          (item.rplClProdTimeHour !== 0 && item.aftRplProdTimeHour >= item.rplClProdTimeHour) ||
          (item.rplClLappsedDay !== 0 && lastRplFloat >= item.rplClLappsedDay)) {
          count2 += 1;
        }
      }
      this.dialogWarningReplaceRepair(count2);
    }
    else {
      this.popupQuestionRegsiter();
    }
  }

  dialogWarningReplaceRepair(count) {
    var me = this;
    if (count !== 0) {
      me.$f7.dialog.create({
        title:me.state.dict.application_title,
        text: me.state.dict.msg_warning_not_replace_repair_parts,
        buttons: [{
          text: me.state.dict.ok,
          onClick: function () {
            me.popupQuestionRegsiter();
          }
        },{
          text: me.state.dict.cancel,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();
    }
    else {
      this.popupQuestionRegsiter();
    }
  }

  clearProps() {
    var moldPartReplaceRepair = '';
    this.props.moldPartReplaceRepairInput(moldPartReplaceRepair);
  }

  renderListItemMeasureStatus() {
    if (this.$f7route.query.id) {
      if (this.state.allParams.issueId) {
        return (
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.issue_measure_status}</Label>
              <Input type="text" name="measureStatus"
                onInputClear={this.handleClear.bind(this, 'measureStatus', -99)}
                value={this.state.measureStatus}
                readonly clearButton inputId="mold-mainte-input-page-measure-status" />
            </ListItem>
          </List>
        );
      }
    } else {
      if (this.props.defaultValObject && this.props.defaultValObject.id) {
        return (
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.issue_measure_status}</Label>
              <Input type="text" name="measureStatus"
                onInputClear={this.handleClear.bind(this, 'measureStatus', -99)}
                value={this.state.measureStatus}
                readonly clearButton inputId="mold-mainte-input-page-measure-status" />
            </ListItem>
          </List>
        );
      }
    }

  }

  /**
   * 手配・工事番号用QRボタン
   */
  buttonDirectionCodeQRClick() {
    //QRページを遷移して手配工事番号読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onDirectionCodeQrRead.bind(this) } });
  }

  onDirectionCodeQrRead(code) {
    let me = this;
    if (code) {
      var newParams = me.state.allParams;
      if (me.referTblDirection) {
        //手配工事テーブルを参照するとき
        Direction.equal({
          directionCode: code
        }).then((response) => {
          let data = response.tblDirections;
          if (data.length === 0) {
            // 手配・工事テーブルにない値はエラー。
            newParams.directionId = null;
            newParams.directionCode = null;
            me.setState({allParams: newParams});
            me.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
          } else {
            newParams.directionId = data[0].id;
            newParams.directionCode = data[0].directionCode;
            me.setState({allParams: newParams});
          }
        });
      }
      else {
        //手配工事テーブルを参照しないときはコードだけをそのまま保持
        newParams.directionId = null;
        newParams.directionCode = code;
        me.setState({allParams: newParams});
      }
    }
  }

  render() {
    var allParams = this.state.allParams;
    var firstItem = this.state.allParams.moldMaintenanceDetailVo[0];
    var commonParams = {
      moldId: allParams.moldId,
      moldName: allParams.moldName,
      mainteType: allParams.mainteType,
      mainteTypeText: allParams.mainteTypeText,
      externalFlg: allParams.externalFlg,
      measureStatus: allParams.measureStatus,
      issueId: allParams.issueId,
      temporarilySaved: allParams.temporarilySaved,
      startDatetime: allParams.startDatetime,
      endDatetime: allParams.endDatetime,
      workingTimeMinutes: allParams.workingTimeMinutes,
      report: allParams.report,
      directionId: allParams.directionId,
      directionCode: allParams.directionCode
    };
    return (

      <DocumentTitle title={this.$f7route.query.id ? this.state.dict.sp_mold_maintenance_end : this.state.dict.sp_mold_maintenance_start}>
        <Page id="mold-mainte-input-page" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>
            {this.showTitle()}
          </BlockTitle>
          <Block className="no-margin">
            <Row>
              <Col width="40">{this.state.dict.mold_id}</Col>
              <Col width="40">{commonParams.moldId}</Col>
              <Col width="8"><Button sheetOpen={'#demo-sheet-swipe-to-close'} className='container-help-mold_part' >
                <Icon material="help" color="blue" style={{float: 'right'}} ></Icon>
              </Button></Col>
            </Row>
            <Row>
              <Col width="40">{this.state.dict.mold_name}</Col>
              <Col width="40">{commonParams.moldName}</Col>
              <Col width="8"><Button className='container-help-mold_part' >
              </Button></Col>
            </Row>
          </Block>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.mold_mainte_type}</Label>
              <Input type="text" name="mainteType"
                onInputClear={this.handleClear.bind(this, 'mainteType', -99)}
                value={this.state.mainteTypeValue}
                readonly clearButton inputId="mold-mainte-input-page-maintenance-type" />
            </ListItem>
          </List>
          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.maintenance_reason_category1}</Label>
              <Input type="text" name="mainteReasonCategory1"
                onInputClear={this.handleClear.bind(this, 'mainteReasonCategory1', -99)}
                value={firstItem.mainteReasonCategory1Text}
                readonly clearButton inputId="mold-mainte-input-page-mainte-reason-category1" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.maintenance_reason_category2}</Label>
              <Input type="text" name="mainteReasonCategory2"
                disabled={firstItem.mainteReasonCategory1 === '0'}
                onInputClear={this.handleClear.bind(this, 'mainteReasonCategory2', -99)}
                value={firstItem.mainteReasonCategory2Text}
                readonly clearButton inputId="mold-mainte-input-page-mainte-reason-category2" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.maintenance_reason_category3}</Label>
              <Input type="text" name="mainteReasonCategory3"
                disabled={firstItem.mainteReasonCategory2 === '0'}
                onInputClear={this.handleClear.bind(this, 'mainteReasonCategory3', -99)}
                value={firstItem.mainteReasonCategory3Text}
                readonly clearButton inputId="mold-mainte-input-page-mainte-reason-category3" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.maintenance_reason}</Label>
              <Input type="textarea" maxlength={200} name="maniteReason" clearButton
                value={firstItem.maniteReason}
                onChange={this.handlerChangeTextarea.bind(this, -99, 'maniteReason')}
                onInputClear={this.clearTextarea.bind(this, -99, 'maniteReason')}
                inputId="mold-mainte-input-page-mainte-reason" />
            </ListItem>
            <Sheet
              id={'demo-sheet-swipe-to-close'}
              style={{height: 'auto', '--f7-sheet-bg-color': '#fff'}}
              swipeToClose
              backdrop
            >
              <Block> 
                <Row>
                  <Col>{this.state.dict.mold_last_production_date}:</Col>
                  <Col className="text-align-right">{this.state.mold_last_production_date_detail}</Col>
                </Row>
                <Row>
                  <Col>{this.state.dict.mold_total_production_time_hour}:</Col>
                  <Col className="text-align-right">{this.state.mold_total_production_time_hour_detail}</Col>
                </Row>
                <Row>
                  <Col>{this.state.dict.mold_total_shot_count}:</Col>
                  <Col className="text-align-right">{this.state.mold_total_shot_count_detail}</Col>
                </Row>
                <Row>
                  <Col>{this.state.dict.mold_last_mainte_date}:</Col>
                  <Col className="text-align-right">{this.state.mold_last_mainte_date_detail}</Col>
                </Row>
                <Row>
                  <Col>{this.state.dict.mold_mainte_cycle_code_01}:</Col>
                  <Col className="text-align-right">{this.state.mold_mainte_cycle_code_01_detail}</Col>
                </Row>
              </Block>


              <Block> 
                <Row>
                  <Col className="text-align-left" width="60"></Col>
                  <Col className="text-align-right" width="20">  {this.state.dict.maint_cycle_actual_value}</Col>
                  <Col className="text-align-right" width="20">  {this.state.dict.maint_cycle_setting_value}</Col>
                </Row>
                <Row>
                  <Col className="text-align-left" width="60">{this.state.dict.after_mainte_total_expiration_time_day}:</Col>
                  <Col className="text-align-right" width="20">{this.state.after_Mainte_Total_Days_Elapsed_detail}</Col>
                  <Col className="text-align-right" width="20">{this.state.lapsed_days_after_last_maintenance_condition}</Col>
                </Row>
                <Row>
                  <Col className="text-align-left" width="60">{this.state.dict.after_mainte_total_production_time_hour}:</Col>
                  <Col className="text-align-right" width="20">{this.state.after_Mainte_Total_Producing_TimeHour_detail}</Col>
                  <Col className="text-align-right" width="20">{this.state.prod_time_after_last_maint_condition}</Col>                
                </Row>
                <Row>
                  <Col className="text-align-left" width="60">{this.state.dict.mold_after_mainte_total_shot_count}:</Col>
                  <Col className="text-align-right" width="20">{this.state.after_Mainte_Total_Shot_Count_detail}</Col>
                  <Col className="text-align-right" width="20">{this.state.mold_shot_count_after_last_maint_condition}</Col>                
                </Row>
              </Block>
            </Sheet>
          </List>
          {/** 作業追加されたときにジャンプするポイント */}
          <div id="mold-mainte-input-page-detail-tab"></div> 
          {/** タブの描画。明細がひとつのときはタブにしないこと */}
          {!this.$f7route.query.id ?
            <Block className="no-margin-bottom no-padding">
              <TabHeader tabLinks={this.state.tabLinks} onTabChange={this.tabChange.bind(this)} key={this.state.currentTabIndex}></TabHeader>
            </Block>
            : (this.state.tabLinks.length > 1) ?
              <Block className="no-margin-bottom no-padding">
                <TabHeader tabLinks={this.state.tabLinks} onTabChange={this.tabChange.bind(this)} key={this.state.currentTabIndex}></TabHeader>
              </Block>
              : null
          }

          {/** タブ一つ目。別メソッドで描画すること */}
          <div id="moldMainteDetailTabs">
            <Tabs> {this.renderTabs()}</Tabs>
          </div>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.direction_code}</Label>
              <Input type="text" name="directionCode"
                value={commonParams.directionCode ? commonParams.directionCode : ''}
                clearButton
                onInputClear={this.handleClearText.bind(this)}
                inputId="mold-mainte-input-page-direction-code"
                onChange={this.handleChange.bind(this)}
                maxlength={45} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonDirectionCodeQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.mold_maintenance_remodeling_report}</Label>
              <Input type="textarea" maxlength={200} name="report" clearButton
                value={commonParams.report}
                onChange={this.handlerChangeTextarea.bind(this, -99, 'report')}
                onInputClear={this.clearTextarea.bind(this, -99, 'report')}
                inputId="mold-mainte-input-page-mainte-report" />
            </ListItem>
          </List>
    
          <Block>
            <List className={'no-margin no-padding normalFont'}>
              <Row>
                <Col width="50">
                  <Button fill onClick={this.addMainteDetail.bind(this)}>{this.state.dict.add_work}</Button>
                </Col>
                {this.renderWorkDelete()}
              </Row>
            </List>
            {/** 対策ステータスは不具合がひもづいているときのみ */}

            {this.renderListItemMeasureStatus()}
            <List>
              {
                this.$f7route.query.id ?
                  <List noHairlinesBetween className={'no-margin no-padding normalFont'}>
                    <List>
                      <Row>
                        <Col style={{ width:'100%'}}>
                          <Button fill onClick={(e) => this.buttonReplaceRepair(e)}>{this.state.dict.replace_or_repair_mold_part}</Button>
                        </Col>
                      </Row>
                    </List>
                    <Row>
                      <Col width="33">
                        <Button fill onClick={this.warningReplaceRepair.bind(this)}>{this.state.dict.mold_maintenance_end_registration}</Button>
                      </Col>
                      <Col width="33">
                        <Button fill onClick={this.buttonSaveRegister.bind(this)}>{this.state.dict.temporarily_saved}</Button>
                      </Col>
                      <Col width="33">
                        <Button fill onClick={this.buttonCancleRegister.bind(this)}>{this.state.dict.start_cancel}</Button>
                      </Col>
                    </Row>
                    {/* <List>
                      <Row>
                        <Col>
                          <Button fill onClick={this.buttonViewFiles.bind(this)}>{this.state.dict.view_files}</Button>
                        </Col>
                      </Row>
                    </List> */}
                  </List>
                  :
                  <List noHairlinesBetween className={'no-margin no-padding normalFont'}>
                    <Row>
                      <Col width="50">
                        <Button fill onClick={this.buttonRegister.bind(this)}>{this.state.dict.registration}</Button>
                      </Col>
                      {/* <Col width="50">
                        <Button fill onClick={this.buttonViewFiles.bind(this)}>{this.state.dict.view_files}</Button>
                      </Col> */}
                    </Row>
                  </List>
              }
            </List>     
            <FileThumbnail fileName = {this.fileNameUuid}></FileThumbnail>
            {/* {this.makeList()} */}
          </Block>
          {/* モーダル上のボタン以外では閉じさせない */}
          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal.bind(this)}
            onAfterOpen={this.afterOpenModal.bind(this)}
            style={modalStyle}
            shouldCloseOnOverlayClick={false}
            parentSelector={() => { return document.querySelector('#mold-mainte-input-page'); }}
          >
            <Block className="no-margin-bottom">
              {this.state.dict.msg_maintenance_end}
            </Block>
            <List noHairlinesBetween className="no-margin-top no-margin-bottom">
              <ListItem>
                <Label>{this.state.dict.work_start_time}</Label>
                <Input type="text" name="mainteStartTime" readonly inputId="mold-mainte-input-page-start-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.work_end_time}</Label>
                <Input type="text" name="mainteEndTime" readonly inputId="mold-mainte-input-page-end-time" />
              </ListItem>
              <ListItem>
                <Label>{this.state.dict.maintenance_working_time_minutes + '(' + this.state.dict.time_unit_minute + ')'}</Label>
                <Input type="number" name="workingTimeMinutes" value={this.state.costMinutes}
                  onChange={this.handleChangeCostMinutes.bind(this)}
                  clearButton
                  inputId="mold-mainte-input-page-working-time-minutes" />
              </ListItem>
            </List>
            <Block>
              <Row>
                <Col>
                  <Button fill onClick={this.buttonOk.bind(this)}>OK</Button>
                </Col>
              </Row>
            </Block>
          </Modal>
          <Modal isOpen={this.state.fileListIsOpen} style={modalStyle} parentSelector={() => { return document.querySelector('#mold-mainte-input-page'); }} onRequestClose={this.closeModal.bind(this)}>
            {this.makeList()}
            <Block>
              <Row>
                <Col>
                  <Button fill onClick={this.closeModal}>{this.state.dict.cancel}</Button>
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
    defaultValObject: state.mold.moldMaintenance.defaultValObject,
    moldInfo: state.mold.moldMaintenance.moldInfo,
    moldPartReplaceRepair: state.mold.moldMaintenance.moldPartReplaceRepair,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clearMoldId(value) {
      dispatch(clearMoldId(value));
    },
    mainteInputAdd(value) {
      dispatch(mainteInputAdd(value));
    },
    sendMoldInfo(value) {
      dispatch(sendMoldInfo(value));
    },
    moldPartReplaceRepairInput(value) {
      dispatch(moldPartReplaceRepairInput(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MoldMainteInputPage);
