import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Block,
  Row,
  Col,
  Card,
  CardContent,
  Toolbar,
  Link,
} from 'framework7-react';
import { connect } from 'react-redux';
import { sendMachineInfo,sendMachineIssueList } from 'karte/apps/machine/reducers/machine-maintenance-reducer';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import MachineMaintenance from 'karte/apps/machine/logics/machine-maintenance';

export class MachineMainteRecommendPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        start: '',
        machine_id: '',
        machine_name: '',
        latest_maintenance_date: '',
        machine_after_mainte_total_production_time_hour: '',
        machine_after_mainte_total_shot_count: '',
        sp_regular_maintenance_proposal_list: '',
        machine_maintenance_time: '',
        mst_error_record_not_found :'',
        msg_error_no_record_selected:'',
        time_unit_hour: ''
      },
      currentTabIndex: 0,
      modalIsOpen: false,
      tblMachineMaintenanceRecomendList: [],
      machineId: '',
      machineName: '',
      machineUuid: '',
      showMsg:''
    };
  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.$f7.preloader.show();
        MachineMaintenance.getRecomendList().then((response)=>{

          if(response.tblMachineMaintenanceRecomendList.length > 0) {
            me.setState({
              showMsg: me.state.dict.machine_maintenance_time,
              tblMachineMaintenanceRecomendList: response.tblMachineMaintenanceRecomendList
            });
          } else {
            me.setState({
              showMsg: me.state.dict.mst_error_record_not_found,
              tblMachineMaintenanceRecomendList: response.tblMachineMaintenanceRecomendList
            });
          }
          me.$f7.preloader.hide();
        }).catch(function(err){
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
      })
      .catch(function (err) {
        me.$f7.preloader.hide();
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * 戻る
   */
  onBackClick() {
    //設備メンテナンスサブメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-sub-menu', { pushState: true });
  }

  /**
   * 開始ボタン
   */
  buttonStart() {
    var me = this;
    if(this.state.machineId){
      MachineMaintenance.CheckIssues(this.state.machineId)
        .then((response) => {
          me.props.sendMachineInfo({
            machineId: me.state.machineId,
            machineName: me.state.machineName,
            machineUuid: me.state.machineUuid
          });
          me.props.sendMachineIssueList(response);
          if (response.tblIssueVoList && response.tblIssueVoList.length > 0) {
            me.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-start-issue', { pushState: true });
          } else {
            me.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-input');
          }
        })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }else{
      this.$f7.dialog.alert(this.state.dict.msg_error_no_record_selected);
    }
  }

  radioMachineSelectChange(item) {
    this.setState({
      machineId: item.mstMachine.machineId,
      machineName: item.mstMachine.machineName,
      machineUuid: item.mstMachine.uuid,
    });
  }
  renderList(){
    var arr = [];
    for(var i=0;i<this.state.tblMachineMaintenanceRecomendList.length;i++){
      var item = this.state.tblMachineMaintenanceRecomendList[i];
      arr.push(
        <ListItem radio name="radioMachineSelect" className="no-fastclick" onChange={this.radioMachineSelectChange.bind(this, item)} key={i}>
          <Card padding={false} className="no-margin">
            <CardContent padding={false} >
              <Block className="no-margin ">
                <Row >
                  <Col width="50">{this.state.dict.machine_id}</Col>
                  <Col width="50">{item.mstMachine.machineId }</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.machine_name}</Col>
                  <Col width="50">{item.mstMachine.machineName }</Col>
                </Row>
                <Row >
                  <Col width="50">{this.state.dict.latest_maintenance_date}</Col>
                  <Col width="50">{item.mstMachine.lastMainteDateStr }</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.machine_after_mainte_total_production_time_hour + '(' + this.state.dict.time_unit_hour + ')'}</Col>
                  <Col width="50" className="text-align-right">{item.mstMachine.afterMainteTotalProducingTimeHour+'' }</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.machine_after_mainte_total_shot_count}</Col>
                  <Col width="50" className="text-align-right">{item.mstMachine.afterMainteTotalShotCount+'' }</Col>
                </Row>
              </Block>
            </CardContent>
          </Card>
        </ListItem>
      );
    }
    return arr;
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_regular_maintenance_proposal_list}>
        <Page id="machine-mainte-recommend-page" onPageInit={this.onPageInit.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_regular_maintenance_proposal_list}</BlockTitle>

          <Block className="no-margin">
            { this.state.showMsg }
          </Block>

          <List noHairlinesBetween className="no-margin no-padding" mediaList >
            {this.renderList()}
          </List>

          { this.state.tblMachineMaintenanceRecomendList.length>0 ?
            <Toolbar bottomMd>
              <Link onClick={this.buttonStart.bind(this)}>{this.state.dict.start}</Link>
            </Toolbar>
            : null
          }
        </Page>
      </DocumentTitle >
    );
  }
}


function mapDispatchToProps(dispatch) {
  return {
    sendMachineInfo(value) {
      dispatch(sendMachineInfo(value));
    },
    sendMachineIssueList(value){
      dispatch(sendMachineIssueList(value));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(MachineMainteRecommendPage);
