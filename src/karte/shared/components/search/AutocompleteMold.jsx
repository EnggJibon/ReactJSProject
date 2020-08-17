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
import MoldMaster from 'karte/shared/master/mold';

export default class AutocompleteMold extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        mold_select: '',
        select_record: '',
        cancel: '',
        mold: '',
        mold_id: '',
        mold_name: '',
        search: '',
        mst_error_record_not_found:''
      },
      opened: false,
      moldId: '',
      moldList: [],
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
        moldId: '',
        moldList: []
      });
      return false;
    }
    if (event.target.value === this.state.moldId) {
      return false;
    }
    this.setState({
      moldId: event.target.value
    });
    var me = this;
    // //Preloaderを表示すること
    me.$f7.preloader.show();
    MoldMaster.getMoldLike({
      moldId: event.target.value
    })
      .then((response) => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if (response.mstMoldAutoComplete && response.mstMoldAutoComplete.length > 0) {
          if (response.mstMoldAutoComplete.length > 1) {
            this.setState({
              opened: true,
              moldList: response.mstMoldAutoComplete
            });
          } else {
            this.props.onComplete(response.mstMoldAutoComplete[0]);
            this.setState({
              opened: false,
              moldId: response.mstMoldAutoComplete[0].moldId,
              moldList: []
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
    var item = this.state.moldList[selectedRowId];
    if (item) {
      this.setState({
        opened: false,
        moldId: item.moldId,
        moldList: []
      });
      this.props.onComplete(item);
    }
  }
  //キャンセル
  handleCancel() {
    this.setState({
      opened: false,
      moldId: '',
      moldList: []
    });
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
    return <div>
      <Input {...this.props} onBlur={this.handleBlur.bind(this)} />
      <Popup className="demo-popup" opened={this.state.opened} onPopupClosed={() => { this.setState({ opened: false }); }}>
        <Page>
          <AppNavbar applicationTitle={this.props.applicationTitle} showBack={true} backClick={this.handleCancel.bind(this)} hideNavRight={true}></AppNavbar>
          <BlockTitle>{this.state.dict.mold_select}</BlockTitle>
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