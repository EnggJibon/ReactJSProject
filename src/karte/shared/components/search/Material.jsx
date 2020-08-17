import React from 'react';
import {
  Navbar,
  Page,
  BlockTitle,
  Block,
  List,
  ListItem,
  Label,
  Input,
  //Col,
  Button,
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import MaterialMaster from 'karte/shared/master/material';

export default class Material extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        material_search: '',
        cancel: '',
        material_code: '',
        material_name: '',
        search: '',
        mst_error_record_not_found:''
      },
      materialName: '',
      materialList: [],
      emptyMsg:''
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
    MaterialMaster.getMaterial({
      materialName: me.state.materialName
    })
      .then(response => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if(response.mstMaterialList.length > 0){
          this.setState({
            materialList: response.mstMaterialList
          });

        }else{
          this.setState({
            materialList:[],
            emptyMsg:this.state.dict.mst_error_record_not_found
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
    if(this.props.onSelectedCell){
      this.props.onSelectedCell(item);
    }
    this.$f7router.back();
  }
  /**
   * データテーブル描画
   */
  renderTable() {
    var tdList = [];
    for (var i = 0; i < this.state.materialList.length; i++) {
      var material = this.state.materialList[i];
      tdList.push(
        <tr key={i} onClick={this.selectedCell.bind(this, material)}>
          <td className="label-cell">{material.materialCode}</td>
          <td className="label-cell">{material.materialName}</td>
        </tr>
      );
    }
    return (
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th className="label-cell">{this.state.dict.material_code}</th>
              <th className="label-cell">{this.state.dict.material_name}</th>
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
      <BlockTitle>{this.state.dict.material_search}</BlockTitle>
      <List noHairlinesBetween className="no-margin-top no-margin-bottom">
        <ListItem className="custom-list-item">
          <Label>{this.state.dict.material_name}</Label>
          <Input type="text" name="materialName" value={this.state.materialName} onChange={this.handleChange.bind(this)} onInputClear={this.handleClear.bind(this)} clearButton inputId="search-material-page-material-name" />
          <div className="btn-absolute">
            <Button small fill text={this.state.dict.search} onClick={this.buttonSearch.bind(this)}></Button>
          </div>
        </ListItem>
      </List>
      {this.state.materialList.length < 1?<Block>{this.state.emptyMsg}</Block>:this.renderTable()}
    </Page>;
  }
}