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
  Input,
  Sheet,
  Checkbox,
  ListItem,
  ListItemRow,
  ListItemCell,
  Label
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import MoldMaintenance from 'karte/apps/mold/logics/mold-maintenance';
import { connect } from 'react-redux';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';
import { moldPartReplaceRepairInput } from 'karte/apps/mold/reducers/mold-maintenance-reducer';

class MoldPartsMainteReplaceRepair extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        mst_error_record_not_found: '',
        sp_mold_maintenance_end: '',
        replace_or_repair_mold_part_list: '',
        deterioration_after_replace: '',
        deterioration_after_repair: '',
        mold_part_replace: '',
        mold_part_repair: '',
        mold_part_replace_partially: '',
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
        ok: '',
        cancel: '',
        usage_amount: '',
        msg_mold_part_select_out_target: '',
        mold_part_storage: '',
        mold_part_stock_qty: '',
        mold_part_used_stock_qty: '',
        mold_id: '',
        msg_mold_part_replace_partially: '',
        msg_mold_part_recyclable: '',
        msg_mold_part_both_new_used: '',
        mold_part_exchange_quantity: '',
        mold_part_recycle_quantity: '',
        mold_part_dispose_quantity: '',
        mold_part_new_stock: '',
        mold_part_used_stock: '',
        mold_part_replace_qty_from_new: '',
        mold_part_replace_qty_from_used: ''
      },
      mstMoldPartDetailMaintenanceList: [],
      /**交換詳細設定中の金型部品 */
      replacingMoldPart: null,
      isOpenStockSelectDialog: false,
      isOpenPartialReplaceDialog: false,
      isOpenRecycleDialog: false,
      isOpenUsedSettingDailog: false
    };
    this.dateToYMD = this.dateToYMD.bind(this);
    this.handleReplace = this.handleReplace.bind(this);
    this.renderWarningReplace = this.renderWarningReplace.bind(this);
    this.handleRepair = this.handleRepair.bind(this);
    this.renderWarningRepair = this.renderWarningRepair.bind(this);
    this.setDetailReplace = this.setDetailReplace.bind(this);
  }

  onPageInit() {
    var id = this.props.f7route.query.id;
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.$f7.preloader.show();
        MoldMaintenance.getReplaceRepairMoldPartList(id).then((response)=>{
          response.forEach(item=>{
            item.replaceQty = item.maintPart ? item.maintPart.replaceQuantity : 0;
            item.recycleQty = item.maintPart ? item.maintPart.recycleQuantity : 0;
            item.disposeQty = item.maintPart ? item.maintPart.disposeQuantity : 0;
            item.fromNewQty = item.maintPart ? item.maintPart.newPartQuantity : 0;
            item.fromUsedQty = item.maintPart ? item.maintPart.usedQuantity : 0;
            if(item.maintPart) {
              item.replaceStock = item.stocks.find(s=>s.id === item.maintPart.moldPartStockId);
            }
          });
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
          var arrReplaceRepair = Object.values(me.props.moldPartReplaceRepair);
          if (arrReplaceRepair.length > 0) {
            for (var i=0; i<arrReplaceRepair.length; i++) {
              var item = me.state.mstMoldPartDetailMaintenanceList[i];
              item.replaceIsChecked = arrReplaceRepair[i].replaceIsChecked;
              item.repairIsChecked = arrReplaceRepair[i].repairIsChecked;
              item.partialReplaceIsChecked = arrReplaceRepair[i].partialReplaceIsChecked;
              item.replaceStock = arrReplaceRepair[i].replaceStock;
              item.replaceQty = arrReplaceRepair[i].replaceQty;
              item.recycleQty = arrReplaceRepair[i].recycleQty;
              item.disposeQty = arrReplaceRepair[i].disposeQty;
              item.fromNewQty = arrReplaceRepair[i].fromNewQty;
              item.fromUsedQty = arrReplaceRepair[i].fromUsedQty;
            }
            me.setState ({
              mstMoldPartDetailMaintenanceList: me.state.mstMoldPartDetailMaintenanceList
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

  onBackMoldMainteInputPage() {
    this.$f7.views.main.router.back();
  }

  buttonOk() {
    var moldPartReplaceRepair = this.setArrayReplaceRepair();
    this.props.moldPartReplaceRepairInput(moldPartReplaceRepair);
    this.$f7.views.main.router.back();
  }

  handleReplace(i) {
    var item = this.state.mstMoldPartDetailMaintenanceList[i];
    item.replaceIsChecked = !item.replaceIsChecked;
    if (item.replaceIsChecked === true) {
      item.repairIsChecked = false;
      item.partialReplaceIsChecked = false;
      this.initReplaceQty(item);
      this.setDetailReplace(item);
    }
    this.setState({
      mstMoldPartDetailMaintenanceList: this.state.mstMoldPartDetailMaintenanceList
    });
  }

  initReplaceQty(item) {
    item.replaceStock = item.stocks.length > 0 ? item.stocks[0] : null;
    item.replaceQty = item.partialReplaceIsChecked ? Math.max(item.quantity - 1, 0): item.quantity;
    item.recycleQty = item.recyclableFlg ? item.replaceQty : 0;
    item.disposeQty = item.recyclableFlg ? 0 : item.replaceQty;
    item.fromNewQty = item.replaceQty;
    item.fromUsedQty = 0;
  }

  renderWarningReplace(i) {
    var item = this.state.mstMoldPartDetailMaintenanceList[i];
    var lastRplFloat = parseFloat((new Date().getTime() - new Date(item.lastRplDatetime).getTime())/((60*60*24*1000)));
    if ((item.aftRplShotCnt >= item.rplClShotCnt && item.rplClShotCnt !== 0) ||
        (item.rplClProdTimeHour !== 0 && item.aftRplProdTimeHour >= item.rplClProdTimeHour) ||
        (item.rplClLappsedDay !== 0 && lastRplFloat >= item.rplClLappsedDay)) {
      return <Icon material="warning" color="yellow"></Icon>;
    }
  }

  handlePartialReplaceChecked(i) {
    const item = this.state.mstMoldPartDetailMaintenanceList[i];
    item.partialReplaceIsChecked = !item.partialReplaceIsChecked;
    if(item.partialReplaceIsChecked) {
      item.replaceIsChecked = false;
      item.repairIsChecked = false;
      this.initReplaceQty(item);
      this.setDetailReplace(item);
    }
    this.setState({
      mstMoldPartDetailMaintenanceList: this.state.mstMoldPartDetailMaintenanceList
    });
  }

  editExchangeDetail(i) {
    const item = this.state.mstMoldPartDetailMaintenanceList[i];
    if(item.replaceIsChecked || item.partialReplaceIsChecked) {
      this.setDetailReplace(item);
    }
  }

  handleRepair(i) {
    var item = this.state.mstMoldPartDetailMaintenanceList[i];
    item.repairIsChecked = !item.repairIsChecked;
    if (item.repairIsChecked === true) {
      item.replaceIsChecked = false;
      item.partialReplaceIsChecked = false;
      item.replaceStock = null;
      item.replaceQty = 0;
      item.recycleQty = 0;
      item.disposeQty = 0;
      item.fromNewQty = 0;
      item.fromUsedQty = 0;
    }
    this.setState({
      mstMoldPartDetailMaintenanceList: this.state.mstMoldPartDetailMaintenanceList
    });
  }

  setDetailReplace(item) {
    const inSameMold = item.stocks.find(stock=>item.moldId === stock.mold.moldId);
    if(item.stocks.length === 0){
      this.stockSelected(item, null);//stockのレコードが無い場合は登録時に追加する。
    } else if(inSameMold) {
      this.stockSelected(item, inSameMold);
    } else if(item.stocks.length === 1) {
      this.stockSelected(item, item.stocks[0]);
    } else {
      this.setState({
        replacingMoldPart: item,
        isOpenStockSelectDialog: true
      });
    }
  }

  stockSelected(item, stock) {
    item.replaceStock = stock;
    const stateUpd = {
      mstMoldPartDetailMaintenanceList: this.state.mstMoldPartDetailMaintenanceList,
      isOpenStockSelectDialog: false
    };
    if(item.partialReplaceIsChecked) {
      stateUpd.replacingMoldPart = item;
      stateUpd.isOpenPartialReplaceDialog = true;
    } else if(item.recyclableFlg) {
      stateUpd.replacingMoldPart = item;
      stateUpd.isOpenRecycleDialog = true;
    } else {
      this.recycleQtrSelected(item, 0);
    }
    this.setState(stateUpd);
  }

  handlePartialReplaced(item, replaceQty) {
    item.replaceQty = replaceQty;
    const stateUpd = {
      mstMoldPartDetailMaintenanceList: this.state.mstMoldPartDetailMaintenanceList,
      isOpenPartialReplaceDialog: false
    };
    if(item.recyclableFlg) {
      item.recycleQty = Math.min(replaceQty, item.recycleQty);
      item.disposeQty = item.replaceQty - item.recycleQty;
      stateUpd.replacingMoldPart = item;
      stateUpd.isOpenRecycleDialog = true;
    } else {
      this.recycleQtrSelected(item, 0);
    }
    this.setState(stateUpd);
  }

  recycleQtrSelected(item, recycleQty) {
    item.recycleQty = recycleQty;
    item.disposeQty = item.replaceQty - recycleQty;
    const stateUpd = {
      mstMoldPartDetailMaintenanceList: this.state.mstMoldPartDetailMaintenanceList,
      isOpenRecycleDialog: false
    };
    if(item.replaceStock && item.replaceStock.usedStock > 0) {
      stateUpd.isOpenUsedSettingDailog = true;
      stateUpd.replacingMoldPart = item;
    } else {
      this.fromNewQtySelected(item, item.replaceQty);
    }
    this.setState(stateUpd);
  }

  fromNewQtySelected(item, fromNewQty) {
    item.fromNewQty = fromNewQty;
    item.fromUsedQty = item.replaceQty - fromNewQty;
    const stateUpd = {
      mstMoldPartDetailMaintenanceList: this.state.mstMoldPartDetailMaintenanceList,
      isOpenUsedSettingDailog: false
    };
    this.setState(stateUpd);
  }

  renderWarningRepair(i) {
    var item = this.state.mstMoldPartDetailMaintenanceList[i];
    var lastRprFloat = parseFloat((new Date().getTime() - new Date(item.lastRprDatetime).getTime())/(60*60*24*1000));
    if ((item.aftRprShotCnt >= item.rprClShotCnt && item.rprClShotCnt !== 0) ||
        (item.rprClProdTimeHour !== 0 && item.aftRprProdTimeHour >= item.rprClProdTimeHour) ||
        (item.rprClLappsedDay !== 0 && lastRprFloat >= item.rprClLappsedDay)) {
      return <Icon material="warning" color="yellow"></Icon>;
    }
  }

  setWarningReplace(item) {
    var warningReplace = false;
    var lastRplFloat = parseFloat((new Date().getTime() - new Date(item.lastRplDatetime).getTime())/((60*60*24*1000)));
    if ((item.aftRplShotCnt >= item.rplClShotCnt && item.rplClShotCnt !== 0) ||
        (item.rplClProdTimeHour !== 0 && item.aftRplProdTimeHour >= item.rplClProdTimeHour) ||
        (item.rplClLappsedDay !== 0 && lastRplFloat >= item.rplClLappsedDay)) {
      warningReplace = true;
    }
    return warningReplace;
  }

  setWarningRepair(item) {
    var warningRepair = false;
    var lastRprFloat = parseFloat((new Date().getTime() - new Date(item.lastRprDatetime).getTime())/(60*60*24*1000));
    if ((item.aftRprShotCnt >= item.rprClShotCnt && item.rprClShotCnt !== 0) ||
        (item.rprClProdTimeHour !== 0 && item.aftRprProdTimeHour >= item.rprClProdTimeHour) ||
        (item.rprClLappsedDay !== 0 && lastRprFloat >= item.rprClLappsedDay)) {
      warningRepair = true;
    }
    return warningRepair;
  }

  dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + '/' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d);
  }

  setArrayReplaceRepair () {
    return this.state.mstMoldPartDetailMaintenanceList.map(item=>({
      warningRepair: this.setWarningRepair(item),
      warningReplace: this.setWarningReplace(item),
      moldPartRelId: item.moldPartRelId,
      replaceIsChecked: item.replaceIsChecked,
      repairIsChecked: item.repairIsChecked,
      partialReplaceIsChecked: item.partialReplaceIsChecked,
      replaceStock: item.replaceStock,
      replaceQty: item.replaceQty,
      recycleQty: item.recycleQty,
      disposeQty: item.disposeQty,
      fromNewQty: item.fromNewQty,
      fromUsedQty: item.fromUsedQty
    }));
  }

  renderList(){
    var arr = [];
    for(var i=0;i<this.state.mstMoldPartDetailMaintenanceList.length;i++){
      var item = this.state.mstMoldPartDetailMaintenanceList[i];
      arr.push(
        <div key={i}>
          <List className="no-margin-top no-margin-bottom">
            <ListItem>
              <Block className="container-mold_part margin-top-0">
                <ListItemRow >
                  <ListItemCell style={{ width:'30%'}}>{item.location}</ListItemCell>
                  <ListItemCell>{item.moldPartCode}</ListItemCell>
                  <Button sheetOpen={'#demo-sheet-swipe-to-close'+i} className='container-help-mold_part' >
                    <Icon material="help" color="blue" style={{float: 'right'}} ></Icon>
                  </Button>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell>{this.state.dict.usage_amount}</ListItemCell>
                  <ListItemCell className="text-align-right">{String(item.quantity)}</ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell>{this.state.dict.deterioration_after_replace}</ListItemCell>
                  <ListItemCell className="text-align-right">
                    {this.renderWarningReplace(i)}
                  </ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell className="margin-left-info">{this.state.dict.mst_mold_part_rel_aft_rpl_shot_cnt}</ListItemCell>
                  <ListItemCell className="text-align-right">{(item.aftRplShotCnt === 0) ? '0' : item.aftRplShotCnt}</ListItemCell>
                </ListItemRow>
                <ListItemRow >
                  <ListItemCell className="margin-left-info" width="70%">{this.state.dict.mst_mold_part_rel_aft_rpl_prod_time_hour}</ListItemCell>
                  <ListItemCell className="text-align-right" width="30%">{(item.aftRplProdTimeHour === 0) ? '0' : item.aftRplProdTimeHour}</ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell className="margin-left-info">{this.state.dict.mst_mold_part_rel_last_rpl_datetime}</ListItemCell>
                  <ListItemCell className="text-align-right">{(item.lastRplDatetime) ? this.dateToYMD(new Date(item.lastRplDatetime)) : ''}</ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell>{this.state.dict.deterioration_after_repair}</ListItemCell>
                  <ListItemCell className="text-align-right">{this.renderWarningRepair(i)}</ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell className="margin-left-info">{this.state.dict.mst_mold_part_rel_aft_rpr_shot_cnt}</ListItemCell>
                  <ListItemCell className="text-align-right">{(item.aftRprShotCnt === 0) ? '0' : item.aftRprShotCnt}</ListItemCell>
                </ListItemRow>
                <ListItemRow >
                  <ListItemCell className="margin-left-info" width="70%">{this.state.dict.mst_mold_part_rel_aft_rpr_prod_time_hour}</ListItemCell>
                  <ListItemCell className="text-align-right" width="30%">{(item.aftRprProdTimeHour === 0) ? '0' : item.aftRprProdTimeHour}</ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell className="margin-left-info">{this.state.dict.mst_mold_part_rel_last_rpr_datetime}</ListItemCell>
                  <ListItemCell className="text-align-right">{(item.lastRprDatetime) ? this.dateToYMD(new Date(item.lastRprDatetime)) : ''}</ListItemCell>
                </ListItemRow>
                <ListItemRow>
                  <ListItemCell className="no-fastclick">
                    <Checkbox checked={item.replaceIsChecked} name={'check_replace_'+i} onChange={this.handleReplace.bind(this, i)} /> {this.state.dict.mold_part_replace}
                  </ListItemCell>
                  <ListItemCell className="no-fastclick">
                    <Checkbox checked={item.repairIsChecked} name={'check_replace_'+i} onChange={this.handleRepair.bind(this, i)} /> {this.state.dict.mold_part_repair}
                  </ListItemCell>
                  <Button iconF7="compose" onClick={this.editExchangeDetail.bind(this, i)} style={{minWidth: 32}}></Button>
                </ListItemRow>
                {item.quantity > 1 && <ListItemRow>
                  <ListItemCell className="no-fastclick flex-shrink-3">
                    <Checkbox checked={item.partialReplaceIsChecked} onChange={this.handlePartialReplaceChecked.bind(this, i)} /> {this.state.dict.mold_part_replace_partially}
                  </ListItemCell>
                  <ListItemCell className="text-align-right width-auto flex-shrink-0">{item.partialReplaceIsChecked ? String(item.replaceQty) : '0'}</ListItemCell>
                </ListItemRow>}
              </Block>
            </ListItem>
          </List>
          <Sheet
            id={'demo-sheet-swipe-to-close'+i}
            style={{height: 'auto', '--f7-sheet-bg-color': '#fff'}}
            swipeToClose
            backdrop
          >
            <Block>
              {this.state.dict.replace_cycle} 
              <Row>
                <Col>{this.state.dict.mst_mold_part_rel_rpl_cl_shot_cnt}</Col>
                <Col className="text-align-center">{(item.rplClShotCnt === 0) ? '0' : item.rplClShotCnt}</Col>
              </Row>
              <Row>
                <Col>{this.state.dict.mst_mold_part_rel_rpl_cl_prod_time_hour}</Col>
                <Col className="text-align-center">{(item.rplClProdTimeHour === 0) ? '0' : item.rplClProdTimeHour}</Col>
              </Row>
              <Row>
                <Col>{this.state.dict.mst_mold_part_rel_rpl_cl_lappsed_day}</Col>
                <Col className="text-align-center">{ (item.rplClLappsedDay === 0) ? '0' : item.rplClLappsedDay}</Col>
              </Row>
              <br/>
              {this.state.dict.repair_cycle}
              <Row>
                <Col>{this.state.dict.mst_mold_part_rel_rpr_cl_shot_cnt}</Col>
                <Col className="text-align-center">{(item.rprClShotCnt === 0) ? '0' : item.rprClShotCnt}</Col>
              </Row>
              <Row>
                <Col >{this.state.dict.mst_mold_part_rel_rpr_cl_prod_time_hour}</Col>
                <Col className="text-align-center">{(item.rprClProdTimeHour === 0) ? '0' : item.rprClProdTimeHour}</Col>
              </Row>
              <Row>
                <Col>{this.state.dict.mst_mold_part_rel_rpr_lappsed_day}</Col>
                <Col className="text-align-center">{(item.rprClLappsedDay === 0) ? '0' : item.rprClLappsedDay}</Col>
              </Row>
            </Block>
          </Sheet>
        </div>
      );
    }
    return arr;
  }

  render() {
    this.setArrayReplaceRepair();
    return (
      <DocumentTitle title={this.state.dict.sp_mold_maintenance_end}>
        <Page id="mold-mainte-replace-repair-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeOut={this.onPageBeforeOut.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackMoldMainteInputPage.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_mold_maintenance_end}</BlockTitle>
          <List className='no-margin no-padding normalFont'>
            <Block style={{marginTop: 0+'px', marginBottom: 0+'px'}}>
              {this.state.dict.replace_or_repair_mold_part_list}
            </Block>

            {this.renderList()}
  
          </List>
          <Block>
            <Row>
              <Col width="50">
                <Button fill onClick={this.buttonOk.bind(this)}>{this.state.dict.ok}</Button>
              </Col>
              <Col width="50">
                <Button fill onClick={this.onBackMoldMainteInputPage.bind(this)}>{this.state.dict.cancel}</Button>
              </Col>
            </Row>
          </Block>
          <StockSelectDialog moldPartRel={this.state.replacingMoldPart} onSelected={this.stockSelected.bind(this)} isOpen={this.state.isOpenStockSelectDialog} dict={this.state.dict}/>
          <PartialReplaceDialog moldPartRel={this.state.replacingMoldPart} onSelected={this.handlePartialReplaced.bind(this)} isOpen={this.state.isOpenPartialReplaceDialog} dict={this.state.dict}/>
          <RecycleDialog moldPartRel={this.state.replacingMoldPart} onSelected={this.recycleQtrSelected.bind(this)} isOpen={this.state.isOpenRecycleDialog} dict={this.state.dict}/>
          <UsedSettingDailog moldPartRel={this.state.replacingMoldPart} onSelected={this.fromNewQtySelected.bind(this)} isOpen={this.state.isOpenUsedSettingDailog} dict={this.state.dict}/>
        </Page>
      </DocumentTitle >
    );
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

}
function mapStateToProps(state) {
  return {
    moldPartReplaceRepair: state.mold.moldMaintenance.moldPartReplaceRepair
  };
}

function mapDispatchToProps(dispatch) {
  return {
    moldPartReplaceRepairInput(value) {
      dispatch(moldPartReplaceRepairInput(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MoldPartsMainteReplaceRepair);

class StockSelectDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  componentDidUpdate(prevProps) {
    if(prevProps.isOpen !== this.props.isOpen) {
      this.setState({isOpen: this.props.isOpen});
    }
  }

  stockInfoPnl(stock) {
    return <ListItem key={stock.id} onClick={()=>{this.props.onSelected(this.props.moldPartRel, stock);}}>
      <Block className="container-mold_part margin-top-0">
        <ListItemRow>
          <ListItemCell>{this.props.dict.mold_id}</ListItemCell>
          <ListItemCell>{stock.mold.moldId}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.props.dict.mold_part_storage}</ListItemCell>
          <ListItemCell>{stock.storageCode}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.props.dict.mold_part_stock_qty}</ListItemCell>
          <ListItemCell>{String(stock.stock)}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.props.dict.mold_part_used_stock_qty}</ListItemCell>
          <ListItemCell>{String(stock.usedStock)}</ListItemCell>
        </ListItemRow>
      </Block>
    </ListItem>;
  }

  render() {
    return (<Modal style={{overlay: modalStyle.overlay, content: Object.assign({height: '80%'}, modalStyle.content)}} 
      isOpen={this.state.isOpen} 
      shouldCloseOnOverlayClick={false}
      parentSelector={() => document.querySelector('#mold-mainte-replace-repair-page')}>
      <Block>
        {this.props.dict.msg_mold_part_select_out_target.replace('%s', this.props.moldPartRel ? this.props.moldPartRel.moldPartCode : '')}
      </Block>
      <List className={'no-margin no-padding normalFont'}>
        {(this.props.moldPartRel ? this.props.moldPartRel.stocks : []).map(stock=>this.stockInfoPnl.bind(this)(stock))}
      </List>
    </Modal>);
  }
}

class PartialReplaceDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      replaceQty : 0
    };
  }

  createPcker() {
    this.setState({replaceQty : this.props.moldPartRel.replaceQty});
    const quantity = Math.max(this.props.moldPartRel.quantity - 1, 1);
    const arr = new Array(quantity).fill(1).map((n, i)=>n + i);
    const picker = this.$f7.picker.create({
      inputEl: '#replaceQty',
      formatValue: (values, displayValues)=>displayValues[0],
      cols:[{
        textAlign: 'center',
        values: arr,
        displayValues: arr,
        onChange: (picker, value)=>{
          this.setState({replaceQty: value});
        }
      }]
    });
    picker.setValue([quantity], quantity);
  }

  render() {
    return (<Modal 
      style={{overlay: modalStyle.overlay, content: Object.assign({maxWidth: 300}, modalStyle.content)}}
      isOpen={this.props.isOpen} 
      onAfterOpen={this.createPcker.bind(this)} 
      shouldCloseOnOverlayClick={false}
      parentSelector={() => document.querySelector('#mold-mainte-replace-repair-page')}>
      <Block>
        <Label>{this.props.dict.mold_part_replace_partially + ' : ' + (this.props.moldPartRel ? this.props.moldPartRel.moldPartCode : '')}</Label>
        <Label>{this.props.dict.msg_mold_part_replace_partially.replace('%mold_part_code%', this.props.moldPartRel ? this.props.moldPartRel.moldPartCode : '')}</Label>
        <p/>
        <Input inputId='replaceQty' type="number" value={this.state.replaceQty}></Input>
        <Button fill style={{width: 100, margin: '0 auto'}} onClick={()=>{this.props.onSelected(this.props.moldPartRel, this.state.replaceQty);}}>{this.props.dict.ok}</Button>
      </Block>
    </Modal>);
  }
}

class RecycleDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recycleQty: 0
    };
    this.recycleIncremented = this.recycleIncremented.bind(this);
    this.disposeIncremented = this.disposeIncremented.bind(this);
  }

  afterOpen() {
    this.setState({recycleQty: this.props.moldPartRel.recycleQty});
  }

  recycleIncremented(dif) {
    const maxVal = this.props.moldPartRel.replaceQty;
    const newVal = this.state.recycleQty + dif;
    if(newVal >= 0 && newVal <= maxVal) {
      this.setState({recycleQty: newVal});
    }
  }

  disposeIncremented(dif) {
    this.recycleIncremented(-1 * dif);
  }

  render() {
    return (<Modal 
      style={{overlay: modalStyle.overlay, content: Object.assign({maxWidth: 300}, modalStyle.content)}} 
      isOpen={this.props.isOpen} 
      onAfterOpen={this.afterOpen.bind(this)}
      shouldCloseOnOverlayClick={false}
      parentSelector={() => document.querySelector('#mold-mainte-replace-repair-page')}>
      <Block>
        <Label>{this.props.dict.msg_mold_part_recyclable.replace('%s', this.props.moldPartRel ? this.props.moldPartRel.moldPartCode : '')}</Label>
        <Label>{this.props.dict.mold_part_exchange_quantity + ' : ' + (this.props.moldPartRel ? this.props.moldPartRel.replaceQty : 0)}</Label>
        <IncrementableInput label={this.props.dict.mold_part_recycle_quantity} value={this.state.recycleQty} onIncremented={this.recycleIncremented}/>
        <IncrementableInput label={this.props.dict.mold_part_dispose_quantity} value={(this.props.moldPartRel ? this.props.moldPartRel.replaceQty : 0) - this.state.recycleQty} onIncremented={this.disposeIncremented}/>
        <Button fill onClick={()=>{this.props.onSelected(this.props.moldPartRel, this.state.recycleQty);}} style={{width: 100, margin: '0 auto'}}>{this.props.dict.ok}</Button>
      </Block>
    </Modal>);
  }
}

class UsedSettingDailog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromNewQty: 0
    };
    this.fromNewIncremented = this.fromNewIncremented.bind(this);
    this.fromUsedIncremented = this.fromUsedIncremented.bind(this);
  }

  afterOpen() {
    this.setState({fromNewQty: Math.min(this.props.moldPartRel.fromNewQty, this.props.moldPartRel.replaceQty)});
  }

  fromNewIncremented(dif) {
    const maxVal = this.props.moldPartRel.replaceQty;
    const newVal = this.state.fromNewQty + dif;
    if(newVal >= 0 && newVal <= maxVal) {
      this.setState({fromNewQty: newVal});
    }
  }

  fromUsedIncremented(dif) {
    this.fromNewIncremented(-1 * dif);
  }

  render() {
    return (<Modal 
      style={{overlay: modalStyle.overlay, content: Object.assign({maxWidth: 300}, modalStyle.content)}} 
      isOpen={this.props.isOpen} 
      onAfterOpen={this.afterOpen.bind(this)}
      shouldCloseOnOverlayClick={false}
      parentSelector={() => document.querySelector('#mold-mainte-replace-repair-page')}>
      <Block>
        <Label>{this.props.dict.msg_mold_part_both_new_used.replace('%s', this.props.moldPartRel ? this.props.moldPartRel.moldPartCode : '')}</Label>
        <Label>{this.props.dict.mold_part_exchange_quantity + ' : ' + (this.props.moldPartRel ? this.props.moldPartRel.replaceQty : 0)}</Label>
        <Label>{this.props.dict.mold_part_new_stock + ' : ' + (this.props.moldPartRel && this.props.moldPartRel.replaceStock ? this.props.moldPartRel.replaceStock.stock : 0)}</Label>
        <Label>{this.props.dict.mold_part_used_stock + ' : ' + (this.props.moldPartRel && this.props.moldPartRel.replaceStock ? this.props.moldPartRel.replaceStock.usedStock : 0)}</Label>
        <IncrementableInput label={this.props.dict.mold_part_replace_qty_from_new} value={this.state.fromNewQty} onIncremented={this.fromNewIncremented}/>
        <IncrementableInput label={this.props.dict.mold_part_replace_qty_from_used} value={(this.props.moldPartRel ? this.props.moldPartRel.replaceQty : 0) - this.state.fromNewQty} onIncremented={this.fromUsedIncremented}/>
        <Button fill onClick={()=>{this.props.onSelected(this.props.moldPartRel, this.state.fromNewQty);}} style={{width: 100, margin: '0 auto'}}>{this.props.dict.ok}</Button>
      </Block>
    </Modal>);
  }
}

function IncrementableInput(props) {
  return (<Block style={{padding: 0, margin:0}}>
    <List noHairlinesMd style={{margin:0}}>
      <ListItem>
        <Button iconF7="delete_round_fill" onClick={()=>{props.onIncremented(-1);}} style={{padding: 0, minWidth:40}}></Button>
        <Block style={{padding: 0, margin:0}}>
          <Label>{props.label}</Label>
          <Input value={props.value} type="number" readonly={true}></Input>
        </Block>
        <Button iconF7="add_round_fill" onClick={()=>{props.onIncremented(1);}}></Button>
      </ListItem>
    </List>
  </Block>);
}