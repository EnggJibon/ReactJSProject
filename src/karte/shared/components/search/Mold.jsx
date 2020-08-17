import React from 'react';
import {
  Navbar,
  Page,
  Block,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  //Col,
  Button,
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import MoldMaster from 'karte/shared/master/mold';

export default class Mold extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        mold_select: '',
        cancel: '',
        mold: '',
        mold_id: '',
        mold_name: '',
        search: '',
        mst_error_record_not_found: '',
      },
      moldName: '',
      moldList: [],
      emptyMsg: ''
    };
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

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }
  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称(companyId等)が入っている
    this.setState({ [event.target.name]: ''});
  }
  buttonSearch() {
    let me = this;
    // //Preloaderを表示すること
    me.$f7.preloader.show();
    MoldMaster.getMoldListWithoutDispose({
      moldName: me.state.moldName
    })
      .then(response => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if (response.mstMoldDetail.length > 0) {
          this.setState({
            moldList: response.mstMoldDetail
          });
        } else {
          this.setState({
            moldList: [],
            emptyMsg: this.state.dict.mst_error_record_not_found
          });
        }
      })
      .catch(function (err) {
        //Preloaderを消去
        me.$f7.preloader.hide();
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  selectedCell(item) {
    if(this.props.onSelectedCell) {
      this.props.onSelectedCell(item);
    }
    this.$f7router.back();
  }
  /**
   * データテーブル描画
   */
  renderTable() {
    var tdList = [];
    for (var i = 0; i < this.state.moldList.length; i++) {
      var mold = this.state.moldList[i];
      tdList.push(
        <tr key={i} onClick={this.selectedCell.bind(this, mold)}>
          <td className="label-cell">{mold.moldId}</td>
          <td className="label-cell">{mold.moldName}</td>
        </tr>
      );
    }
    return (
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th className="label-cell">{this.state.dict.mold_id}</th>
              <th className="label-cell">{this.state.dict.mold_name}</th>
            </tr>
          </thead>
          <tbody>
            {tdList}
          </tbody>
        </table>
      </div>
    );
  }
  onPageBeforeRemove(){
    this.$f7.preloader.hide();
  }
  render() {
    return <Page onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <BlockTitle>{this.state.dict.mold_search}</BlockTitle>
      <List noHairlinesBetween className="no-margin-top no-margin-bottom">
        <ListItem className="custom-list-item">
          <Label>{this.state.dict.mold_name}</Label>
          <Input type="text" name="moldName" value={this.state.moldName} onChange={this.handleChange.bind(this)} onInputClear={this.handleClear.bind(this)} clearButton inputId="search-mold-page-mold-name" />
          <div className="btn-absolute">
            <Button small fill text={this.state.dict.search} onClick={this.buttonSearch.bind(this)}></Button>
          </div>
        </ListItem>
      </List>
      {this.state.moldList.length < 1 ? <Block>{this.state.emptyMsg}</Block> : this.renderTable()}
    </Page>;
  }
}