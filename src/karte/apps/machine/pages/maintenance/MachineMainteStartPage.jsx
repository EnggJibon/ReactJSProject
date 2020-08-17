import React from 'react';
import {
  Page,
  BlockTitle,
  List,
  ListItem,
  Label,
  Button,
  Block,
  Row,
  Input,
  Col,
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import MachineMaintenance from 'karte/apps/machine/logics/machine-maintenance';
import MachineMaster from 'karte/shared/master/machine';
import Production from 'karte/apps/core/logics/production';
import { connect } from 'react-redux';
import { sendMachineInfo, sendMachineIssueList, mainteInputAddMachine } from 'karte/apps/machine/reducers/machine-maintenance-reducer';

export class MachineMainteStartPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        installation_site_name: '',
        close: '',
        start: '',
        add_work: '',
        delete_work: '',
        machine_id: '',
        machine_name: '',
        sp_machine_maintenance_start: '',
        mst_error_record_not_found: '',
        msg_error_not_null: '',
        msg_mold_under_maintenance: '',
        msg_mold_remodeling: '',
        msg_warning_maitenance_in_production: '',
        yes: '',
        no: ''
      },
      required:'',
      machineUuid: '',
      machineId: '',
      machineName: '',
      sitename: '',
      instllationSiteName: '',
      errorMessageMachineId: '',
    };
    this.mstMachineAutoComplete = [];
    this.checkConflict = this.checkConflict.bind(this);
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
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  createMachineIdAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#machine-mainte-start-page-machine-id',
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
        MachineMaster.getMachineLikeWithoutDispose({
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
            if (error['errorCode'] === 'E201') {
              me.$f7.dialog.alert(error.errorMessage);
            } else {
              me.setState(() => { throw new UnexpectedError(error); });
            }
          });
      },
      on: {
        change: function (value) {
          me.setState({
            machineId: value[0].machineId,
            machineUuid: value[0].uuid,
            machineName: value[0].machineName,
            instllationSiteName: value[0].instllationSiteName
          });
        },
        closed: function (autocomplete) {
          if (me.state.machineName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              machineId: '',
              machineName: '',
              instllationSiteName: ''
            });
          }
        }
      },
    });

  }


  onMachineIdQrRead(code) {
    if (code) {
      QRCodeParser.parseMachineIDWithoutDispose(code).then((response) => {
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

  createPicker(elementName, _value, _displayValues, onColChange) {
    var me = this;
    const app = me.$f7;
    return app.picker.create({
      inputEl: elementName,
      formatValue: function (_values, displayValues) {
        return displayValues[0];
      },
      routableModals: false,
      toolbarCloseText: me.state.dict.close,
      cols: [
        {
          textAlign: 'center',
          values: _value,
          displayValues: _displayValues,
          onChange: onColChange
        }
      ],
    });
  }

  /**
   * 戻る
   */
  onBackClick() {
    //設備メンテナンスサブメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-sub-menu', { pushState: true });
  }

  /**
   * 設備ID用QRボタン
   */
  buttonMachineQRClick() {

    //QRページを遷移して設備ID読み取り
    // QRCodeParser.parseMachineID メソッドを使用(非同期処理)
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMachineIdQrRead.bind(this) } });

  }

  /**
   * 設備検索ボタン
   */
  buttonMachineSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch', {props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }

  /**
   * 設備が生産に使われていないかチェック
   * @param {} machineInfo
   */
  checkConflict(machineInfo) {
    var me = this;
    return new Promise(function (resolve, reject) {
      Production.conflictcheck({ machineUuid: machineInfo.machineUuid })
        .then(response => {
          if (response.hasConflict) {
            let msg = me.state.dict.msg_warning_maitenance_in_production.replace(
              '%mold_machine_name%', machineInfo.machineName).replace('%person_name%', response.personName);
            me.$f7.preloader.hide();
            me.$f7.dialog.create({
              text: msg,
              buttons: [{
                text: me.state.dict.yes,
                onClick: function (dialog) {
                  dialog.close();
                  //dialog.destroy();
                  me.$f7.preloader.show();
                  resolve({ result: true });
                }
              },{
                text: me.state.dict.no,
                onClick: function (dialog) {
                  dialog.close();
                  //dialog.destroy();
                  me.$f7.preloader.show();
                  resolve({ result: false });
                }
              }]
            }).open();
          }
          else {
            resolve({ result: true });
          }
        })
        .catch(err => {
          reject(err);
        });
    });

  }

  /**
   * 開始ボタン
   */
  buttonStart() {
    var me = this;
    if (this.state.machineId === '') {
      this.setState({ errorMessageMachineId: this.state.dict.msg_error_not_null });
      return;
    }

    var machineInfo = {
      machineId: this.state.machineId,
      machineName: this.state.machineName,
      machineUuid: this.state.machineUuid,
    };

    this.props.sendMachineInfo(machineInfo);
    if (machineInfo.machineId) {
      me.$f7.preloader.show();
      //メンテステータスをチェック。メンテナンス中、改造中なら開始させない
      MachineMaster.getMachineByUuid(machineInfo.machineUuid)
        .then(response => {
          if (response.mainteStatus === 1) {
            me.$f7.preloader.hide();
            me.$f7.dialog.alert(this.state.dict.msg_mold_under_maintenance);
            return;
          }
          else if (response.mainteStatus === 2) {
            me.$f7.preloader.hide();
            me.$f7.dialog.alert(this.state.dict.msg_mold_remodeling);
            return;
          }
          //生産中かどうかチェック。生産に使われていたら警告
          me.checkConflict(machineInfo)
            .then(res => {
              if (res.result) {
                //関連打上をチェック。あれば関連打上選択画面へ遷移
                MachineMaintenance.CheckIssues(machineInfo.machineId)
                  .then((response) => {
                    me.$f7.preloader.hide();
                    me.props.sendMachineIssueList(response);
                    if (response.tblIssueVoList && response.tblIssueVoList.length > 0) {
                      me.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-start-issue', { pushState: true });
                    } else {
                      me.$f7.views.main.router.navigate(APP_DIR_PATH + '/machine-mainte-input', { pushState: true });
                    }
                  })
                  .catch((err) => {
                    me.$f7.preloader.hide();
                    var error = err;
                    me.setState(() => { throw new UnexpectedError(error); });
                  });
              }
              else {
                me.$f7.preloader.hide();
                return;
              }
            })
            .catch((err) => {
              me.$f7.preloader.hide();
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        })
        .catch(err => {
          me.$f7.preloader.hide();
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });
    }
  }


  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.value !== '') {
      let name = event.target.name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.setState({ ['errorMessage' + name]: '' });
    }
    this.setState({
      machineName: '',
      machineUuid: '',
      instllationSiteName: ''
    });
  }

  handleClear() {
    this.setState({
      machineName: '',
      machineUuid: '',
      machineId: '',
      instllationSiteName: ''
    });
  }

  onMachineSelectedCell(item) {
    this.setState({
      machineUuid: item.machineUuid,
      machineId: item.machineId,
      machineName: item.machineName,
      instllationSiteName: item.instllationSiteName
    });
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_machine_maintenance_start}>
        <Page onPageInit={this.onPageInit.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_machine_maintenance_start}</BlockTitle>
          <List form={true} id="form" noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem className="custom-list-item" >
              {/* <Col width="80"> */}
              <Label >{this.state.dict.machine_id + this.state.required}</Label>
              <Input type="text" name="machineId"
                value={this.state.machineId} clearButton
                onInputClear={this.handleClear.bind(this)}
                onChange={this.handleChange.bind(this)}
                errorMessage={this.state.errorMessageMachineId}
                errorMessageForce={this.state.errorMessageMachineId !== ''}
                inputId="machine-mainte-start-page-machine-id" /> {/*Error msg is not show red*/}
              {/* </Col> */}
              <div className="btn-absolute">
                <Button fill text="QR" small onClick={this.buttonMachineQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.machine_name}</Label>
              <Input>{this.state.machineName}</Input>
              <div className="btn-absolute">
                <Button fill iconF7="search" small onClick={this.buttonMachineSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Col width="50">{this.state.dict.installation_site_name}</Col>
              <Col width="50">{this.state.instllationSiteName}</Col>
            </ListItem>
          </List>
          <Block className="smallMargin">
            <Row>
              <Col width="33">
                <Button fill onClick={this.buttonStart.bind(this)}>{this.state.dict.start}</Button>
              </Col>
            </Row>
          </Block>

        </Page>
      </DocumentTitle>
    );
  }
}
function mapDispatchToProps(dispatch) {
  return {
    sendMachineInfo(value) {
      dispatch(sendMachineInfo(value));
    },
    sendMachineIssueList(value) {
      dispatch(sendMachineIssueList(value));
    },
    mainteInputAdd(value) {
      dispatch(mainteInputAddMachine(value));
    }

  };
}

export default connect(
  null,
  mapDispatchToProps
)(MachineMainteStartPage);
