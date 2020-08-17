import React from 'react';
import {
  Page,
  Button,
  Block,
  List,
  ListItem,
  ListItemRow,
  ListItemCell
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import MoldMaintenance from 'karte/apps/mold/logics/mold-maintenance';

export default class OrderPointAlertPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        mold_id: '',
        mst_mold_part_mold_part_code: '',
        mold_part_storage: '',
        mold_part_stock_qty: '',
        mold_part_used_stock_qty: '',
        mold_part_order_point: '',
        mold_part_order_unit: '',
        msg_mold_part_reach_order_point: '',
        ok: ''
      },
      stocks:[]
    };
  }

  onPageInit() {
    DictionaryLoader.getDictionary(this.state.dict)
      .then(dictVals=>this.setState({dict: dictVals}))
      .catch(err=>this.setState(()=>{ throw new UnexpectedError(err);}));
    const id = this.$f7route.query.id;
    MoldMaintenance.getOrderPointList(id)
      .then(resp=>this.setState({stocks: resp.obj}))
      .catch(err=>this.setState(()=>{ throw new UnexpectedError(err);}));
  }

  exit() {
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-sub-menu', { pushState: true });
  }

  stockInfoPnl(stock) {
    return <ListItem key={stock.id}>
      <Block className="container-mold_part margin-top-0">
        <ListItemRow>
          <ListItemCell>{this.state.dict.mold_id}</ListItemCell>
          <ListItemCell>{stock.mold.moldId}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.state.dict.mst_mold_part_mold_part_code}</ListItemCell>
          <ListItemCell>{stock.moldPart.moldPartCode}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.state.dict.mold_part_storage}</ListItemCell>
          <ListItemCell>{stock.storageCode}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.state.dict.mold_part_stock_qty}</ListItemCell>
          <ListItemCell>{String(stock.stock)}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.state.dict.mold_part_used_stock_qty}</ListItemCell>
          <ListItemCell>{String(stock.usedStock)}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.state.dict.mold_part_order_point}</ListItemCell>
          <ListItemCell>{String(stock.orderPoint)}</ListItemCell>
        </ListItemRow>
        <ListItemRow>
          <ListItemCell>{this.state.dict.mold_part_order_unit}</ListItemCell>
          <ListItemCell>{String(stock.orderUnit)}</ListItemCell>
        </ListItemRow>
      </Block>
    </ListItem>;
  }

  render() {
    return <Page id="order_point_alert_page" onPageInit={this.onPageInit.bind(this)}>
      <Block>{this.state.dict.msg_mold_part_reach_order_point}</Block>
      <List>{this.state.stocks.map(stock=>{
        return (this.stockInfoPnl.bind(this)(stock));
      })}</List>
      <Button fill style={{width: 100, margin: '0 auto'}} onClick={this.exit.bind(this)}>{this.state.dict.ok}</Button>
    </Page>;
  }
}