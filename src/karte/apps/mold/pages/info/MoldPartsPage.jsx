import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  Button,
  Block,
  Row,
  Col,
  Icon,
  Sheet,
  ListItem,
  ListItemRow,
  ListItemCell
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Mold from 'karte/apps/mold/logics/mold';
import moment from 'moment';
export default class MoldPartsPage extends React.Component {
  constructor(props){
    super(props);
    this.state={
      dict: {
        application_title: '',
        sp_mold_reference: '',
        mold_part:'',
        deterioration_after_replace: '',
        deterioration_after_repair: '',
        mold_part_replace: '',
        mold_part_repair: '',
        mst_mold_part_rel_aft_rpl_shot_cnt: '',
        mst_mold_part_rel_aft_rpl_prod_time_hour: '',
        mst_mold_part_rel_last_rpl_datetime: '',
        mst_mold_part_rel_aft_rpr_shot_cnt: '',
        mst_mold_part_rel_aft_rpr_prod_time_hour: '',
        mst_mold_part_rel_last_rpr_datetime: '',
        replace_cycle: '',
        repair_cycle: '',
        mst_mold_part_rel_rpl_cl_shot_cnt: '',
        mst_mold_part_rel_rpl_cl_prod_time_hour: '',
        mst_mold_part_rel_rpl_cl_lappsed_day: '',
        mst_mold_part_rel_rpr_cl_shot_cnt: '',
        mst_mold_part_rel_rpr_cl_prod_time_hour: '',
        mst_mold_part_rel_rpr_lappsed_day: '',
        mst_error_record_not_found: '',
        ok:'',
        cancel:'',
      }, 
      activateArrow:true,
      islocationChangePermitted: '',
      moldPartDetails:[],
      accordionBasicOpened: false,
      moldId: '',
      moldUuid:''       
    };   
  }
  onPageInit(){
    var id = this.props.f7route.query.moldUuid;
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.$f7.preloader.show();
        Mold.getMoldParts(id).then((response)=>{
          me.$f7.preloader.hide();
          if(response.length > 0) {
            me.setState({
              moldPartDetails: response
            });
          } else {
            me.setState({
              showMsg: me.state.dict.mst_error_record_not_found,
              moldPartDetails: response
            });
          }
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
  onBackMoldInfoPage() {
    this.$f7.views.main.router.back();
  }
  onPageBeforeOut() {
    const self = this;
    // Close opened sheets on page out
    self.$f7.sheet.close();
  }
  onPageBeforeRemove() {
    const self = this;
    // Destroy sheet modal when page removed
    if (self.sheet) self.sheet.destroy();
  }
  renderMoldParts(){
    var self = this;
    var moldPartList = self.state.moldPartDetails;
    return moldPartList.length > 0? moldPartList.map((partItem, partIndex)=>{
      return <div key ={partIndex}>  
        <List className="no-margin-top no-margin-bottom">
          <ListItem>
            <Block className="container-mold_part margin-top-0">
              <ListItemRow >
                <ListItemCell className="width=33">{partItem.location}</ListItemCell>
                <ListItemCell className="width=33">{partItem.moldPartCode}</ListItemCell>
                <Button sheetOpen={'#demo-sheet-swipe-to-close'+partIndex} className='container-help-mold_part' >
                  <Icon material="help" color="blue"></Icon>
                </Button>
              </ListItemRow><List/>
              <ListItemRow>
                <ListItemCell>{self.state.dict.deterioration_after_replace}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell className="margin-left-info">{self.state.dict.mst_mold_part_rel_aft_rpl_shot_cnt}</ListItemCell>
                <ListItemCell className="text-align-right">{(partItem.aftRplShotCnt === 0) ? '0' : partItem.aftRplShotCnt}</ListItemCell>
              </ListItemRow>
              <ListItemRow >
                <ListItemCell className="margin-left-info" width="70%">{self.state.dict.mst_mold_part_rel_aft_rpl_prod_time_hour}</ListItemCell>
                <ListItemCell className="text-align-right" width="30%">{(partItem.aftRplProdTimeHour === 0) ? '0' : partItem.aftRplProdTimeHour}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell className="margin-left-info">{self.state.dict.mst_mold_part_rel_last_rpl_datetime}</ListItemCell>
                <ListItemCell className="text-align-right">{partItem.lastRplDatetime ? moment(new Date(partItem.lastRplDatetime)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell>{self.state.dict.deterioration_after_repair}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell className="margin-left-info">{self.state.dict.mst_mold_part_rel_aft_rpr_shot_cnt}</ListItemCell>
                <ListItemCell className="text-align-right">{(partItem.aftRprShotCnt === 0) ? '0' : partItem.aftRprShotCnt}</ListItemCell>
              </ListItemRow>
              <ListItemRow >
                <ListItemCell className="margin-left-info" width="70%">{self.state.dict.mst_mold_part_rel_aft_rpr_prod_time_hour}</ListItemCell>
                <ListItemCell className="text-align-right" width="30%">{(partItem.aftRprProdTimeHour === 0) ? '0' : partItem.aftRprProdTimeHour}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
                <ListItemCell className="margin-left-info">{self.state.dict.mst_mold_part_rel_last_rpr_datetime}</ListItemCell>
                <ListItemCell className="text-align-right">{partItem.lastRprDatetime ? moment(new Date(partItem.lastRprDatetime)).format('YYYY/MM/DD') : ''}</ListItemCell>
              </ListItemRow>
              <ListItemRow>
              </ListItemRow>
            </Block>
          </ListItem>
        </List>
        <Sheet id={'demo-sheet-swipe-to-close'+partIndex} style={{height: 'auto', '--f7-sheet-bg-color': '#fff'}} swipeToClose backdrop>
          <Block>
            {this.state.dict.replace_cycle}
            <Row>
              <Col>{this.state.dict.mst_mold_part_rel_rpl_cl_shot_cnt}</Col>
              <Col className="text-align-center">{(partItem.rplClShotCnt === 0) ? '0' : partItem.rplClShotCnt}</Col>
            </Row>
            <Row>
              <Col>{this.state.dict.mst_mold_part_rel_rpl_cl_prod_time_hour}</Col>
              <Col className="text-align-center">{(partItem.rplClProdTimeHour === 0) ? '0' : partItem.rplClProdTimeHour}</Col>
            </Row>
            <Row>
              <Col>{this.state.dict.mst_mold_part_rel_rpl_cl_lappsed_day}</Col>
              <Col className="text-align-center">{ (partItem.rplClLappsedDay === 0) ? '0' : partItem.rplClLappsedDay}</Col>
            </Row>
            <br/>
            {this.state.dict.repair_cycle}<br/>
            <Row>
              <Col>{this.state.dict.mst_mold_part_rel_rpr_cl_shot_cnt}</Col>
              <Col className="text-align-center">{(partItem.rprClShotCnt === 0) ? '0' : partItem.rprClShotCnt}</Col>
            </Row>
            <Row>
              <Col >{this.state.dict.mst_mold_part_rel_rpr_cl_prod_time_hour}</Col>
              <Col className="text-align-center">{(partItem.rprClProdTimeHour === 0) ? '0' : partItem.rprClProdTimeHour}</Col>
            </Row>
            <Row>
              <Col>{this.state.dict.mst_mold_part_rel_rpr_lappsed_day}</Col>
              <Col className="text-align-center">{(partItem.rprClLappsedDay === 0) ? '0' : partItem.rprClLappsedDay}</Col>
            </Row>
          </Block>
        </Sheet>
      </div>;
    }):null;
  }
  render(){
    return(
      <DocumentTitle title={this.state.dict.sp_mold_reference}>
        <Page id="mold-info-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeOut={this.onPageBeforeOut.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackMoldInfoPage.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_mold_reference}</BlockTitle>
          <List className='no-margin no-padding normalFont'>
            <Block style={{marginTop: 0+'px', marginBottom: 0+'px'}}>
              {this.state.dict.mold_part}
            </Block>
            {this.renderMoldParts()}
          </List>
          <Block>
            <Row>
              <Col>
                <Button fill onClick={this.onBackMoldInfoPage.bind(this)}>{this.state.dict.ok}</Button>
              </Col>
            </Row>
          </Block>
        </Page>
      </DocumentTitle>
    );
  }
}