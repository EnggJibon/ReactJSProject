import React from 'react';
import {
  Page,
  Button,
  Block,
  Row,
  Col,
  //  Tabs,
  //  Tab,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  // Card,
  // CardContent,
  // CardFooter,
  // Link,
  // ListItemRow,
  // ListItemCell,
  // Segmented,
  //ListInput,
  Radio
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
// import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
// import { API_BASE_URL } from 'karte/shared/logics/api-agent';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
// import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
// import CalendarUtil from 'karte/shared/logics/calendar-util';
// import moment from 'moment';
// import Cookies from 'universal-cookie';
// import FileUtil from 'karte/shared/logics/fileutil';
import MoldMaintenance from 'karte/apps/mold/logics/mold-maintenance';
// import Choice from 'karte/shared/master/choice';
// import TabHeader from 'karte/shared/components/TabHeader';
import { connect } from 'react-redux';
import { mainteInputAdd } from 'karte/apps/mold/reducers/mold-maintenance-reducer';

class MoldMainteInspectionPage extends React.Component {
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
        time_unit_minute: '',
        maintenance_working_time_minutes: '',
        ok: '',
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
        inspection_good: '',
        inspection_acceptable: '',
        inspection_bad: '',
        inspection_result: ''
      },
      allParams: {
        'moldId': '',
        'moldName': '',
        'mainteType': 0,
        'mainteTypeText': '',  //choice
        'maintenanceId': '',
        'measureStatus': '',
        'issueId': '', // ??id
        'temporarilySaved': 0, // 一次保存按?:1, Other:0
        'startDatetime': null,
        'endDatetime': null,
        'workingTimeMinutes': 0,
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

            'moldMaintenanceDetailImageFileVos': []
          }
        ],
      },
      inspectionItems: []
    };
    const me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
      })
      .catch(function (err) {
        me.setState(() => { throw new UnexpectedError(err); });
      });
  }

  async getInspectionChoice(inspectionItemId, id) {
    const me = this;
    await MoldMaintenance.getInspectionChoice(inspectionItemId)
      .then((response) => {
        if (response.moldInspectionChoiceVos.length) {
          const inspectionItems = this.state.inspectionItems;
          inspectionItems[id].choices = response.moldInspectionChoiceVos;
          me.setState({inspectionItems: inspectionItems});
        }
      })
      .catch((err) => {
        me.setState(() => { throw new UnexpectedError(err); });
      });
  }

  async componentDidMount() {
    const currentTabIndex = this.$f7route.query.tab;
    const moldInspection = this.props.moldInfo.moldMaintenanceDetailVo[currentTabIndex];
    let arrays = {};
    if (moldInspection.moldInspectionResultVos[0].itemId) {
      moldInspection.moldInspectionResultVos.map((item) => arrays[item.itemId] = {...item, id: item.itemId, inspectionItemId: item.itemId});
    } else {
      moldInspection.moldInspectionResultVos.map((item) => arrays[item.id] = {...item, itemId: item.id});
    }
    await this.setState({inspectionItems: arrays});
    Object.values(this.state.inspectionItems).forEach((item) => {
      if (item.resultType === '3' && item.inspectionItemId) {
        this.getInspectionChoice(item.inspectionItemId, item.id);
      }
    });
    this.$f7.preloader.hide();
  }

  componentDidUpdate(){
    let obSelect = Object.values(this.state.inspectionItems).filter((item) => item.resultType==='3');
    if (obSelect.length){
      obSelect.forEach((item) => {
        if (this.Dom7(`#${item.id}`) && this.Dom7(`#${item.id}`).length) {
          this.createPickerChoice(item);
        }
      });
    }
  }

  onBackClick() {
    this.$f7router.back();
  }

  setItemsInspection() {
    let moldInspectionResultVos = [];
    const moldInfo = this.props.moldInfo;
    moldInspectionResultVos = Object.values(this.state.inspectionItems).map((item, index) => {
      return {
        id: item.id,
        inspectionItemId: item.inspectionItemId,
        inspectionItemName: item.inspectionItemName,
        inspectionResult: item.inspectionResult,
        inspectionResultText: item.inspectionResultText,
        resultType: item.resultType,
        seq: item.seq || index
      };
    });

    moldInfo.moldMaintenanceDetailVo[this.$f7route.query.tab].moldInspectionResultVos = moldInspectionResultVos;
    this.props.mainteInputAdd(moldInfo);
    this.onBackClick();
  }

  onPageBeforeRemove() {
  }

  handleClear(itemId) {
    this.handleValue('', itemId);
  }

  handleValue(value, itemId){
    let inspectionItems = this.state.inspectionItems;
    inspectionItems[itemId].inspectionResult = value;
    inspectionItems[itemId].inspectionResultText = value;
    this.setState({inspectionItems: inspectionItems});
  }

  handleChange(event, itemId){
    this.handleValue(event.target.value, itemId);
  }

  createPickerChoice(item, setDefault=true) {
    if (!item.choices || !item.choices.length) return;
    let me = this;
    let _values = [];
    let _displayValues = [];
    let defaultValue = '';
    item.choices.forEach((choice, index) => {
      _values.push(choice.seq);
      _displayValues.push(choice.choice);
      if (item.inspectionResult === `${index+1}`) defaultValue = choice.choice;
    });
    if (me[item.id]) {
      me[item.id].destroy();
    }
    me[item.id] = me.createPicker(item.id, _values, _displayValues,
      (picker, value) => {
        let inspectionItems = this.state.inspectionItems;
        inspectionItems[item.id].inspectionResult = value;
        inspectionItems[item.id].inspectionResultText = value;
      }
    );
    if (setDefault && defaultValue !== null) {
      me[item.id].setValue([defaultValue], '');
    }
  }

  createPicker(elementName, _values, _displayValues, onColChange) {
    let me = this;
    const app = me.$f7;
    return app.picker.create({
      inputEl: `#${elementName}`,
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

  renderRadio(value, item) {
    return (
      <Radio
        className='no-fastclick'
        defaultChecked={value === item.inspectionResult}
        onChange={(event) => this.handleChange(event, item.itemId)}
        style={{ 'marginRight': '8px', 'marginLeft': '8px' }}
        name={`insp_1_${item.itemId}`}
        value={value}
      />
    );
  }

  renderItem(index, item) {
    const title = `${index+1}. ${item.inspectionItemName}`;
    const me = this;
    switch(item.resultType) {
      case '1': {
        return (
          <ListItem title={title} itemInput key={index}>
            {me.renderRadio('inspection_good', item)} ○
            {me.renderRadio('inspection_bad', item)} ×
          </ListItem>
        );
      }
      case '2': {
        return (
          <ListItem itemInput title={title} key={index}>
            {me.renderRadio('inspection_good', item)} ○
            {me.renderRadio('inspection_acceptable', item)} △
            {me.renderRadio('inspection_bad', item)} ×
          </ListItem>
        );
      }
      case '3': {
        if (!item.choices) return;
        const name = `select_${item.itemId}`;
        return (
          <ListItem title={title} key={index}>
            <Input
              type="text"
              name={name}
              clearButton
              onInputClear={this.handleClear.bind(this, item.itemId)}
              readonly
              inputId={item.itemId}
            />
          </ListItem>
        );
      }
      case '4':
        return (
          <ListItem title={title} key={index}>
            <Input
              clearButton
              type="number"
              value={item.inspectionResult}
              onInputClear={this.handleClear.bind(this, item.itemId)}
              onChange={(event) => this.handleChange(event, item.itemId)}
            />
          </ListItem>
        );
      case '5':
        return (
          <ListItem title={title} key={index}>
            <Input
              clearButton
              type="text"
              value={item.inspectionResult}
              onInputClear={this.handleClear.bind(this, item.itemId)}
              onChange={(event) => this.handleChange(event, item.itemId)}
            />
          </ListItem>
        );
      default:
        return;
    }
  }

  render() {
    const currentTabIndex = this.$f7route.query.tab;
    const inspection = this.props.moldInfo.moldMaintenanceDetailVo[currentTabIndex];
    const title = `${this.state.dict.sp_mold_maintenance} ${this.state.dict.inspection_result}`;
    return (
      <DocumentTitle title={title}>
        <Page id="mold-mainte-inspection-page" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{title}</BlockTitle>
          <Block className="no-margin-top no-margin-bottom">
            <Label>
              {inspection.taskCategory1Text}, &nbsp;
              {inspection.taskCategory2Text}, &nbsp;
              {inspection.taskCategory3Text}
            </Label>
          </Block>

          <List className="no-margin-top no-margin-bottom">
            {
              Object.values(this.state.inspectionItems).map((item, index) => this.renderItem(index, item))
            }
          </List>
          <Block>
            <Row>
              <Col width="50">
                <Button fill onClick={this.setItemsInspection.bind(this)}>{this.state.dict.ok}</Button>
              </Col>
              <Col width="50">
                <Button fill onClick={this.onBackClick.bind(this)} >{this.state.dict.cancel}</Button>
              </Col>
            </Row>
          </Block>

        </Page>
      </DocumentTitle >
    );
  }
}
function mapStateToProps(state) {
  return {
    moldInfo: state.mold.moldMaintenance.moldInfo
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainteInputAdd(value) {
      dispatch(mainteInputAdd(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MoldMainteInspectionPage);
