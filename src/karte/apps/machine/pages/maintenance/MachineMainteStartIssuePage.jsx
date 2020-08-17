import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Button,
  Block,
  Row,
  Col,
  Card,
  CardContent
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import moment from 'moment';
import { connect } from 'react-redux';
import { clearMachineId, mainteInputAddMachine } from 'karte/apps/machine/reducers/machine-maintenance-reducer';


export class MachineMainteStartIssuePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        registration_date: '',
        issue_measure_due_date: '',
        issue_measure_status: '',
        component_code: '',
        machine_id: '',
        machine_name: '',
        start_datetime: '',
        end_datetime: '',
        mainte_type: '',
        mainte_reason_category1: '',
        mainte_reason_category2: '',
        mainte_reason_category3: '',
        manite_reason: '',
        issue_reported_department: '',
        issue_report_phase: '',
        issue_report_category1: '',
        sp_machine_maintenance: '',
        sp_machine_maintenance_start: '',
        sp_machine_maintenance_end: '',
        sp_regular_maintenance_proposal_list: '',
        machine_maintenance_end_registration: '',

        start_cancel: '',
        temporarily_saved: '',
        registration: '',
        work_start_time: '',
        work_end_time: '',
        maintenance_working_time_minutes: '',
        cancel: '',
        msg_maintenance_end: '',
        next: '',
        msg_issue_info: '',
        yes: '',
        no: '',
        msg_error_no_record_selected: ''
      },
      radioIssueYesNo: 'no',
      tblIssueVolist: [],
      defaultValObject: {},
      ifSelected: false,
      issueId: '',
      machineUuid: '',
      issueItem: {},
    };
    this.renderCards = this.renderCards.bind(this);
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
  }
  /**
   * 戻る
   */
  onBackClick() {
    //設備メンテナンスサブメニューに戻る
    // this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-start', {pushState:true});
    this.$f7router.back();
  }

  /**
   * 次へボタン
   */
  buttonNext() {
    var { machineInfo, mainteInputAdd } = this.props;
    if (this.state.radioIssueYesNo === 'no') {
      mainteInputAdd(machineInfo);
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-input', { pushState: true });
    } else {
      if(this.state.issueItem.id){
        machineInfo = {...machineInfo,...this.state.issueItem};
        mainteInputAdd(machineInfo);
        this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-input', { pushState: true });
      }else{
        this.$f7.dialog.alert(this.state.dict.msg_error_no_record_selected);
      }
    }
  }

  /**
   * はい、いいえラジオボタン変更時
   * @param {} event
   */
  yesNoChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  /**
   * 不具合ラジオボタン変更時
   * @param {*} event
   */
  radioIssueChange(item) {
    this.setState({
      defaultValObject: item,
      ifSelected: true,
      issueId: item.id,
      machineUuid: item.machineUuid,
      issueItem: item
    });
  }

  renderCards() {
    //if refresh the page,it will lost data from props,solve this error
    if(!this.props.issueList) {
      this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-sub-menu', {reloadAll: true});
      return;
    }
    let tblIssueVolist = this.props.issueList['tblIssueVoList'];
    if (tblIssueVolist && tblIssueVolist.length > 0) {
      let domArr = [];
      var issueListClassName = 'no-margin no-padding display-none';
      if (this.state.radioIssueYesNo === 'yes') {
        issueListClassName = 'no-margin no-padding';
      }
      tblIssueVolist.forEach((item, index) => {
        domArr.push(
          <ListItem radio name="radioIssue" className="no-fastclick" onChange={this.radioIssueChange.bind(this, item)} key={index}>
            <Card padding={false} className="no-margin">
              <CardContent padding={false} >
                <Block className="no-margin">
                  <Row >
                    <Col width="50">{this.state.dict.registration_date}</Col>
                    <Col width="50">{item.reportDate ? moment(new Date(item.reportDate)).format('YYYY/MM/DD') : ''}</Col>
                  </Row>
                  <Row >
                    <Col width="50">{this.state.dict.issue_measure_due_date}</Col>
                    <Col width="50">{item.measureDueDate ? moment(new Date(item.measureDueDate)).format('YYYY/MM/DD') : ''}</Col>
                  </Row>
                  <Row >
                    <Col width="50">{this.state.dict.issue_measure_status}</Col>
                    <Col width="50">{item.measureStatusText}</Col>
                  </Row>
                  <Row >
                    <Col width="50">{this.state.dict.component_code}</Col>
                    <Col width="50">{item.componentCode}</Col>
                  </Row>
                  <Row >
                    <Col width="50">{this.state.dict.issue_reported_department}</Col>
                    <Col width="50">{item.reportDepartmentName}</Col>
                  </Row>
                  <Row >
                    <Col width="50">{this.state.dict.issue_report_phase}</Col>
                    <Col width="50">{item.reportPhaseText}</Col>
                  </Row>
                  <Row >
                    <Col width="50">{this.state.dict.issue_report_category1}</Col>
                    <Col width="50">{item.reportCategory1Text}</Col>
                  </Row>
                </Block>
              </CardContent>
            </Card>
          </ListItem>
        );
      });
      return (
        <List noHairlinesBetween className={issueListClassName} mediaList >
          {domArr}
        </List>
      );
    }
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_machine_maintenance_start}>
        <Page>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_machine_maintenance_start}</BlockTitle>
          <Block className="smallMargin">
            <p>{this.state.dict.msg_issue_info}</p>
          </Block>
          <List noHairlines className="no-margin">
            <ListItem className="no-fastclick" radio name="radioIssueYesNo" onChange={this.yesNoChange.bind(this)} value="yes"> {this.state.dict.yes}</ListItem>
          </List>

          {/** 不具合の一覧は「はい」が選択されたときのみ表示する。「はい」が選択されてからデータ取得すること */}

          {this.renderCards()}

          <List noHairlines className="no-margin">
            <ListItem className="no-fastclick" radio name="radioIssueYesNo" onChange={this.yesNoChange.bind(this)} value="no" defaultChecked> {this.state.dict.no}</ListItem>
          </List>
          <Block>
            <Row>
              <Col>
                <Button fill onClick={this.buttonNext.bind(this)}> {this.state.dict.next} </Button>
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
    machineInfo: state.machine.machineMaintenance.machineInfo,
    issueList: state.machine.machineMaintenance.issueList
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clearMachineId(value) {
      dispatch(clearMachineId(value));
    },
    mainteInputAdd(value) {
      dispatch(mainteInputAddMachine(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineMainteStartIssuePage);
