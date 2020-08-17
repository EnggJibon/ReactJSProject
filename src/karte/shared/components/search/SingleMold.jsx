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

export default class SingleMold extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        mold_select: '',
        select_record: '',
        cancel: '',
        mold: '',
        mold_id: '',
        mold_name: '',
        search: '',
        mst_error_record_not_found: ''
      },
      moldList: [],
      selectedRowId: []
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
    if(this.props.data !== undefined){
      if (this.props.data.length > 0) {
        this.setState({
          moldList: this.props.data,
        });
      }else{
        this.setState({
          moldList: [],
        });
      }
    }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if(newProps.data !== undefined){
      if (newProps.data.length > 0) {
        this.setState({
          moldList: newProps.data,
        });
      }else{
        this.setState({
          moldList: [],
        });
      }
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
      var item = this.state.moldList[selectedRowId];
      if (item) {
        this.setState({
          moldList: [],
          selectedRowId: ''
        });
        this.props.onComplete(item);
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
    for (var i = 0; i < this.state.moldList.length; i++) {
      var mold = this.state.moldList[i];
      tdList.push(
        <tr key={i}>
          <td className="label-cell"><Radio className="no-fastclick" name="mold" onChange={this.handleChange.bind(this)} value={i} /></td>
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
              <th className="label-cell"></th>
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
  render() {
    return <Page>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <BlockTitle>{this.state.dict.mold_select}</BlockTitle>
      {this.renderTable()}
      <Toolbar bottomIos={true} bottomMd={true}>
        <Button onClick={this.handleSelected.bind(this)}>{this.state.dict.select_record}</Button>
        <Button onClick={this.handleCancel.bind(this)}>{this.state.dict.cancel}</Button>
      </Toolbar>
    </Page>;
  }
}