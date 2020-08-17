import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Label,
  Input,
  Button,
  Block,
  Row,
  Col,
  SwipeoutActions,
  SwipeoutButton,
  ListItemRow,
  ListItemCell,
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import AppNavbar from 'karte/shared/components/AppNavbar';
import MachineMaster from 'karte/shared/master/machine';
import MachineMaintenance from 'karte/apps/machine/logics/machine-maintenance';
import moment from 'moment';
import Authentication from 'karte/shared/logics/authentication';
import Choice from 'karte/shared/master/choice';

export default class MachineMainteEndPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        machine_id: '',
        machine_name: '',
        user_department: '',
        machineDepartment:'',
        machine_maintenance_reason_category1: '',
        machine_maintenance_reason: '',
        production_start_user: '',
        search: '',
        mst_error_record_not_found: '',
        sp_machine_maintenance_end: '',
        start_cancel: '',
        msg_confirm_delete: '',
        yes: '',
        no: '',
        measure: '',
        routine: ''
      },
      currentTabIndex: 0,
      modalIsOpen: false,
      machineMaintenanceRemodelingVo: [],
      mstErrorRecordNotFound:'',
      department: 0,
      departmentName: '',
      machineUuid: '',
      machineId: '',
      machineName: ''
    };
    this.departments = [];

  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.createMachineIdAutocomplete();

      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

    //ログインユーザーの所属、所属選択肢読み込み、所属Picker作成。
    Promise.all([Authentication.whoAmI(), Choice.categories('mst_user.department', {})])
      .then((values) => {
        let responseWho = values[0];
        let responseChoice = values[1];
        me.state.department = responseWho.department;
        me.departments = [...responseChoice.mstChoiceVo];
        me.createPickerDepartment(true);
        me.buttonSearch();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
  }

  createMachineIdAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#machine-mainte-end-page-machine-id',
      openIn: 'dropdown',
      valueProperty: 'machineId',  //object's "value" property name
      textProperty: 'machineId', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        MachineMaster.getMachineLike({
          machineId: query
        })
          .then((response) => {
            let data = response.mstMachineAutoComplete;
            for (var i = 0; i < data.length; i++) {
              results.push(data[i]);
            }
            autocomplete.preloaderHide();
            render(results);
          })
          .catch((err) => {
            var error = err;
            me.setState(() => { throw new UnexpectedError(error); });
          });
      },
      on: {
        change: function (value) {
          me.setState({
            machineId: value[0].machineId,
            machineName: value[0].machineName,
            instllationSiteName: value[0].instllationSiteName
          });
        },
        close: function(){
          if(me.state.machineId) {
            MachineMaster.getMachineEqual({
              machineId: me.state.machineId
            })
              .then((response) => {
                let data = response.mstMachineAutoComplete;
                if(data.length===0){
                  me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found, function () {
                    me.setState({
                      machineId: '',
                      machineName: '',
                      instllationSiteName: ''
                    });
                    // ダイアログ表示しても入力可能、繰り返す表示
                  });
                } else {
                  me.setState({
                    machineId: data[0].machineId,
                    machineUuid: data[0].uuid,
                    machineName: data[0].machineName,
                    instllationSiteName: data[0].instllationSiteName
                  });
                }
              })
              .catch((err) => {
                var error = err;
                me.setState(() => { throw new UnexpectedError(error); });
              });
          }
        }
      },
    });
  }

  /**
   *
   * @param {*} code
   */
  onMachineIdQrRead(code) {
    if (code) {
      QRCodeParser.parseMachineID(code).then((response) => {
        if (!response.error && response.mstMachineAutoComplete[0]) {
          this.setState({
            machineUuid: response.mstMachineAutoComplete[0].machineUuid,
            machineId: response.mstMachineAutoComplete[0].machineId,
            machineName: response.mstMachineAutoComplete[0].machineName,
            instllationSiteName: response.mstMachineAutoComplete[0].instllationSiteName
          });
        } else {
          this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
        }
      }).catch((err) => {
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
    } else {
      this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+code);
    }
  }

  /**
   * 所属Picker作成
   */
  createPickerDepartment(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
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
    me.pickerDepartment = me.createPicker('#machine-mainte-page-department', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ department: value });
        me.setState({ departmentName: displayValue });
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerDepartment.setValue([defaultValue], '');
      me.setState({ department: defaultValue });
      me.setState({ departmentName: defaultName });
    }
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
   * ページ終了処理
   */
  onPageBeforeRemove() {
  }

  /**
   * 戻る
   */
  onBackClick() {
    //設備メンテナンスサブメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-sub-menu', { pushState: true });
  }

  /**
   * 検索ボタン
   */
  buttonSearch() {
    var me = this;
    me.$f7.preloader.show();
    MachineMaintenance.endMaintenances({
      department: me.state.department,
      machineId: me.state.machineId,
      mainteStatus: 'm',
      orderKey: '1'//１を指定すれば、並び順は設備メンテナンス開始日時の昇順とする
    })
      .then((response) => {
        me.$f7.preloader.hide();
        if (response.machineMaintenanceRemodelingVo.length > 0) {
          this.setState({
            machineMaintenanceRemodelingVo: response.machineMaintenanceRemodelingVo,
            mstErrorRecordNotFound:''
          });
        } else {
          this.setState({
            machineMaintenanceRemodelingVo: response.machineMaintenanceRemodelingVo,
            mstErrorRecordNotFound:me.state.dict.mst_error_record_not_found
          });
        }
      })
      .catch((err) => {
        me.$f7.preloader.hide();
        var error = err;
        this.setState(() => { throw new UnexpectedError(error); });
      });
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    this.setState({
      machineName: '',
      machineUuid: ''
    });
  }

  /**
   * クリアボタン押下
   * @param {*} event
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称が入っている
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'machineId') {
      this.setState({
        machineName: '',
        machineId: '',
        machineUuid: ''
      });
    }
    if (event.target.name === 'department') {
      this.setState({
        department: 0,
        departmentName: ''
      });
      this.createPickerDepartment();
    }
  }

  /**
   * 設備ID用QRボタン
   */
  buttonMachineQRClick() {
    //QRページを遷移して設備ID読み取り
    // QRCodeParser.parseMachineID メソッドを使用(非同期処理)
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMachineIdQrRead.bind(this) } });
  }

  buttonMachineSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch', {props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }
  onMachineSelectedCell(item) {
    this.setState({
      machineUuid: item.machineUuid,
      machineId: item.machineId,
      machineName: item.machineName,
    });
  }

  /**
   *
   */
  makeList() {
    const items = this.state.machineMaintenanceRemodelingVo;
    if (!items.length) return;
    let issueList = items.map((item) => this.makeListRow(item) );
    return (
      <List className={'no-margin no-padding normalFont'}>
        {issueList}
      </List>
    );
  }

  makeListRow(item) {
    item.startDatetime = moment(new Date(item.startDatetimeStr)).format('YYYY/MM/DD HH:mm');
    return (
      <ListItem key={item.id} link={APP_DIR_PATH + '/machine-mainte-input?id=' + item.id} swipeout id={item.id}>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{item.startDatetime}</ListItemCell>
            <ListItemCell>{(item.issueId ? this.state.dict.measure : this.state.dict.routine)}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{item.machineId}</ListItemCell>
            <ListItemCell>{item.machineName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_maintenance_reason_category1}</ListItemCell>
            <ListItemCell>{item.machineMaintenanceDetailVo.length>0 ? item.machineMaintenanceDetailVo[0].mainteReasonCategory1Text : null}</ListItemCell>
          </ListItemRow>

          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_maintenance_reason}</ListItemCell>
            <ListItemCell>{item.machineMaintenanceDetailVo.length>0 ? item.machineMaintenanceDetailVo[0].maniteReason : null}</ListItemCell>
          </ListItemRow>

          <ListItemRow>
            <ListItemCell></ListItemCell>
            <ListItemCell></ListItemCell>
          </ListItemRow>

          <ListItemRow>
            <ListItemCell>{this.state.dict.production_start_user}</ListItemCell>
            <ListItemCell>{item.reportPersonName}</ListItemCell>
          </ListItemRow>
        </div>
        <SwipeoutActions right>
          <SwipeoutButton onClick={this.delete.bind(this, item['id'])}>{this.state.dict.start_cancel}</SwipeoutButton>
        </SwipeoutActions>
      </ListItem>
    );
  }

  delete(id) {
    var me = this;
    me.$f7.dialog.create({
      title: me.state.dict.application_title,
      text: me.state.dict.msg_confirm_delete,
      buttons: [{
        text: this.state.dict.yes,
        onClick: function () {
          MachineMaintenance.cancleMaintenance(id)
            .then((response) => {
              if (!response.error) {
                return me.Dom7(`#${id}`).remove();
              }
              me.$f7.dialog.alert(response.errorMessage);
            }).catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        }
      },{
        text: this.state.dict.no,
        onClick: function (dialog) {
          dialog.close();
        }
      }]
    }).open();
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_machine_maintenance_end}>
        <Page id="machine-mainte-end-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_machine_maintenance_end}</BlockTitle>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.machine_id}</Label>
              <Input type="text" name="machineId"
                value={this.state.machineId} clearButton
                onInputClear={this.handleClear.bind(this)}
                onChange={this.handleChange.bind(this)}
                inputId="machine-mainte-end-page-machine-id" />  
              <div className="btn-absolute">
                <Button fill text="QR" small onClick={this.buttonMachineQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.machine_name}</Label>
            </ListItem>
            <ListItem className="custom-list-item">
              <Input>{this.state.machineName}</Input>
              <div className="btn-absolute">
                <Button fill iconF7="search" small onClick={this.buttonMachineSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.machineDepartment}</Label> {/* ログインユーザーの所属を初期セット */}
              <Input type="text" name="department" value={this.state.departmentName} clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="machine-mainte-page-department" />
            </ListItem>
          </List>
          <Block>
            <Row>
              <Col width="33">
                <Button fill text={this.state.dict.search} onClick={this.buttonSearch.bind(this)}></Button>
              </Col>
            </Row>
          </Block>
          <Block className="smallMargin">
            <p>{this.state.mstErrorRecordNotFound}</p>
          </Block>
          {
            this.makeList()
          }
        </Page>
      </DocumentTitle >
    );
  }

}
