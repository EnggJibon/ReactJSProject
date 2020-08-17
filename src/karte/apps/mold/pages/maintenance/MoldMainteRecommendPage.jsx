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
import { sendMoldInfo,sendMoldIssueList } from 'karte/apps/mold/reducers/mold-maintenance-reducer';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import MoldMaintenance from 'karte/apps/mold/logics/mold-maintenance';

export class MoldMainteRecommendPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        start: '',
        mold_id: '',
        mold_name: '',
        latest_maintenance_date: '',
        mold_after_mainte_total_production_time_hour: '',
        mold_after_mainte_total_shot_count: '',
        sp_regular_maintenance_proposal_list: '',
        mold_maintenance_time: '',
        mst_error_record_not_found :'',
        msg_error_no_record_selected:'',
        time_unit_hour: '',
        mold_part: ''
      },
      currentTabIndex: 0,
      modalIsOpen: false,
      tblMoldMaintenanceRecomendList: [],
      moldId: '',
      moldName: '',
      moldUuid: '',
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
        MoldMaintenance.getRecomendList().then((response)=>{

          if(response.tblMoldMaintenanceRecomendList.length > 0) {
            me.setState({
              showMsg: me.state.dict.mold_maintenance_time,
              tblMoldMaintenanceRecomendList: response.tblMoldMaintenanceRecomendList
            });
          } else {
            me.setState({
              showMsg: me.state.dict.mst_error_record_not_found,
              tblMoldMaintenanceRecomendList: response.tblMoldMaintenanceRecomendList
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
    //金型メンテナンスサブメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-sub-menu', { pushState: true });
  }

  /**
   * 開始ボタン
   */
  buttonStart() {
    var me = this;   
    if(this.state.moldId){
      MoldMaintenance.CheckIssues(this.state.moldId)
        .then((response) => {
          me.props.sendMoldInfo({
            moldId: me.state.moldId,
            moldName: me.state.moldName,
            moldUuid: me.state.moldUuid
          });
          me.props.sendMoldIssueList(response);
          if (response.tblIssueVoList && response.tblIssueVoList.length > 0) {
            me.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-start-issue', { pushState: true });
          } else {
            me.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-input');
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

  radioMoldSelectChange(item) {
    this.setState({
      moldId: item.mstMold.moldId,
      moldName: item.mstMold.moldName,
      moldUuid: item.mstMold.uuid,
    });
  }

  renderMoldPart (i) {
    var item = this.state.tblMoldMaintenanceRecomendList[i];
    if (item.mstMoldPartRelVO) {
      return (
        <Row >
          <Col width="50">{this.state.dict.mold_part}</Col>
          <Col width="50">{item.mstMoldPartRelVO.mstMoldPart.moldPartCode + ' (' + item.mstMoldPartRelVO.location +')'}</Col>
        </Row>
      );
    }
  }

  renderList(){
    var arr = [];
    for(var i=0;i<this.state.tblMoldMaintenanceRecomendList.length;i++){
      var item = this.state.tblMoldMaintenanceRecomendList[i];
      arr.push(
        <ListItem radio name="radioMoldSelect" className="no-fastclick" onChange={this.radioMoldSelectChange.bind(this, item)} key={i}>
          <Card padding={false} className="no-margin">
            <CardContent padding={false} >
              <Block className="no-margin ">
                <Row >
                  <Col width="50">{this.state.dict.mold_id}</Col>
                  <Col width="50">{item.mstMold.moldId }</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.mold_name}</Col>
                  <Col width="50">{item.mstMold.moldName }</Col>
                </Row>
                <Row >
                  <Col width="50">{this.state.dict.latest_maintenance_date}</Col>
                  <Col width="50">{item.mstMold.lastMainteDateStr }</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.mold_after_mainte_total_production_time_hour + '(' + this.state.dict.time_unit_hour + ')'}</Col>
                  <Col width="50" className="text-align-right">{item.mstMold.afterMainteTotalProducingTimeHour+'' }</Col>
                </Row>
                <Row>
                  <Col width="50">{this.state.dict.mold_after_mainte_total_shot_count}</Col>
                  <Col width="50" className="text-align-right">{item.mstMold.afterMainteTotalShotCount+'' }</Col>
                </Row>
                {this.renderMoldPart(i)}
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
        <Page id="mold-mainte-recommend-page" onPageInit={this.onPageInit.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_regular_maintenance_proposal_list}</BlockTitle>

          <Block className="no-margin">
            { this.state.showMsg }
          </Block>

          <List noHairlinesBetween className="no-margin no-padding" mediaList >
            {this.renderList()}
          </List>

          { this.state.tblMoldMaintenanceRecomendList.length>0 ?   
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
    sendMoldInfo(value) {
      dispatch(sendMoldInfo(value));
    },
    sendMoldIssueList(value){
      dispatch(sendMoldIssueList(value));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(MoldMainteRecommendPage);