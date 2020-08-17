import React from 'react';
import {
  Popup,
  Page,
  BlockTitle,
  Input,
  Radio,
  Toolbar,
  Button,
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import AppNavbar from 'karte/shared/components/AppNavbar';
import ComponentMaster from 'karte/shared/master/component';

export default class AutocompleteComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        component_select: '',
        select_record: '',
        cancel: '',
        component: '',
        component_code: '',
        component_name: '',
        search: '',
        mst_error_record_not_found: ''
      },
      opened: false,
      componentCode: '',
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
  }
  handleBlur(event) {
    if (event.target.value === '') {
      this.setState({
        opened: false,
        componentCode: '',
        componentList: []
      });
      return false;
    }
    if (event.target.value === this.state.componentCode) {
      return false;
    }
    this.setState({
      componentCode: event.target.value
    });
    var me = this;
    // //Preloaderを表示すること
    me.$f7.preloader.show();
    ComponentMaster.getComponentLike({
      componentCode: event.target.value
    })
      .then((response) => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if (response.mstComponents && response.mstComponents.length > 0) {
          if (response.mstComponents.length > 1) {
            this.setState({
              opened: true,
              componentList: response.mstComponents
            });
          } else {
            this.props.onComplete(response.mstComponents[0]);
            this.setState({
              opened: false,
              componentCode: response.mstComponents[0].componentCode,
              componentList: []
            });
          }
        } else {
          me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
        }
      })
      .catch(function (err) {
        //Preloaderを消去
        me.$f7.preloader.hide();
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  handleChange(event) {
    this.setState({
      selectedRowId: event.target.value,
    });
  }

  //選択
  handleSelected() {
    var selectedRowId = this.state.selectedRowId;
    var item = this.state.componentList[selectedRowId];
    if (item) {
      this.setState({
        opened: false,
        componentCode: item.componentCode,
        componentList: []
      });
      this.props.onComplete(item);
    }
  }
  //キャンセル
  handleCancel() {
    this.setState({
      opened: false,
      componentCode: '',
      componentList: []
    });
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
    let popup = <Popup key={1} className="demo-popup" opened={this.state.opened} onPopupClosed={() => { this.setState({ opened: false }); }}>
      <Page>
        <AppNavbar applicationTitle={this.props.applicationTitle} showBack={true} backClick={this.handleCancel.bind(this)} hideNavRight={true}></AppNavbar>
        <BlockTitle>{this.state.dict.component_select}</BlockTitle>
        {this.renderTable()}
        <Toolbar bottomIos={true} bottomMd={true}>
          <Button onClick={this.handleSelected.bind(this)}>{this.state.dict.select_record}</Button>
          <Button onClick={this.handleCancel.bind(this)}>{this.state.dict.cancel}</Button>
        </Toolbar>
      </Page>
    </Popup>;
    let input = <Input key={0} {...this.props} onBlur={this.handleBlur.bind(this)} />;
    return [input,popup];
  }
}