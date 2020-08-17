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
import MachineMaster from 'karte/shared/master/machine';

export default class AutocompleteMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        machine_select: '',
        select_record: '',
        cancel: '',
        machine_id: '',
        machine_name: '',
        machine: '',
        search: '',
        mst_error_record_not_found:''
      },
      opened: false,
      machineId: '',
      machineList: [],
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
        machineId: '',
        machineList: []
      });
      return false;
    } else if (event.target.value === this.state.machineId) {
      return false;
    } else {
      this.setState({
        machineId: event.target.value
      });
      var me = this;
      // //Preloaderを表示すること
      me.$f7.preloader.show();
      MachineMaster.getMachineLike({
        machineId: event.target.value
      })
        .then((response) => {
          //Preloaderを消去
          me.$f7.preloader.hide();
          if (response.mstMachineAutoComplete && response.mstMachineAutoComplete.length > 0) {
            if (response.mstMachineAutoComplete.length > 1) {
              this.setState({
                opened: true,
                machineList: response.mstMachineAutoComplete
              });
            } else {
              this.props.onComplete(response.mstMachineAutoComplete[0]);
              this.setState({
                opened: false,
                machineId: response.mstMachineAutoComplete[0].machineId,
                machineList: []
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
  }

  handleChange(event) {
    this.setState({
      selectedRowId: event.target.value,
    });
  }

  //選択
  handleSelected() {
    var selectedRowId = this.state.selectedRowId;
    var item = this.state.machineList[selectedRowId];
    if (item) {
      this.setState({
        opened: false,
        machineId: item.machineId,
        machineList: []
      });
      this.props.onComplete(item);
    }
  }
  //キャンセル
  handleCancel() {
    this.setState({
      opened: false,
      machineId: '',
      machineList: []
    });
  }
  /**
   * データテーブル描画
   */
  renderTable() {
    var tdList = [];
    for (var i = 0; i < this.state.machineList.length; i++) {
      var machine = this.state.machineList[i];
      tdList.push(
        <tr key={i}>
          <td className="label-cell"><Radio className="no-fastclick" name="machine" onChange={this.handleChange.bind(this)} value={i} /></td>
          <td className="label-cell">{machine.machineId}</td>
          <td className="label-cell">{machine.machineName}</td>
        </tr>
      );
    }
    return (
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th className="label-cell"></th>
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
  render() {
    return <div>
      <Input {...this.props} onBlur={this.handleBlur.bind(this)} />
      <Popup className="demo-popup" opened={this.state.opened} onPopupClosed={() => { this.setState({ opened: false }); }}>
        <Page>
          <AppNavbar applicationTitle={this.props.applicationTitle} showBack={true} backClick={this.handleCancel.bind(this)} hideNavRight={true}></AppNavbar>
          <BlockTitle>{this.state.dict.machine_select}</BlockTitle>
          {this.renderTable()}
          <Toolbar bottomIos={true} bottomMd={true}>
            <Button onClick={this.handleSelected.bind(this)}>{this.state.dict.select_record}</Button>
            <Button onClick={this.handleCancel.bind(this)}>{this.state.dict.cancel}</Button>
          </Toolbar>
        </Page>
      </Popup>
    </div>;
  }
}