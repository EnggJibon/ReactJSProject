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
  Input,
  Radio
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import MachineMaintenance from 'karte/apps/machine/logics/machine-maintenance';
import { connect } from 'react-redux';
import { mainteInputAddMachine } from 'karte/apps/machine/reducers/machine-maintenance-reducer';

class MachineMainteInspectionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        machine_id: '',
        machine_name: '',
        start_datetime: '',
        end_datetime: '',
        machine_mainte_type: '',
        maintenance_reason_category1: '',
        maintenance_reason_category2: '',
        maintenance_reason_category3: '',
        maintenance_reason: '',

        sp_machine_maintenance: '',
        sp_machine_maintenance_start: '',
        sp_machine_maintenance_end: '',
        sp_regular_maintenance_proposal_list: '',
        machine_maintenance_end_registration: '',

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
        machine_maintenance__task: '',
        delete_record: '',
        issue_taken_date: '',
        issue_remarks: '',
        inspection_good: '',
        inspection_acceptable: '',
        inspection_bad: '',
        inspection_result: ''
      },
      allParams: {
        'machineId': '',
        'machineName': '',
        'mainteType': 0,
        'mainteTypeText': '',  //choice
        'maintenanceId': '',
        'measureStatus': '',
        'issueId': '', // ??id
        'temporarilySaved': 0, // 一次保存按?:1, Other:0
        'startDatetime': null,
        'endDatetime': null,
        'workingTimeMinutes': 0,
        'machineMaintenanceDetailVo': [
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

            'machineMaintenanceDetailImageFileVos': []
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
    await MachineMaintenance.getInspectionChoice(inspectionItemId)
      .then((response) => {
        if (response.machineInspectionChoiceVos.length) {
          const inspectionItems = this.state.inspectionItems;
          inspectionItems[id].choices = response.machineInspectionChoiceVos;
          me.setState({inspectionItems: inspectionItems});
        }
      })
      .catch((err) => {
        me.setState(() => { throw new UnexpectedError(err); });
      });
  }

  async componentDidMount() {
    const currentTabIndex = this.$f7route.query.tab;
    const machineInspection = this.props.machineInfo.machineMaintenanceDetailVo[currentTabIndex];
    let arrays = {};
    if (machineInspection.machineInspectionResultVos[0].itemId) {
      machineInspection.machineInspectionResultVos.map((item) => arrays[item.itemId] = {
        id: item.itemId,
        itemId: item.itemId,
        mstMachineInspectionItemId: item.itemId,
        mstMachineinspectionItemName: item.inspectionItemName,
        resultType: item.resultType,
        seq: item.itemSeq,
        inspectionResult: '',
        inspectionResultText: ''
      });
    } else {
      machineInspection.machineInspectionResultVos.map((item) => arrays[item.id] = {...item, itemId: item.id});
    }
    await this.setState({inspectionItems: arrays});
    Object.values(this.state.inspectionItems).forEach((item) => {
      if (item.resultType === '3' && item.mstMachineInspectionItemId) {
        this.getInspectionChoice(item.mstMachineInspectionItemId, item.id);
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
    let machineInspectionResultVos = [];
    const machineInfo = this.props.machineInfo;
    machineInspectionResultVos = Object.values(this.state.inspectionItems).map((item, index) => {
      return {
        id: item.id,
        mstMachineInspectionItemId: item.mstMachineInspectionItemId,
        mstMachineinspectionItemName: item.mstMachineinspectionItemName,
        inspectionResult: item.inspectionResult,
        inspectionResultText: item.inspectionResultText,
        resultType: item.resultType,
        seq: item.seq || index
      };
    });

    machineInfo.machineMaintenanceDetailVo[this.$f7route.query.tab].machineInspectionResultVos = machineInspectionResultVos;
    this.props.mainteInputAdd(machineInfo);
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
    const title = `${index+1}. ${item.mstMachineinspectionItemName}`;
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
    const machineInspection = this.props.machineInfo.machineMaintenanceDetailVo[currentTabIndex];
    const title = `${this.state.dict.sp_machine_maintenance} ${this.state.dict.inspection_result}`;
    return (
      <DocumentTitle title={title}>
        <Page id="machine-mainte-inspection-page" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{title}</BlockTitle>
          <Block className="no-margin-top no-margin-bottom">
            <Label>
              {machineInspection.taskCategory1Text}, &nbsp;
              {machineInspection.taskCategory2Text}, &nbsp;
              {machineInspection.taskCategory3Text}
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
    machineInfo: state.machine.machineMaintenance.machineInfo
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainteInputAdd(value) {
      dispatch(mainteInputAddMachine(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineMainteInspectionPage);
