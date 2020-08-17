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
import Authentication from 'karte/shared/logics/authentication';
import Choice from 'karte/shared/master/choice';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { UnexpectedError } from 'karte/shared/logics/errors';
import MachineMaster from 'karte/shared/master/machine';

export default class Machine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        machine_select: '',
        user_department: '',
        close: '',
        cancel: '',
        machine: '',
        machine_id: '',
        machine_name: '',
        search: '',
        mst_error_record_not_found: '',
      },
      machineName: '',
      department: 0,
      departmentName: '',
      machineList: [],
      emptyMsg: ''
    };
    this.departments = [];
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

  /**
     * 発生場所Picker作成
     */
  createPickerDepartment(setDefault) {
    var me = this;
    var _values = [0];
    var _displayValues = [''];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.departments.length; i++) {
      let department = me.departments[i];
      _values.push(department.seq);
      _displayValues.push(department.choice);
      //ログインユーザーの所属に等しいものをデフォルトとする
      if (me.state.department === department.seq) {
        defaultValue = department.seq;
        defaultName = department.choice;
      }
    }
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    me.pickerDepartment = me.createPicker('#search-machine-page-department', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ department: value });
        me.setState({ departmentName: displayValue });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerDepartment.setValue([defaultValue], 0);
      me.setState({ department: defaultValue });
      me.setState({ departmentName: defaultName });
    }
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
    MachineMaster.getMachineWithoutDispose({
      machineName: me.state.machineName,
      department: me.state.department
    })
      .then(response => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if (response.mstMachineVos.length > 0) {
          this.setState({
            machineList: response.mstMachineVos
          });
        } else {
          this.setState({
            machineList: [],
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
    if (this.props.onSelectedCell) {
      this.props.onSelectedCell(item);
    }
    this.$f7router.back();
  }
  /**
   * データテーブル描画
   */
  renderTable() {
    var tdList = [];
    for (var i = 0; i < this.state.machineList.length; i++) {
      var machine = this.state.machineList[i];
      tdList.push(
        <tr key={i} onClick={this.selectedCell.bind(this, machine)}>
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
 * Picker作成共通処理
 * @param {*} elementName 
 * @param {*} _values 
 * @param {*} _displayValues 
 * @param {*} onColChange 
 */
  createPicker(elementName, _values, _displayValues, onColChange) {
    var me = this;
    const app = me.$f7;
    return app.picker.create({
      inputEl: elementName,
      formatValue: function (values, displayValues) {
        return displayValues[0];
      },
      routableModals: false, //URLを変更しない
      toolbarCloseText: me.state.dict.close,
      cols: [
        {
          textAlign: 'center',
          values: _values,
          displayValues: _displayValues,
          onChange: onColChange
        }
      ],
    });
  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    //ログインユーザーの所属、所属選択肢読み込み、所属Picker作成。
    Promise.all([Authentication.whoAmI(), Choice.categories('mst_user.department', {})])
      .then((values) => {
        let responseWho = values[0];
        let responseChoice = values[1];
        let { department } = this.$f7route.query;
        if (!department) {
          me.state.department = responseWho.department;
        } else {
          me.state.department = department;
        }
        me.departments = [...responseChoice.mstChoiceVo];
        me.createPickerDepartment(true);
        if (me.state.department !== '0') {
          this.buttonSearch();
        }
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  onPageBeforeRemove() {
    this.$f7.preloader.hide();
  }

  render() {
    return <Page onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <BlockTitle>{this.state.dict.machine_search}</BlockTitle>
      <List noHairlinesBetween className="no-margin-top no-margin-bottom">
        <ListItem>
          <Label>{this.state.dict.user_department}</Label> {/* ログインユーザーの所属を初期セット */}
          <Input type="text" name="department" clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="search-machine-page-department" />
        </ListItem>
        <ListItem className="custom-list-item">
          <Label>{this.state.dict.machine_name}</Label>
          <Input type="text" name="machineName" value={this.state.machineName} onChange={this.handleChange.bind(this)} onInputClear={this.handleClear.bind(this)} clearButton inputId="search-machine-page-machine-name" />
          <div className="btn-absolute">
            <Button small fill text={this.state.dict.search} onClick={this.buttonSearch.bind(this)}></Button>
          </div>
        </ListItem>
      </List>
      {this.state.machineList.length < 1 ? <Block>{this.state.emptyMsg}</Block> : this.renderTable()}
    </Page>;
  }
}