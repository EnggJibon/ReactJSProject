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
  Card,
  CardContent,
  AccordionContent,
  ListItemRow,
  ListItemCell,
  SwipeoutActions,
  SwipeoutButton
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Authentication from 'karte/shared/logics/authentication';
import Choice from 'karte/shared/master/choice';
import Production from 'karte/apps/core/logics/production';
import moment from 'moment';
import Machine from 'karte/shared/master/machine';
import MoldMaster from 'karte/shared/master/mold';
import Component from 'karte/shared/master/component';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import { Dom7 } from 'framework7';

export  default class InProductionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        close: '',
        mold_id: '',
        component_code: '',
        production_start_user: '',
        in_production: '',
        component_name: '',
        prod_department: '',
        search: '',
        mst_error_record_not_found: '',
        machine_id: '',
        machine_name: '',
        mold_name: '',
        componentName: '',
        machine: '',
        start_cancel: '',
        msg_confirm_delete: '',
        yes: '',
        no: ''
      },
      department: '',
      departmentName: '',
      componentCode: '',
      moldId: '',
      machineId: '',
      productions: [],
      pageNumber: 1,
      pageTotal: 1,
      pageSize: 50,
      showPreloader: true,
      allowInfinite: true,
      machineUuid: '',
      machineName: '',
      emptyMsg: ''
    };
    this.departments = [];

  }

  componentDidMount() {
    // var me = this;
  }
  componentWillUnmount () {
    // var me = this;
  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
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
        //me.buttonSearch();
        me.createMachineAutocomplete();
        me.createMoldAutocomplete();
        me.createComponentsAutocomplete();
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
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
    me.setState({ department: '' });
    me.setState({ departmentName: '' });
    if (me.pickerDepartment) {
      me.pickerDepartment.destroy();
    }
    me.pickerDepartment = me.createPicker('#in-production-page-department', _values, _displayValues,
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
   * ページ終了処理
   */
  onPageBeforeRemove() {
  }

  /**
   * 戻る
   */
  onBackClick() {
    //生産登録サブメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/production-sub-menu', { pushState: true });
  }

  /**
   * 検索ボタン
   */
  buttonSearch() {
    var me = this;
    me.$f7.preloader.show();
    Production.getProductions({
      department: me.state.department,
      moldId: me.state.moldId,
      machineId: me.state.machineId,
      componentCode: me.state.componentCode
    })
      .then(function (response) {
        //Preloaderを消去
        me.$f7.preloader.hide();
        if (response.productions.length > 0) {
          me.setState({
            productions: response.productions,
          });
        } else {
          me.setState({
            productions: [],
            emptyMsg: me.state.dict.mst_error_record_not_found
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

  /**
   * 
   * @param {Picker作成共通処理} elementName 
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

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  buttonCancelStart (id) {
    let me = this;
    if (id) {
      me.$f7.dialog.create({
        text: this.state.dict.msg_confirm_delete,
        buttons: [{
          text: this.state.dict.yes,
          onClick: function () {
            Production.delete(id)
              .then(() => {
                me.buttonSearch();
              })
              .catch((err) => {
                var error = err;
                if (error['errorCode'] === 'E201') {
                  me.$f7.dialog.alert(error.errorMessage);
                } else {
                  me.setState(() => { throw new UnexpectedError(error); });
                }
              });
          }
        },
        {
          text: this.state.dict.no,
          onClick: function (dialog) {
            dialog.close();
          }
        }]
      }).open();
    }
  }

  makeList(index, item) {
    item.startDatetime = moment(new Date(item.startDatetime)).format('YYYY/MM/DD HH:mm');
    return (
      <ListItem key={index} link={APP_DIR_PATH + '/production-detail?id=' + item['id']} swipeout>
        <div slot="inner" className="no-margin no-padding noFlexShrink">
          <ListItemRow>
            <ListItemCell>{item.startDatetime}</ListItemCell>
            <ListItemCell>{item.mstMachine ? item.mstMachine.machineName : ''}</ListItemCell>
          </ListItemRow>
          <ListItemRow>
            <ListItemCell>{this.state.dict.mold_id}</ListItemCell>
            <ListItemCell>{item.mstMold ? item.mstMold.moldId : ''}</ListItemCell>
          </ListItemRow>
          {item.productionDetails ? item.productionDetails.map((proItem, proIndex) => {
            if (proIndex === 0) {
              return <ListItemRow key={proIndex}>
                <ListItemCell>{this.state.dict.component_code}</ListItemCell>
                <ListItemCell>{proItem.mstComponent.componentCode} {proItem.mstProcedure.procedureCode} {proItem.mstProcedure.procedureName}</ListItemCell>
              </ListItemRow>;
            } else {
              return <ListItemRow key={proIndex}>
                <ListItemCell></ListItemCell>
                <ListItemCell>{proItem.mstComponent.componentCode} {proItem.mstProcedure.procedureCode} {proItem.mstProcedure.procedureName}</ListItemCell>
              </ListItemRow>;
            }
          }) : null}
          <ListItemRow>
            <ListItemCell>{this.state.dict.production_start_user}</ListItemCell>
            <ListItemCell>{item.mstUser ? item.mstUser.userName : ''}</ListItemCell>
          </ListItemRow>
        </div>
        <SwipeoutActions right>
          <SwipeoutButton close onClick={this.buttonCancelStart.bind(this, item['id'])}>{this.state.dict.start_cancel}</SwipeoutButton>
        </SwipeoutActions>
      </ListItem>
    );
  }

  /**
   * 
   */
  makeCard(index, item) {
    item.startDatetime = moment(new Date(item.startDatetime)).format('YYYY/MM/DD HH:mm');
    return <Card key={index} padding={false}>
      <CardContent padding={false} >
        <List noHairlines={false} className="no-margin no-padding">
          <ListItem link={APP_DIR_PATH + '/production-detail?id=' + item.id}>
            <Col width="50">{item.startDatetime}</Col>
            <Col width="50">{item.mstMachine ? item.mstMachine.machineName : ''}</Col>
          </ListItem>
        </List>
        <Block>
          <Row>
            <Col width="50">{this.state.dict.mold_id}</Col>
            <Col width="50">{item.mstMold ? item.mstMold.moldId : ''}</Col>
          </Row>
          {item.productionDetails ? item.productionDetails.map((proItem, proIndex) => {
            if (proIndex === 0) {
              return <Row key={proIndex}>
                <Col width="50">{this.state.dict.component_code}</Col>
                <Col width="50">{proItem.mstComponent.componentCode}</Col>
              </Row>;
            } else {
              return <Row key={proIndex}>
                <Col width="50"></Col>
                <Col width="50">{proItem.mstComponent.componentCode}</Col>
              </Row>;
            }
          }) : null}
          <Row>
            <Col width="50">{this.state.dict.production_start_user}</Col>
            <Col width="50">{item.mstUser ? item.mstUser.userName : ''}</Col>
          </Row>
        </Block>
      </CardContent>
    </Card>;
  }

  /**
     * 設備ID用QRボタン
     */
  buttonMachineQRClick() {
    //QRページを遷移して設備ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMachineQrRead.bind(this) } });
  }

  onMachineQrRead(code) {
    if (code) {
      QRCodeParser.parseMachineID(code).then((response) => {
        if (!response.error && response.mstMachineAutoComplete[0]) {
          let item = {
            machineUuid: response.mstMachineAutoComplete[0].machineUuid,
            machineId: response.mstMachineAutoComplete[0].machineId,
            machineName: response.mstMachineAutoComplete[0].machineName,
          };
          this.setState(item);
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
   * 設備検索ボタン
   */
  buttonMachineSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/machinesearch?department='+ this.state.department, {props: { onSelectedCell: this.onMachineSelectedCell.bind(this) } });
  }

  /**
   * 金型ID用QRボタン
   */
  buttonMoldQRClick() {
    //QRページを遷移して金型ID読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onMoldQrRead.bind(this) } });
  }

  onMoldQrRead(code) {
    if (code) {
      QRCodeParser.parseMoldID(code).then((response) => {
        if (!response.error && response.mstMoldAutoComplete[0]) {
          this.setState({
            moldUuid: response.mstMoldAutoComplete[0].moldUuid,
            moldId: response.mstMoldAutoComplete[0].moldId,
            moldName: response.mstMoldAutoComplete[0].moldName,
          });

          //this.loadComponent(response.mstMoldAutoComplete[0].moldId);
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
   * 金型検索ボタン
   */
  buttonMoldSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/moldsearch', {props: { onSelectedCell: this.onMoldSelectedCell.bind(this) } });
  }

  loadComponent(moldId) {
    var me = this;
    MoldMaster.getMoldDetail({
      moldId: moldId
    }).then((response) => {
      if (response.mstMoldComponentRelationVo.length > 0) {
        if (response.mstMoldComponentRelationVo.length === 1) {
          this.setState({
            componentCode: response.mstMoldComponentRelationVo[0].componentCode,
            componentId: response.mstMoldComponentRelationVo[0].componentId,
            componentName: response.mstMoldComponentRelationVo[0].componentName,
          });
        } else {
          let data = response.mstMoldComponentRelationVo;
          var timeInterval = setInterval(() => {  
            if(me.$f7router.allowPageChange){  
              clearInterval(timeInterval);      
              me.$f7router.navigate(APP_DIR_PATH + '/singlecomponent', {props: { data: data, onComplete: me.onSingleComponentComplete.bind(me) } });
            }
          }, 100);

        }
      }
    }).catch((err) => {
      var error = err;
      me.setState(() => { throw new UnexpectedError(error); });
    });
  }

  onSingleComponentComplete(item) {
    this.setState({
      componentCode: item.componentCode,
      componentId: item.componentId,
      componentName: item.componentName,
    });
  }

  onMoldSelectedCell(item) {
    this.setState({
      moldUuid: item.moldUuid,
      moldId: item.moldId,
      moldName: item.moldName,
    });
    //this.loadComponent(item.moldId);
  }

  onMachineSelectedCell(item) {
    this.setState({
      machineUuid: item.machineUuid,
      machineId: item.machineId,
      machineName: item.machineName,
    });
  }

  /**
  * 部品コード用QRボタン
  */
  buttonComponentQRClick() {
    //QRページを遷移して部品コード読み取り
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props: { onQrRead: this.onComponentQrRead.bind(this) } });
  }

  onComponentQrRead(code) {
    if (code) {
      QRCodeParser.parseComponentCode(code).then((response) => {
        if (!response.error && response.mstComponents[0]) {
          this.setState({
            componentId: response.mstComponents[0].componentId,
            componentCode: response.mstComponents[0].componentCode,
            componentName: response.mstComponents[0].componentName,
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
   * 部品検索ボタン
   */
  buttonComponentSearch() {
    this.$f7router.navigate(APP_DIR_PATH + '/componentSearch', {props: { onSelectedCell: this.onComponentSelectedCell.bind(this) } });
  }

  onComponentSelectedCell(item) {
    let data = {
      componentCode: item.componentCode,
      componentId: item.id,
      componentName: item.componentName,
    };
    this.setState(data);
  }

  /**
  * 金型ID
  */
  createMoldAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#in-production-page-mold-id',
      openIn: 'dropdown',
      valueProperty: 'moldId', //object's "value" property name
      textProperty: 'moldId', //object's "text" property name
      source: function (query, render) {
        var results = [];
        var autocomplete = this;
        if (query.length === 0) {
          // render(results);
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
            // Hide Preoloader
            autocomplete.preloaderHide();
            // Render items by passing array with result items
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
            moldUuid: value[0].uuid,
            moldId: value[0].moldId,
            moldName: value[0].moldName,
          });
          //me.loadComponent(value[0].moldId);
        },
      },
    });
  }

  /**
  * 設備ID
  */
  createMachineAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#in-production-page-machine-id',
      openIn: 'dropdown',
      valueProperty: 'machineId', //object's "value" property name
      textProperty: 'machineId', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          // render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Machine.getMachineLike({
          machineId: query
        })
          .then((response) => {
            let data = response.mstMachineAutoComplete;
            for (var i = 0; i < data.length; i++) {
              results.push(data[i]);
            }
            // Hide Preoloader
            autocomplete.preloaderHide();
            // Render items by passing array with result items
            render(results);
          })
          .catch((err) => {
            var error = err;
            me.setState(() => { throw new UnexpectedError(error); });
          });
      },
      on: {
        change: function (value) {
          let item = {
            machineUuid: value[0].uuid,
            machineId: value[0].machineId,
            machineName: value[0].machineName,
          };
          me.setState(item);
        },
      },
    });
  }

  /**
   * 部品コード
   */
  createComponentsAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#in-production-page-component-code',
      openIn: 'dropdown',
      valueProperty: 'componentCode', //object's "value" property name
      textProperty: 'componentCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          return;
        } else {
          // Show Preloader
          autocomplete.preloaderShow();
          Component.getComponentLike({
            componentCode: query
          })
            .then((response) => {
              let data = response.mstComponents;

              for (var i = 0; i < data.length; i++) {
                results.push(data[i]);
              }
              // Hide Preoloader
              autocomplete.preloaderHide();
              // Render items by passing array with result items

              render(results);
            })
            .catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        }
      },
      on: {
        change: function (value) {
          let data = {
            componentId: value[0].id,
            componentCode: value[0].componentCode,
            componentName: value[0].componentName,
          };
          me.setState(data);
        },
      },
    });
  }

  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称(companyId等)が入っている
    this.setState({ [event.target.name]: ''});
    if (event.target.name === 'moldId') {
      this.setState({
        moldName: '',
        moldUuid: ''
      });
      Dom7('#in-production-page-machine-id').blur();
    }
    if (event.target.name === 'machineId') {
      this.setState({
        machineName: '',
        machineUuid: ''
      });
      Dom7('#in-production-page-mold-id').blur();
    }
    if (event.target.name === 'componentCode') {
      this.setState({
        componentId: '',
        componentName: '',
      });
      this.components = [];
      Dom7('#in-production-page-component-code').blur();
    }
    if (event.target.name === 'department') {
      this.setState({
        department: '',
        departmentName: '',
      });
    }
  }

  render() {
    // var cards = this.makeCardList();
    return (
      <DocumentTitle title={this.state.dict.in_production}>
        <Page
          id="in-production-page"
          onPageInit={this.onPageInit.bind(this)}
          onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}
        >
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.in_production}</BlockTitle>

          <List noHairlinesBetween className="no-margin-top no-margin-bottom">
            <ListItem>
              <Label>{this.state.dict.prod_department}</Label> {/* ログインユーザーの所属を初期セット */}
              <Input type="text" name="department" value={this.state.departmentName} clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="in-production-page-department" />
            </ListItem>
          </List>
          <List accordionList noHairlinesBetween className="no-margin-top no-margin-bottom infinite-scroll">
            <ListItem accordionItem title="">
              <AccordionContent>
                <List noHairlinesBetween className="no-margin-top no-margin-bottom">
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.machine_id}</Label>
                    <Input type="text" name="machineId" value={this.state.machineId} clearButton onInputClear={this.handleClear.bind(this)} inputId="in-production-page-machine-id" onChange={this.handleChange.bind(this)} autocomplete="off" />
                    <div className="btn-absolute">
                      <Button small fill text="QR" onClick={this.buttonMachineQRClick.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label>{this.state.dict.machine_name}</Label>
                    <Input>{this.state.machineName}</Input>
                    <div className="btn-absolute">
                      <Button small fill iconF7="search" onClick={this.buttonMachineSearch.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.mold_id}</Label>
                    <Input type="text" name="moldId" value={this.state.moldId} clearButton onInputClear={this.handleClear.bind(this)} inputId="in-production-page-mold-id" onChange={this.handleChange.bind(this)} autocomplete="off" />
                    <div className="btn-absolute">
                      <Button small fill text="QR" onClick={this.buttonMoldQRClick.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label>{this.state.dict.mold_name}</Label>
                    <Input width="80">{this.state.moldName}</Input>
                    <div className="btn-absolute">
                      <Button small fill iconF7="search" onClick={this.buttonMoldSearch.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.component_code}</Label>
                    <Input type="text" name="componentCode" value={this.state.componentCode} clearButton onInputClear={this.handleClear.bind(this)} inputId="in-production-page-component-code" onChange={this.handleChange.bind(this)} autocomplete="off" />
                    <div className="btn-absolute">
                      <Button small fill text="QR" onClick={this.buttonComponentQRClick.bind(this)}></Button>
                    </div>
                  </ListItem>
                  <ListItem className="custom-list-item">
                    <Label >{this.state.dict.component_name}</Label>
                    <Input>{this.state.componentName}</Input>
                    <div className="btn-absolute">
                      <Button small fill iconF7="search" onClick={this.buttonComponentSearch.bind(this)}></Button>
                    </div>
                  </ListItem>
                </List>
              </AccordionContent>
            </ListItem>
          </List>
          <Block>
            <Row>
              <Col width="33">
                <Button fill text={this.state.dict.search} onClick={this.buttonSearch.bind(this)}></Button>
              </Col>
            </Row>
          </Block>
          {this.state.productions.length < 1 ? <Block>{this.state.emptyMsg}</Block> : 
            (<List className={'no-margin no-padding normalFont'}>
              {this.state.productions.map((item, index) => {
                return this.makeList(index, item);
              })}
            </List>
            )}
        </Page>
      </DocumentTitle>
    );
  }

}