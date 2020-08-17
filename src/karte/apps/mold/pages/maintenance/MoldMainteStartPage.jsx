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
import MoldMaintenance from 'karte/apps/mold/logics/mold-maintenance';
import MoldMaster from 'karte/shared/master/mold';
import Production from 'karte/apps/core/logics/production';
import { connect } from 'react-redux';
import { sendMoldInfo, sendMoldIssueList, mainteInputAdd } from 'karte/apps/mold/reducers/mold-maintenance-reducer';

export class MoldMainteStartPage extends React.Component {
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
        mold_id: '',
        mold_name: '',
        sp_mold_maintenance_start: '',
        mst_error_record_not_found: '',
        msg_error_not_null: '',
        msg_mold_under_maintenance: '',
        msg_mold_remodeling: '',
        msg_warning_maitenance_in_production: '',
        yes: '',
        no: ''
      },
      required:'',
      moldUuid: '',
      moldId: '',
      moldName: '',
      sitename: '',
      instllationSiteName: '',
      errorMessageMoldId: '',
    };
    this.mstMoldAutoComplete = [];
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
        me.createMoldIdAutocomplete();
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }

  createMoldIdAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#mold-mainte-start-page-mold-id',
      openIn: 'dropdown',
      valueProperty: 'moldId',  //object's "value" property name
      textProperty: 'moldId', //object's "text" property name      
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        MoldMaster.getMoldLikeWithoutDispose({
          moldId: query
        })
          .then((response) => {
            let data = response.mstMoldAutoComplete;
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
            moldId: value[0].moldId,
            moldUuid: value[0].uuid,
            moldName: value[0].moldName,
            instllationSiteName: value[0].instllationSiteName
          });
        },
        closed: function (autocomplete) {
          if (me.state.moldName === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              moldId: '',
              moldName: '',
              instllationSiteName: ''
            });
          }
        }
      },
    });

  }


  onMoldIdQrRead(code) {
    if (code) {
      QRCodeParser.parseMoldIDWithoutDispose(code).then((response) => {
        if (!response.error && response.mstMoldAutoComplete[0]) {
          this.setState({
            moldUuid: response.mstMoldAutoComplete[0].uuid,
            moldId: response.mstMoldAutoComplete[0].moldId,
            moldName: response.mstMoldAutoComplete[0].moldName,
            instllationSiteName: response.mstMoldAutoComplete[0].instllationSiteName
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
    //金型メンテナンスサブメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-sub-menu', { pushState: true });
  }

  /**
   * 金型ID用QRボタン
   */
  buttonMoldQRClick() {

    //QRページを遷移して金型ID読み取り
    // QRCodeParser.parseMoldID メソッドを使用(非同期処理)
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMoldIdQrRead.bind(this) } });

  }

  /**
   * 金型検索ボタン
   */
  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', {props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
  }

  /**
   * 金型が生産に使われていないかチェック
   * @param {} moldInfo 
   */
  checkConflict(moldInfo) {
    var me = this;
    return new Promise(function (resolve, reject) {
      Production.moldConflictCheck({ moldUuid: moldInfo.moldUuid })
        .then(response => {
          if (response.hasConflict) {
            let msg = me.state.dict.msg_warning_maitenance_in_production.replace(
              '%mold_machine_name%', moldInfo.moldName).replace('%person_name%', response.personName);
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
    if (this.state.moldId === '') {
      this.setState({ errorMessageMoldId: this.state.dict.msg_error_not_null });
      return;
    }

    var moldInfo = {
      moldId: this.state.moldId,
      moldName: this.state.moldName,
      moldUuid: this.state.moldUuid,
    };

    this.props.sendMoldInfo(moldInfo);
    if (moldInfo.moldId) {
      me.$f7.preloader.show();
      //メンテステータスをチェック。メンテナンス中、改造中なら開始させない
      MoldMaster.getMoldByUuid(moldInfo.moldUuid)
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
          me.checkConflict(moldInfo)
            .then(res => {
              if (res.result) {
                //関連打上をチェック。あれば関連打上選択画面へ遷移
                MoldMaintenance.CheckIssues(moldInfo.moldId)
                  .then((response) => {
                    me.$f7.preloader.hide();
                    me.props.sendMoldIssueList(response);
                    if (response.tblIssueVoList && response.tblIssueVoList.length > 0) {
                      me.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-start-issue', { pushState: true });
                    } else {
                      me.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-input', { pushState: true });
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
      moldName: '',
      moldUuid: '',
      instllationSiteName: ''
    });
  }

  handleClear() {
    this.setState({
      moldName: '',
      moldUuid: '',
      moldId: '',
      instllationSiteName: ''
    });
  }

  onMoldSelectedCell(item) {
    this.setState({
      moldUuid: item.moldUuid,
      moldId: item.moldId,
      moldName: item.moldName,
      instllationSiteName: item.instllationSiteName
    });
  }

  render() {
    return (
      <DocumentTitle title={this.state.dict.sp_mold_maintenance_start}>
        <Page onPageInit={this.onPageInit.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_mold_maintenance_start}</BlockTitle>
          <List form={true} id="form" noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem className="custom-list-item" >
              {/* <Col width="80"> */}
              <Label >{this.state.dict.mold_id + this.state.required}</Label>
              <Input type="text" name="moldId"
                value={this.state.moldId} clearButton
                onInputClear={this.handleClear.bind(this)}
                onChange={this.handleChange.bind(this)}
                errorMessage={this.state.errorMessageMoldId}
                errorMessageForce={this.state.errorMessageMoldId !== ''}
                inputId="mold-mainte-start-page-mold-id" /> {/*Error msg is not show red*/}
              {/* </Col> */}
              <div className="btn-absolute">
                <Button fill text="QR" small onClick={this.buttonMoldQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem className="custom-list-item">
              <Label>{this.state.dict.mold_name}</Label>
              <Input>{this.state.moldName}</Input>
              <div className="btn-absolute">
                <Button fill iconF7="search" small onClick={this.buttonMoldSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
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
    sendMoldInfo(value) {
      dispatch(sendMoldInfo(value));
    },
    sendMoldIssueList(value) {
      dispatch(sendMoldIssueList(value));
    },
    mainteInputAdd(value) {
      dispatch(mainteInputAdd(value));
    }

  };
}

export default connect(
  null,
  mapDispatchToProps
)(MoldMainteStartPage);