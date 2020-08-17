import React from 'react';
import {
  Navbar,
  Page,
  BlockTitle,
  Radio,
  Toolbar,
  Button,
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';

export default class SingleComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        component_select: '',
        select_record: '',
        cancel: '',
        component: '',
        component_code: '',
        component_name: '',
        search: '',
        mst_error_record_not_found: ''
      },
      componentList: [],
      selectedRowId: ''
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
    if ( this.props.data.length > 0) {
      this.setState({
        componentList: this.props.data,
      });
    }else{
      this.setState({
        componentList: [],
      });
    }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if ( newProps.data.length > 0) {
      this.setState({
        componentList: newProps.data,
      });
    }else{
      this.setState({
        componentList: [],
      });
    }
  }

  
  handleChange(event) {
    if (event.target.checked) {
      this.setState({
        selectedRowId: event.target.value,
      });
    }
  }
  //選択
  handleSelected() {
    if(this.props.onComplete){
      var selectedRowId = this.state.selectedRowId;
      var item = this.state.componentList[selectedRowId];
      if (item) {
        this.props.onComplete(item);
        this.setState({
          componentList: [],
          selectedRowId:''
        });
      }
    }
    this.$f7router.back();
  }
  //キャンセル
  handleCancel() {
    this.$f7router.back();
  }
  /**
   * データテーブル描画
   */
  renderTable() {
    var tdList = [];
    for (var i = 0; i < this.state.componentList.length; i++) {
      var component = this.state.componentList[i];
      tdList.push(
        <tr key={i}>
          <td className="label-cell"><Radio className="no-fastclick" name="component" onChange={this.handleChange.bind(this)} value={i} /></td>
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
              <th className="label-cell"></th>
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
    return <Page>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <BlockTitle>{this.state.dict.component_select}</BlockTitle>
      {this.renderTable()}
      <Toolbar bottomIos={true} bottomMd={true}>
        <Button onClick={this.handleSelected.bind(this)}>{this.state.dict.select_record}</Button>
        <Button onClick={this.handleCancel.bind(this)}>{this.state.dict.cancel}</Button>
      </Toolbar>
    </Page>;
  }
}