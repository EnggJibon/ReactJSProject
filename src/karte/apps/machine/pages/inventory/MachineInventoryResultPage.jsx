import React, {Fragment} from 'react';
import DocumentTitle from 'react-document-title';
import {
  Page,
  Label,
  Block,
  BlockTitle,
  //  List,
  Navbar,
  NavTitle,
  NavRight,
  NavLeft,
  Toolbar,
  Link,
} from 'framework7-react';
//import AppNavbar from 'karte/shared/components/AppNavbar';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import {UnexpectedError} from 'karte/shared/logics/errors';
import { connect } from 'react-redux';
import {deleteLastSearchCondition, clearSearchCondition, autoSearch} from 'karte/apps/machine/reducers/machine-inventory-reducer';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import MachineInventory from 'karte/apps/machine/logics/machine-inventory';
import {API_BASE_URL} from 'karte/shared/logics/api-agent';
import Authentication from 'karte/shared/logics/authentication';

const INIT_ROW_COUNT = 20;

class MachineInventoryResultPage extends React.Component {
  /**
   * コンストラクタ
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        sp_machine_inventory: '',
        msg_sp_machine_inventory_search_result: '',
        op_download: '',
        continue_search: '',
        machine_id: '',
        machine_name: '',
        mst_error_record_not_found: ''
      },
      msgSearchResult: '',
      machineStocktake: {
        machines: []
      },
      noResult: false,
      rowCount: INIT_ROW_COUNT,
      showPreloader: true
    };
    this.continueSearch = false; //続けて検索がクリックされたかどうか？
    this.setResultToState = this.setResultToState.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.screenId = 'sp_machine_stocktake';
  }

  /**
   * コンポーネントマウント時
   */
  componentDidMount() {
    var me = this;
    me.$f7.preloader.show();
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function(values) {
        me.setState({dict: values});
        const machineInventory = new MachineInventory();
        machineInventory.searchMachineInventory(me.props.searchCond)
          .then((res) => {
            me.setResultToState(res.machineStocktake);
            me.$f7.preloader.hide();
            if (me.state.rowCount > me.state.machineStocktake.machines.length) {
              me.setState({showPreloader: false});
            }
          })
          .catch((err) => {
            var error = err;
            me.setState(() => { throw new UnexpectedError(error); });
          });
      })
      .catch(function(err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  /**
   * 検索結果をステートにセット
   * @param {*} machineStocktake 
   */
  setResultToState(machineStocktake) {
    var cnt = machineStocktake.machines.length;
    this.setState({machineStocktake: machineStocktake});
    this.setState({msgSearchResult: 
      cnt > 0 ?
        this.state.dict.msg_sp_machine_inventory_search_result.replace('%s', cnt) :
        this.state.dict.mst_error_record_not_found
    });
    this.setState({noResult: cnt <= 0});
  }

  /**
   * 指定された検索条件の表示文字列を作成
   * @param {*} searchCond 
   */
  searchCondLabel(searchCond) {
    return searchCond.companyName + ', ' + searchCond.locationName + ', ' + searchCond.installationSiteName + ' ,' + searchCond.departmentName;
  }

  /**
   * 戻るボタン押下
   */
  backClick() {
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-inventory', {pushState:false, reloadAll: true});
    //一番最後の検索条件を減らす
    this.props.deleteLastSearchCondition();
    this.continueSearch = true;
    this.props.autoSearch(true);
  }

  /**
   * 続けて検索ボタン押下
   */
  continueSearchClick() {
    this.continueSearch = true;
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-inventory', {pushState:false, reloadAll: true});
    this.props.autoSearch(true);
  }

  /**
   * ダウンロードボタン押下
   */
  downloadClick() {
    //ネイティブアプリを起動。ファイルダウンロードAPIのURLと認証トークンをパラメータに渡す
    var downloadApiUrl = API_BASE_URL + 'files/download/csv/' + this.state.machineStocktake.outputFileUuid; 
    var appPath = 'konica://konica-inventorylist?jsonurl=' + encodeURIComponent(downloadApiUrl) + '&token=' + Authentication.getToken();
    window.location = appPath;
    //window.location.href = API_BASE_URL + 'files/download/csv/' + this.state.machineStocktake.outputFileUuid; 
    //'http://192.168.1.45/ws/karte/api/files/download/csv/6c62388f3b9f466ebebbbea7614ff0f5';
  }

  /**
   * データテーブル描画
   */
  renderTable() {
    if (this.state.noResult) {
      return '';
    }
    var tdList = [];
    for (var i = 0; i < this.state.machineStocktake.machines.length && i < this.state.rowCount; i++) {
      var machine = this.state.machineStocktake.machines[i];
      tdList.push(
        <Fragment key={i}>
          <tr>
            <td className="label-cell">{machine.machineId}</td>
            <td className="label-cell">{machine.machineName}</td>
          </tr>
        </Fragment>
      );
    }
    return (
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th className="label-cell">{this.state.dict.machine_id}</th>
              <th className="label-cell">{this.state.dict.machine_name}</th>
            </tr>
          </thead>
          <tbody>
            {tdList}
          </tbody>
        </table>
      </div>
    );
  }

  /**
   * Event will be triggered right before page is going to be transitioned out of view
   */
  onPageBeforeOut() {
    //続けて検索ボタンが押されていなければ、検索条件をすべてクリアする
    if (!this.continueSearch) {
      this.props.clearSearchCondition();
      this.props.autoSearch(false);
    }
  }

  showMore() {
    var currentRowCount = this.state.rowCount;
    if (currentRowCount > this.state.machineStocktake.machines.length) {
      this.setState({showPreloader: false});
      return;
    }
    this.setState({rowCount: currentRowCount + INIT_ROW_COUNT});
  }

  /**
   * 画面描画
   */
  render() {
    var searchCondList = [];
    for (var i = 0; i < this.props.searchCond.length; i++) {
      searchCondList.push(<Label key={i}>{this.searchCondLabel(this.props.searchCond[i])}</Label>);
    }
    return (
      <DocumentTitle title={this.state.dict.sp_machine_inventory}>
        <Page hideNavbarOnScroll onPageBeforeOut={this.onPageBeforeOut.bind(this)} 
          infinite onInfinite={this.showMore.bind(this)} infinitePreloader={this.state.showPreloader}>
          {// Navbarを固定するにはPage直下に置く必要があるため、このページではAppNavbarを使わない。
          //<AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.backClick.bind(this)}/>
          }
          <Navbar >
            <NavLeft><Link iconF7="arrow_left" onClick={this.backClick.bind(this)}/></NavLeft>
            <NavTitle><Link noLinkClass href={APP_DIR_PATH + '/'} text={this.state.dict.application_title}/></NavTitle>
            <NavRight>
              <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="right"></Link>
            </NavRight>
          </Navbar>
          <Toolbar bottomMd hidden={this.state.noResult}>
            <Link onClick={this.continueSearchClick.bind(this)}>{this.state.dict.continue_search}</Link>
            <Link onClick={this.downloadClick.bind(this)}>{this.state.dict.op_download}</Link>
          </Toolbar>

          <BlockTitle>{this.state.dict.sp_machine_inventory}</BlockTitle>
          <Block className="no-margin-top no-margin-bottom">
            {searchCondList}
          </Block>
          <Block className="smallMargin">
            <p>{this.state.msgSearchResult}</p>
          </Block>
          {this.renderTable()}
        </Page>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchCond: state.machine.machineInventory.searchCond,
    autoSearch: state.mold.moldInventory.autoSearch
  };
}

function mapDispatchToProps(dispatch) {
  return {
    deleteLastSearchCondition(value) {
      dispatch(deleteLastSearchCondition(value));
    },
    clearSearchCondition(value) {
      dispatch(clearSearchCondition(value));
    },
    autoSearch(value) {
      dispatch(autoSearch(value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineInventoryResultPage);
