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
import MoldMaster from 'karte/shared/master/mold';
import MoldMaintenance from 'karte/apps/mold/logics/mold-maintenance';
import moment from 'moment';
import Authentication from 'karte/shared/logics/authentication';
import Choice from 'karte/shared/master/choice';
// import MoldSearch from 'karte/shared/components/search/Mold';

export default class MoldMainteEndPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        mold_id: '',
        mold_name: '',
        user_department: '',
        moldDepartment: '',
        machine_maintenance_reason_category1: '',
        machine_maintenance_reason: '',
        production_start_user: '',
        search: '',
        mst_error_record_not_found: '',
        sp_mold_maintenance_end: '',
        start_cancel: '',
        msg_confirm_delete: '',
        yes: '',
        no: '',
        measure: '',
        routine: ''
      },
      currentTabIndex: 0,
      modalIsOpen: false,
      moldMaintenanceRemodelingVo: [],
      mstErrorRecordNotFound:'',
      department: 0,
      departmentName: '',
      moldUuid: '',
      moldId: '',
      moldName: '',
      // moldSearchOpened: false
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
        me.createMoldIdAutocomplete();

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

  createMoldIdAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#mold-mainte-end-page-mold-id',
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
        MoldMaster.getMoldLike({
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
            me.setState(() => { throw new UnexpectedError(error); });
          });
      },
      on: {
        change: function (value) {
          me.setState({
            moldId: value[0].moldId,
            moldName: value[0].moldName,
            instllationSiteName: value[0].instllationSiteName
          });
        },
        close: function(){
          if(me.state.moldId) {
            MoldMaster.getMoldEqual({
              moldId: me.state.moldId
            })
              .then((response) => {
                let data = response.mstMoldAutoComplete;
                if(data.length===0){
                  me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found, function () {
                    me.setState({
                      moldId: '',
                      moldName: '',
                      instllationSiteName: ''
                    });
                    // ダイアログ表示しても入力可能、繰り返す表示
                  });
                } else {
                  me.setState({
                    moldId: data[0].moldId,
                    moldUuid: data[0].uuid,
                    moldName: data[0].moldName,
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
  onMoldIdQrRead(code) {
    if (code) {
      QRCodeParser.parseMoldID(code).then((response) => {
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
    me.pickerDepartment = me.createPicker('#mold-mainte-page-department', _values, _displayValues,
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
    //金型メンテナンスサブメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/mold-mainte-sub-menu', { pushState: true });
  }

  /**
   * 検索ボタン
   */
  buttonSearch() {
    var me = this;
    me.$f7.preloader.show();
    MoldMaintenance.endMaintenances({
      department: me.state.department,
      moldId: me.state.moldId,
      mainteStatus: 'm',
      orderKey: '1'//１を指定すれば、並び順は金型メンテナンス開始日時の昇順とする
    })
      .then((response) => {
        me.$f7.preloader.hide();
        if (response.moldMaintenanceRemodelingVo.length > 0) {
          this.setState({
            moldMaintenanceRemodelingVo: response.moldMaintenanceRemodelingVo,
            mstErrorRecordNotFound:''
          });
        } else {
          this.setState({
            moldMaintenanceRemodelingVo: response.moldMaintenanceRemodelingVo,
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
      moldName: '',
      moldUuid: ''
    });
  }

  /**
   * クリアボタン押下
   * @param {*} event
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称が入っている
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'moldId') {
      this.setState({
        moldName: '',
        moldId: '',
        moldUuid: ''
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
   * 金型ID用QRボタン
   */
  buttonMoldQRClick() {
    //QRページを遷移して金型ID読み取り
    // QRCodeParser.parseMoldID メソッドを使用(非同期処理)
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMoldIdQrRead.bind(this) } });
  }

  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', {props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
  }
  onMoldSelectedCell(item) {
    this.setState({
      moldUuid: item.moldUuid,
      moldId: item.moldId,
      moldName: item.moldName,
    });
  }

  /**
   *
   */
  makeList() {
    const items = this.state.moldMaintenanceRemodelingVo;
    if (!items.length) return;
    let issueList = items.map((item) => this.makeListRow(item) );
    return (
      <List className={'no-margin no-padding normalFont'}>
        {issueList}
      </List>
    );
  }

  makeListRow(item) {
    item.startDatetime = moment(new Date(item.startDatetime)).format('YYYY/MM/DD HH:mm');
    return (
      <ListItem key={item.id} link={APP_DIR_PATH + '/mold-mainte-input?id=' + item.id} swipeout id={item.id}>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{item.startDatetime}</ListItemCell>
            <ListItemCell>{(item.issueId ? this.state.dict.measure : this.state.dict.routine)}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{item.moldId}</ListItemCell>
            <ListItemCell>{item.moldName}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_maintenance_reason_category1}</ListItemCell>
            <ListItemCell>{item.moldMaintenanceDetailVo.length>0 ? item.moldMaintenanceDetailVo[0].mainteReasonCategory1Text : null}</ListItemCell>
          </ListItemRow>

          <ListItemRow>
            <ListItemCell>{this.state.dict.machine_maintenance_reason}</ListItemCell>
            <ListItemCell>{item.moldMaintenanceDetailVo.length>0 ? item.moldMaintenanceDetailVo[0].maniteReason : null}</ListItemCell>
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
          MoldMaintenance.cancleMaintenance(id)
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
      <DocumentTitle title={this.state.dict.sp_mold_maintenance_end}>
        <Page id="mold-mainte-end-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.sp_mold_maintenance_end}</BlockTitle>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem className="custom-list-item" >
              <Label >{this.state.dict.mold_id}</Label>
              <Input type="text" name="moldId"
                value={this.state.moldId} clearButton
                onInputClear={this.handleClear.bind(this)}
                onChange={this.handleChange.bind(this)}
                inputId="mold-mainte-end-page-mold-id" />
              <div className="btn-absolute">
                <Button fill text="QR" small onClick={this.buttonMoldQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.mold_name}</Label>
            </ListItem>
            <ListItem className="custom-list-item">
              <Input type="text" value={this.state.moldName}/> 
              <div className="btn-absolute">
                <Button fill iconF7="search" small onClick={this.buttonMoldSearch.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.moldDepartment}</Label> {/* ログインユーザーの所属を初期セット */}
              <Input type="text" name="department" value={this.state.departmentName} clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="mold-mainte-page-department" />
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
