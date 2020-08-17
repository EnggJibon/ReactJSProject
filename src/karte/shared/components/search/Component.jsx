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
import ComponentMaster from 'karte/shared/master/component';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        component_search: '',
        cancel: '',
        component: '',
        component_code: '',
        component_name: '',
        search: '',
        mst_error_record_not_found: '',
      },
      componentName: '',
      componentList: [],
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
    ComponentMaster.getComponent({
      componentName: me.state.componentName
    })
      .then((response) => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if(response.mstComponents.length > 0){
          this.setState({
            componentList: response.mstComponents
          });
        }else{
          this.setState({
            componentList:[],
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
  onPageBeforeRemove(){
    this.$f7.preloader.hide();
  }
  /**
   * データテーブル描画
   */
  renderTable() {
    var tdList = [];
    for (var i = 0; i < this.state.componentList.length; i++) {
      var component = this.state.componentList[i];
      tdList.push(
        <tr key={i} onClick={this.selectedCell.bind(this, component)}>
          <td className="label-cell">{component.componentCode}</td>
          <td className="label-cell">{component.componentName}</td>
        </tr>
      );
    }
    return (
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th className="label-cell">{this.state.dict.component_code}</th>
              <th className="label-cell">{this.state.dict.component_name}</th>
            </tr>
          </thead>
          <tbody>
            {tdList}
          </tbody>
        </table>
      </div>
    );
  }
  render() {
    return <Page onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <BlockTitle>{this.state.dict.component_search}</BlockTitle>
      <List noHairlinesBetween className="no-margin-top no-margin-bottom">
        <ListItem className="custom-list-item">
          <Label>{this.state.dict.component_name}</Label>
          <Input type="text" name="componentName" value={this.state.componentName} onChange={this.handleChange.bind(this)} onInputClear={this.handleClear.bind(this)} clearButton inputId="search-component-page-component-name" />
          <div className="btn-absolute">
            <Button small fill text={this.state.dict.search} onClick={this.buttonSearch.bind(this)}></Button>
          </div>
        </ListItem>
      </List>
      {this.state.componentList.length < 1?<Block>{this.state.emptyMsg}</Block>:this.renderTable()}
    </Page>;
  }
}