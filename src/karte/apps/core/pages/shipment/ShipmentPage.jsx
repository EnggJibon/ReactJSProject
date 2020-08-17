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
  Popup,
  Radio,
  Toolbar,
} from 'framework7-react';
import { Dom7 } from 'framework7';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import { APP_DIR_PATH } from 'karte/shared/logics/app-location';
import { UnexpectedError } from 'karte/shared/logics/errors';
import DocumentTitle from 'react-document-title';
import AppNavbar from 'karte/shared/components/AppNavbar';
import Po from 'karte/shared/master/po';
import QRCodeParser from 'karte/shared/logics/qrcode-parser';
import CalendarUtil from 'karte/shared/logics/calendar-util';
import moment from 'moment';
import Component from 'karte/shared/master/component';
import Company from 'karte/shared/master/company';

export default class ShipmentPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dict: {
        application_title: '',
        shipment_registration: '',
        order_info: '',
        incoming_company: '',
        order_number: '',
        item_number: '',
        component_code: '',
        order_quantity: '',
        order_date: '',
        due_date: '',
        shipment_info: '',
        ship_date: '',
        production_lot_number: '',
        ship_quantity: '',
        registration: '',
        close: '',
        select_record: '',
        cancel: '',
        ok: '',
        company_code: '',
        company_name: '',
        msg_error_qr_not_setting: '',
        mst_error_record_not_found: '',
        msg_error_num_over_zero: '',
        msg_error_over_length_with_item: '',
        msg_record_added: '',
        msg_error_ship_quantity: '',
        msg_warning_po_ship_diff_component: '',
        msg_error_not_null: '',
        msg_error_value_invalid: '',
        stock_quantity: '',
      },
      required:'',
      deliveryDestName: '',
      deliveryDestId: '',
      errorMessageDeliveryDestId: '',
      orderNumber: '',
      errorMessageOrderNumber: '',
      itemNumber: '',
      errorMessageItemNumber: '',
      poComponentId: '',
      poComponentCode: '',
      poComponentReadOnly: false,
      errorMessagePoComponentCode: '',
      poQuantity: 0,
      errorMessagePoQuantity: '',
      orderDate: '',
      dueDate: '',
      shipDate: moment(new Date()).format('YYYY/MM/DD'),
      errorMessageShipDate: '',
      shipComponentId: '',
      shipComponentCode: '',
      errorMessageShipComponentCode: '',
      productionId: '',
      productionLotNumber: '',
      errorMessageProductionLotNumber: '',
      productionDetailId: null,
      shipQuantity: 0,
      errorMessageShipQuantity: '',
      stockQuantity: 0,
      errorMessageStockQuantity: '',
      poqrs: [],
      opened: false,
      selectedRowId: false,
    };
    this.companys = [];

    this.poqrSeq = 0;
  }

  componentDidMount() {
    var me = this;
    var app = me.$f7;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(function (values) {
        me.setState({ dict: values });
        me.createPoComponentAutocomplete();
        me.createShipComponentAutocomplete();
        me.createLotnumberAutocomplete();

        //受注日
        me.orderDateCalendar = app.calendar.create(
          CalendarUtil.getCalendarProperties('#shipment-page-order-date', {
            change: function (calendar, value) {
              me.setState({
                orderDate: moment(new Date(value)).format('YYYY/MM/DD')
              });
            }
          }));
        //納期
        me.dueDateCalendar = app.calendar.create(
          CalendarUtil.getCalendarProperties('#shipment-page-due-date', {
            change: function (calendar, value) {
              me.setState({
                dueDate: moment(new Date(value)).format('YYYY/MM/DD')
              });
            }
          }));
        //出荷日
        me.shipDateCalendar = app.calendar.create(
          CalendarUtil.getCalendarProperties('#shipment-page-ship-date', {
            change: function (calendar, value) {
              me.setState({
                shipDate: moment(new Date(value)).format('YYYY/MM/DD')
              });
            }
          }));
      })
      .catch(function (err) {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    Dom7('#shipment-page-po-quantity').on('keydown', this.handleKeyPress);
    Dom7('#shipment-page-ship-quantity').on('keydown', this.handleKeyPress);
  }
  componentWillUmount() {
    Dom7('#shipment-page-po-quantity').off('keydown', this.handleKeyPress);
    Dom7('#shipment-page-ship-quantity').off('keydown', this.handleKeyPress);
  }
  handleKeyPress(event) {
    const invalidChars = ['-', '+', 'e', '.', 'E'];
    if (invalidChars.indexOf(event.key) !== -1) {
      event.preventDefault();
    }
  }

  /**
   * ページ初期処理
   */
  onPageInit() {
    var me = this;

    Company.load().then((response) => {
      me.companys = response.mstCompanies;
      me.createPickerCompany(true);
    }).catch((err) => {
      var error = err;
      this.setState(() => { throw new UnexpectedError(error); });
    });
    var required_mark = DictionaryLoader.requiredField();
    this.setState({required: required_mark});
  }


  /**
   * 納品先Picker作成
   */
  createPickerCompany(setDefault) {
    var me = this;
    var _values = [];
    var _displayValues = [];
    var defaultValue = null;
    var defaultName = null;
    for (var i = 0; i < me.companys.length; i++) {
      let company = me.companys[i];
      _values.push(company.id);
      _displayValues.push(company.companyName);
      //ログインユーザーの所属に等しいものをデフォルトとする
      if (me.state.deliveryDestId === company.seq) {
        defaultValue = company.id;
        defaultName = company.companyName;
      }
    }
    if (me.pickerCompany) {
      me.pickerCompany.destroy();
    }
    me.pickerCompany = me.createPicker('#shipment-page-delivery-dest', _values, _displayValues,
      //Col Change Callback
      (picker, value, displayValue) => {
        me.setState({ deliveryDestName: displayValue });
        me.setState({ deliveryDestId: value });
        if (value !== '') {
          this.setState({ errorMessageDeliveryDestId: '' });
        }
      },
      //On Changed Callback
      () => {
        me.loadPo();
      }
    );
    if (setDefault && defaultValue !== null) {
      me.pickerCompany.setValue([defaultValue], 0);
      me.setState({ deliveryDestName: defaultName });
      me.setState({ deliveryDestId: defaultValue });
    }
  }

  /**
 * Picker作成共通処理
 * @param {*} elementName 
 * @param {*} _values 
 * @param {*} _displayValues 
 * @param {*} onColChange 
 */
  createPicker(elementName, _values, _displayValues, onColChange, onClosed) {
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
      on: {
        close: function () {
          elementName = elementName.replace('#', '');
          document.getElementById(elementName).removeAttribute('readonly');
        },
        closed: onClosed
      }
    });
  }

  loadPo() {
    var me = this;
    //既存のPOと同一キー情報のPOがないか取得し、あれば表示する。
    if (me.state.deliveryDestId !== '' && me.state.orderNumber !== '' && me.state.itemNumber !== '') {
      var param = {
        'deliveryDestId': me.state.deliveryDestId,
        'orderNumber': me.state.orderNumber,
        'itemNumber': me.state.itemNumber
      };
      Po.loadPo(param).then((response) => {
        if (response === null || response === '') {
          me.setState({poComponentReadOnly: false});
          return;
        }
        me.setState({orderDate: response.orderDate});
        me.setState({poComponentId: response.componentId});
        me.setState({poComponentCode: response.componentCode});
        me.setState({poComponentReadOnly: true});
        me.setState({poQuantity: response.quantity});
        me.setState({dueDate: response.dueDate});
        me.setState({shipComponentId: response.componentId});
        me.setState({shipComponentCode: response.componentCode});
        me.getStockQuantity(response.componentId);
      }).catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });
    }
  }

  /**
   * ページ終了処理
   */
  onPageBeforeRemove() {
    var me = this;
    if (me.orderDateCalendar) {
      me.orderDateCalendar.destroy();
    }
    if (me.dueDateCalendar) {
      me.dueDateCalendar.destroy();
    }
    if (me.shipDateCalendar) {
      me.shipDateCalendar.destroy();
    }
  }

  /**
   * 戻る
   */
  onBackClick() {
    //メインメニューに戻る
    this.$f7.views.main.router.navigate(APP_DIR_PATH + '/', { pushState: true });
  }

  /**
   * 発注番号QRボタン
   */
  buttonOrderNoQRClick() {
    Po.poqrLoad().then((response) => {
      if (response.mstPoQrVos.length === 0) {
        this.$f7.dialog.alert(this.state.dict.msg_error_qr_not_setting);
      } else if (response.mstPoQrVos.length === 1) {
        this.setState({
          deliveryDestId: response.mstPoQrVos[0].deliveryDestId,
          deliveryDestName: response.mstPoQrVos[0].compamyName,
        });
        this.poqrSeq = response.mstPoQrVos[0].seq;
        //QRページを遷移して発注番号読み取り
        this.$f7router.navigate(APP_DIR_PATH + '/qrpage', { props: { onQrRead: this.onOrderNoQrRead.bind(this) } });
      } else {
        this.setState({
          poqrs: response.mstPoQrVos,
          opened: true
        });
      }
    }).catch((err) => {
      var error = err;
      this.setState(() => { throw new UnexpectedError(error); });
    });
  }

  handlePopubChange(event) {
    this.setState({
      selectedRowId: event.target.value,
    });
  }
  //選択
  handleSelected() {
    var selectedRowId = this.state.selectedRowId;
    var item = this.state.poqrs[selectedRowId];
    if (item) {
      this.setState({
        opened: false,
        deliveryDestId: item.deliveryDestId,
        deliveryDestName: item.compamyName,
        poqrs: []
      });
      this.poqrSeq = item.seq;
      //QRページを遷移して発注番号読み取り
      this.$f7router.navigate(APP_DIR_PATH + '/qrpage', { props: { onQrRead: this.onOrderNoQrRead.bind(this) } });
    }
  }
  //キャンセル
  handleCancel() {
    this.setState({
      opened: false,
      selectedRowId: '',
      poqrs: []
    });
  }
  popupClosed() {
    this.setState({
      opened: false,
      selectedRowId: '',
      poqrs: []
    });
  }
  onOrderNoQrRead(code) {
    let me = this;
    if (code) {
      QRCodeParser.parsePoqr(code, me.poqrSeq).then((response) => {
        if (typeof response === 'string') {
          this.$f7.dialog.alert(this.state.dict.msg_error_value_invalid);
        } else {
          Component.getComponentEqual({
            componentCode: response.componentCode
          })
            .then((res) => {
              if (res.mstComponents.length === 1) {
                me.setState({
                  poComponentCode: response.componentCode,
                  poComponentId: res.mstComponents[0].id,
                  shipComponentCode: response.componentCode,
                  shipComponentId: res.mstComponents[0].id,
                  itemNumber: response.itemNumber,
                  orderNumber: response.orderNumber,
                  poQuantity: response.orderQuantity,
                }, () => {
                  me.getStockQuantity(res.mstComponents[0].id, me.loadPo());
                });
              } else {
                this.$f7.dialog.alert(this.state.dict.mst_error_record_not_found +'<br/>'+ response.componentCode);
                me.setState({
                  itemNumber: response.itemNumber,
                  orderNumber: response.orderNumber,
                  poQuantity: response.orderQuantity,
                });
              }
            })
            .catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        }
      })
        .catch((err) => {
          var error = err;
          me.setState(() => { throw new UnexpectedError(error); });
        });

    } else {
      this.$f7.dialog.alert(this.state.dict.msg_error_qr_not_setting+'<br/>'+code);
    }
  }

  onBlur() {
    this.loadPo();
  }

  handleChange = (event) => {
    //    let eventName = event.target.name;
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.value !== '') {
      let name = event.target.name;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      this.setState({ ['errorMessage' + name]: '' });
    }
    if (event.target.name === 'poComponentCode') {
      this.setState({ poComponentId: '' });
    }
    if (event.target.name === 'shipComponentCode') {
      this.setState({ shipComponentId: '' });
    }
    if (event.target.name === 'productionLotNumber') {
      this.setState({ productionId: '' });
    }
  }
  /**
   * クリアボタン押下
   * @param {*} event 
   */
  handleClear(event) {
    //Inputタグのname属性にID項目名称が入っている
    this.setState({ [event.target.name]: '' });
    if (event.target.name === 'deliveryDestId') {
      this.setState({ deliveryDestName: '' });
      this.createPickerCompany(false);
    }
    if (event.target.name === 'poComponentCode') {
      this.setState({ poComponentId: '' });
      this.setState({ shipComponentCode: '' });
      this.setState({ shipComponentId: '' });
    }
    if (event.target.name === 'shipComponentCode') {
      this.setState({ shipComponentId: '' });
    }
  }
  /**
   * 受注情報の部品コード
   */
  createPoComponentAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#shipment-page-po-component-code',
      openIn: 'dropdown',
      valueProperty: 'id', //object's "value" property name
      textProperty: 'componentCode', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          render(results);
          return;
        }
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
            poComponentId: value[0].id,
            poComponentCode: value[0].componentCode,
            shipComponentId: value[0].id,
            shipComponentCode: value[0].componentCode,
          }, () => {
            me.getStockQuantity(value[0].id);
          });
        },
        closed: function (autocomplete) {
          let state = me.state;
          if (state.poComponentId === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              poComponentId: '',
              poComponentCode: '',
            });
          }
        }
      },
    });
  }
  /**
   * 出荷情報の部品コード
   */
  createShipComponentAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#shipment-page-ship-component-code',
      openIn: 'dropdown',
      valueProperty: 'id', //object's "value" property name
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
              if (error['errorCode'] === 'E201') {
                me.$f7.dialog.alert(error.errorMessage);
              } else {
                me.setState(() => { throw new UnexpectedError(error); });
              }
            });
        }
      },
      on: {
        change: function (value) {
          me.setState({
            shipComponentId: value[0].id,
            shipComponentCode: value[0].componentCode,
          }, () => {
            me.getStockQuantity(value[0].id);
          });
        },
        close: function (autocomplete) {
          let state = me.state;
          if (state.shipComponentId === '') {
            if (autocomplete.inputEl.value !== '') {
              me.$f7.dialog.alert(me.state.dict.mst_error_record_not_found);
            }
            me.setState({
              shipComponentId: '',
              shipComponentCode: '',
              stockQuantity:''
            });
          }
        }
      },
    });
  }

  /**
   * 製造ロット番号
   */
  createLotnumberAutocomplete() {
    var me = this;
    const app = me.$f7;
    return app.autocomplete.create({
      inputEl: '#shipment-page-production-lot-number',
      openIn: 'dropdown',
      valueProperty: 'productionId', //object's "value" property name
      textProperty: 'productionLotNumber', //object's "text" property name
      source: function (query, render) {
        var autocomplete = this;
        var results = [];
        if (query.length === 0) {
          render(results);
          return;
        }
        // Show Preloader
        autocomplete.preloaderShow();
        Po.shipmentLotnumber({
          shipmentComponentId: me.state.shipComponentId,
          productionLotNumber: query
        })
          .then((response) => {
            let data = response.tblShipmentVos;
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
            productionId: value[0].productionId,
            productionLotNumber: value[0].productionLotNumber,
          });
          Po.shipmentLotnumberEqual({
            productionId: value[0].productionId
          })
            .then((response) => {
              me.setState({
                productionDetailId: response.tblShipmentVos[0] ? response.tblShipmentVos[0].productionDetailId : null,
              });
            })
            .catch((err) => {
              var error = err;
              me.setState(() => { throw new UnexpectedError(error); });
            });
        }
      },
    });
  }

  //在庫数
  getStockQuantity(componentId, _callback) {
    let me = this;
    let callback = _callback;
    Po.stockQuantity(componentId)
      .then((response) => {
        me.setState({
          stockQuantity:response.stockQuantity
        }, () => {if (callback) callback();});
      })
      .catch((err) => {
        var error = err;
        me.setState(() => { throw new UnexpectedError(error); });
      });

  }

  /**
   * 次へボタン
   */
  buttonRegistration() {
    let me = this;
    var reg = /(\w*)%s(.*)%s(.*)/g;
    if (me.state.deliveryDestId === '') {
      me.setState({ errorMessageDeliveryDestId: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-delivery-dest').focus();
      return;
    } else {
      me.setState({ errorMessageDeliveryDestId: '' });
    }
    if (me.state.orderNumber === '') {
      me.setState({ errorMessageOrderNumber: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-order-number').focus();
      return;
    } else {
      me.setState({ errorMessageOrderNumber: '' });
    }
    if (me.state.itemNumber === '') {
      me.setState({ errorMessageItemNumber: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-item-number').focus();
      return;
    } else {
      me.setState({ errorMessageItemNumber: '' });
    }
    if (me.state.poComponentCode === '') {
      me.setState({ errorMessagePoComponentCode: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-po-component-code').focus();
      return;
    } else {
      me.setState({ errorMessagePoComponentCode: '' });
    }
    if (me.state.poQuantity === '') {
      me.setState({ errorMessagePoQuantity: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-po-quantity').focus();
      return;
    } else {
      me.setState({ errorMessagePoQuantity: '' });
    }
    if (me.state.poQuantity !== '' && !/^[0-9]+$/.test(me.state.poQuantity)) {
      me.setState({ errorMessagePoQuantity: me.state.dict.msg_error_num_over_zero });
      return;
    } else {
      me.setState({ errorMessagePoQuantity: '' });
    }
    if (me.state.poQuantity > 999999999) {
      this.setState({ errorMessagePoQuantity: me.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.order_quantity + '$29$3') });
      return;
    } else {
      me.setState({ errorMessagePoQuantity: '' });
    }
    if (me.state.shipDate === '') {
      me.setState({ errorMessageShipDate: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-ship-date').focus();
      return;
    } else {
      me.setState({ errorMessageShipDate: '' });
    }
    if (me.state.shipComponentCode === '') {
      me.setState({ errorMessageShipComponentCode: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-ship-component-code').focus();
      return;
    } else {
      me.setState({ errorMessageShipComponentCode: '' });
    }
    if (me.state.productionLotNumber === '') {
      me.setState({ errorMessageProductionLotNumber: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-production-lot-number').focus();
      return;
    } else {
      me.setState({ errorMessageProductionLotNumber: '' });
    }
    if (me.state.shipQuantity === '') {
      me.setState({ errorMessageShipQuantity: me.state.dict.msg_error_not_null });
      Dom7('#shipment-page-ship-quantity').focus();
      return;
    } else {
      me.setState({ errorMessageShipQuantity: '' });
    }
    if (me.state.shipQuantity !== '' && !/^[0-9]+$/.test(me.state.shipQuantity)) {
      me.setState({ errorMessageShipQuantity: me.state.dict.msg_error_num_over_zero });
      Dom7('#shipment-page-ship-quantity').focus();
      return;
    } else {
      me.setState({ errorMessageShipQuantity: '' });
    }
    if (me.state.shipQuantity > 999999999) {
      this.setState({ errorMessageShipQuantity: me.state.dict.msg_error_over_length_with_item.replace(reg, '$1' + this.state.dict.ship_quantity + '$29$3') });
      Dom7('#shipment-page-ship-quantity').focus();
      return;
    } else {
      me.setState({ errorMessageShipQuantity: '' });
    }
    if (parseInt(me.state.shipQuantity) > parseInt(me.state.poQuantity)) {
      me.$f7.dialog.alert(me.state.dict.msg_error_ship_quantity);
      return;
    }
    let data = {
      shipDate: moment(new Date(me.state.shipDate)).format('YYYY/MM/DD 00:00:00'),
      shipQuantity: me.state.shipQuantity,
      productionLotNumber: me.state.productionLotNumber,
      productionId: me.state.productionId,
      productionDetailId: me.state.productionDetailId,
      componentId: me.state.shipComponentId,
      tblPoVo: {
        deliveryDestId: me.state.deliveryDestId,
        orderNumber: me.state.orderNumber,
        itemNumber: me.state.itemNumber,
        componentId: me.state.poComponentId,
        quantity: me.state.poQuantity,
        orderDate: moment(new Date(me.state.orderDate)).format('YYYY/MM/DD 00:00:00'),
        dueDate: moment(new Date(me.state.dueDate)).format('YYYY/MM/DD 00:00:00')
      }
    };
    if (this.state.poComponentCode !== this.state.shipComponentCode) {
      me.$f7.dialog.create({
        text: this.state.dict.msg_warning_po_ship_diff_component,
        buttons: [{
          text: this.state.dict.cancel,
          onClick: function (dialog) {
            dialog.close();
          }
        }, {
          text: this.state.dict.ok,
          onClick: function () {
            me.sendData(data);
          }
        }]
      }).open();
    } else {
      me.sendData(data);
    }
  }
  sendData(data) {
    let me = this;
    //Preloaderを表示
    //登録ボタンを非活性化し二度押しを防止する
    me.$f7.preloader.show();
    Po.shipment(data)
      .then(() => {
        //Preloaderを消去
        me.$f7.preloader.hide();
        //メインメニューに戻る
        me.$f7.dialog.create({
          text: this.state.dict.msg_record_added,
          buttons: [{
            text: this.state.dict.ok,
            onClick: function () {
            }
          }]
        }).open();
      })
      .catch((err) => {
        me.$f7.preloader.hide();
        var error = err;
        if (error['errorCode'] === 'E201') {
          me.$f7.dialog.alert(error.errorMessage);
        } else {
          me.setState(() => { throw new UnexpectedError(error); });
        }
      });
  }
  /**
     * データテーブル描画
     */
  renderTable() {
    var tdList = [];
    for (var i = 0; i < this.state.poqrs.length; i++) {
      var poqr = this.state.poqrs[i];
      tdList.push(
        <tr key={i}>
          <td className="label-cell"><Radio className="no-fastclick" name="company" onChange={this.handlePopubChange.bind(this)} value={i} /></td>
          <td className="label-cell">{poqr.compamyCode}</td>
          <td className="label-cell">{poqr.compamyName}</td>
        </tr>
      );
    }
    return (
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th className="label-cell"></th>
              <th className="label-cell">{this.state.dict.company_code}</th>
              <th className="label-cell">{this.state.dict.company_name}</th>
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
    return (
      <DocumentTitle title={this.state.dict.shipment_registration}>
        <Page id="shipment-page" onPageInit={this.onPageInit.bind(this)} onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
          <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.onBackClick.bind(this)}></AppNavbar>
          <BlockTitle>{this.state.dict.shipment_registration}</BlockTitle>

          <Block className="no-margin-top no-margin-bottom">
            <Label>{this.state.dict.order_info}</Label>
          </Block>
          <List noHairlinesBetween className="no-margin-top">
            <ListItem>
              <Label>{this.state.dict.incoming_company + this.state.required}</Label>
              <Input type="text" name="deliveryDestId" value={this.state.deliveryDestName} clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="shipment-page-delivery-dest" errorMessage={this.state.errorMessageDeliveryDestId} errorMessageForce={this.state.errorMessageDeliveryDestId !== ''} maxlength={45} />
            </ListItem>
            <ListItem className="custom-list-item">
              <Label >{this.state.dict.order_number + this.state.required}</Label>
              <Input type="text" name="orderNumber" onBlur={this.onBlur.bind(this)} value={this.state.orderNumber} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} inputId="shipment-page-order-number" errorMessage={this.state.errorMessageOrderNumber} errorMessageForce={this.state.errorMessageOrderNumber !== ''} maxlength={45} />
              <div className="btn-absolute">
                <Button small fill text="QR" onClick={this.buttonOrderNoQRClick.bind(this)}></Button>
              </div>
            </ListItem>
            <ListItem >
              <Label >{this.state.dict.item_number + this.state.required}</Label>
              <Input type="text" onBlur={this.onBlur.bind(this)} name="itemNumber" value={this.state.itemNumber} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} inputId="shipment-page-item-number" errorMessage={this.state.errorMessageItemNumber} errorMessageForce={this.state.errorMessageItemNumber !== ''} maxlength={45} />
            </ListItem>
            <ListItem >
              <Label >{this.state.dict.component_code + this.state.required}</Label>
              <Input type="text" name="poComponentCode" readonly={this.state.poComponentReadOnly} disabled={this.state.poComponentReadOnly} value={this.state.poComponentCode} clearButton={!this.state.poComponentReadOnly} autocomplete="off" onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} inputId="shipment-page-po-component-code" errorMessage={this.state.errorMessagePoComponentCode} errorMessageForce={this.state.errorMessagePoComponentCode !== ''} maxlength={45} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.order_quantity + this.state.required}</Label>
              <Input type="number" name="poQuantity" value={this.state.poQuantity}
                inputId="shipment-page-po-quantity" clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessagePoQuantity} errorMessageForce={this.state.errorMessagePoQuantity !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.order_date}</Label>
              <Input type="text" name="orderDate" value={this.state.orderDate} clearButton onInputClear={this.handleClear.bind(this)} readonly inputId="shipment-page-order-date" />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.due_date}</Label>
              <Input type="text" name="dueDate" value={this.state.dueDate} clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} readonly inputId="shipment-page-due-date" />
            </ListItem>
          </List>

          <Block className="no-margin">
            <Label>{this.state.dict.shipment_info}</Label>
          </Block>
          <List noHairlinesBetween className="no-margin-top">
            <ListItem>
              <Label>{this.state.dict.ship_date}</Label>
              <Input type="text" name="shipDate" value={this.state.shipDate} readonly inputId="shipment-page-ship-date" errorMessage={this.state.errorMessageShipDate} errorMessageForce={this.state.errorMessageShipDate !== ''} />
            </ListItem>
            <ListItem >
              <Label >{this.state.dict.component_code + this.state.required}</Label>
              <Input type="text" name="shipComponentCode" value={this.state.shipComponentCode} autocomplete="off" clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} inputId="shipment-page-ship-component-code" errorMessage={this.state.errorMessageShipComponentCode} errorMessageForce={this.state.errorMessageShipComponentCode !== ''} maxlength={45} />
            </ListItem>
            <ListItem >
              <Label >{this.state.dict.production_lot_number + this.state.required}</Label>
              <Input type="text" name="productionLotNumber" value={this.state.productionLotNumber} clearButton inputId="shipment-page-production-lot-number" onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageProductionLotNumber} errorMessageForce={this.state.errorMessageProductionLotNumber !== ''} maxlength={45} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.ship_quantity + this.state.required}</Label>
              <Input type="number" name="shipQuantity" value={this.state.shipQuantity} inputId="shipment-page-ship-quantity" clearButton onInputClear={this.handleClear.bind(this)} onChange={this.handleChange.bind(this)} errorMessage={this.state.errorMessageShipQuantity} errorMessageForce={this.state.errorMessageShipQuantity !== ''} />
            </ListItem>
            <ListItem>
              <Label>{this.state.dict.stock_quantity}</Label>
              <Input type="number" name="stockQuantity" value={this.state.stockQuantity} inputId="shipment-page-stock-quantity" readonly />
            </ListItem>
          </List>

          <Block>
            <Row>
              <Col>
                <Button  fill onClick={this.buttonRegistration.bind(this)}>{this.state.dict.registration}</Button>
              </Col>
            </Row>
          </Block>
          <Popup className="demo-popup" opened={this.state.opened} onPopupClosed={this.popupClosed.bind(this)}>
            <Page>
              <AppNavbar applicationTitle={this.state.dict.application_title} showBack={true} backClick={this.handleCancel.bind(this)} hideNavRight={true}></AppNavbar>
              <BlockTitle>{this.state.dict.shipment_registration}</BlockTitle>
              {this.renderTable()}
              <Toolbar bottomIos={true} bottomMd={true}>
                <Button onClick={this.handleSelected.bind(this)}>{this.state.dict.select_record}</Button>
                <Button onClick={this.handleCancel.bind(this)}>{this.state.dict.cancel}</Button>
              </Toolbar>
            </Page>
          </Popup>
        </Page>
      </DocumentTitle>
    );
  }

}