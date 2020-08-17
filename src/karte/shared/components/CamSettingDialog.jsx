import React from 'react';
import {
  Block,
  List,
  ListItem,
  Label,
  Input,
  Row,
  Col,
  Button
} from 'framework7-react';
import Cookies from 'universal-cookie';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import {UnexpectedError} from 'karte/shared/logics/errors';
import Modal, { modalStyle } from 'karte/shared/components/modal-helper';

/**
 * カメラ設定ダイアログ。
 * parentSelectorプロパティに親selectorを指定し、
 * isOpenプロパティをtrueにすることで開く。
 * 選択されたデバイスはプロパティのselectedメソッドのパラメータとして返される。
 * device: {deviceId: '', label: ''}
 */
export default class CamSettingDialog extends React.Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
    this.camSettings = {};
    this.state = {
      isOpen: false,
      dict: {
        menu_category_setting: '',
        camera: '',
        freq_qr_decode: '',
        scan_target: '',
        ok: '',
        cancel: ''
      }
    };
  }

  componentDidMount() {
    DictionaryLoader.getDictionary(this.state.dict)
      .then(values => this.setState({dict: values}))
      .catch(err => {
        if (err.errorCode === 'E103') {
          this.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {reloadAll: true});
        } else {
          this.setState(() => { throw new UnexpectedError(err); });
        }
      });
  }

  createDevicePicker(camDevices) {
    const picker = this.$f7.picker.create({
      inputEl: '#SelectedCamera',
      formatValue: (values, displayValues)=>displayValues[0],
      cols:[{
        textAlign: 'center',
        values: camDevices.map(d=>d.deviceId),
        displayValues: camDevices.map(d=>d.label),
        onChange: (picker, value)=>{
          this.camSettings.deviceId = value;
        }
      }]
    });
    let defaultDevId = this.cookies.get('CAMERA-DEVICEID');
    defaultDevId = defaultDevId ? defaultDevId : localStorage['CAMERA-DEVICEID'];
    camDevices.filter(d=>d.deviceId === defaultDevId)
      .forEach(d=>picker.setValue([d.deviceId], d.label));
  }

  createFreqPicker() {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const picker = this.$f7.picker.create({
      inputEl: '#freqQrDecode',
      formatValue: (values, displayValues)=>displayValues[0],
      cols:[{
        textAlign: 'center',
        values: arr,
        displayValues: arr.map(i=>'1/' + i),
        onChange: (picker, value)=>{
          this.camSettings.qrDecodeFreq = value;
        }
      }]
    });
    let f = parseInt(this.cookies.get('FREQ-QR-DECODE'));
    f = f ? f : parseInt(localStorage['FREQ-QR-DECODE']);
    f = Number.isNaN(f) ? 3 : f;
    picker.setValue([f], '1/' + f);
  }

  createScanTgtPicker() {
    const arr = ['QR', 'BARCODE'];
    const picker = this.$f7.picker.create({
      inputEl: '#scanTarget',
      formatValue: (values, displayValues)=>displayValues[0],
      cols:[{
        textAlign: 'center',
        values: arr,
        displayValues: arr,
        onChange: (picker, value)=>{
          this.camSettings.scanTarget = value;
        }
      }]
    });
    let t = localStorage['QR-SCAN-TARGET'];
    t = t ? t : 'QR';
    picker.setValue([t], t);
  }

  componentDidUpdate(prevProps) {
    if(prevProps.isOpen !== this.props.isOpen) {
      this.setState({isOpen: this.props.isOpen});
    }
  }

  afterOpenModal() {
    if(navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices=>{
          this.createDevicePicker.bind(this)(devices.filter(d=>d.kind === 'videoinput'));
        });
    }
    this.createFreqPicker.bind(this)();
    this.createScanTgtPicker.bind(this)();
  }

  handleOK() {
    const expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + 10);
    if(this.camSettings.deviceId) {
      //旧実装がCookieを使っていたため、下位互換を保つために両方にセットする
      this.cookies.set('CAMERA-DEVICEID', this.camSettings.deviceId, {path: '/', expires: expireDate});
      localStorage['CAMERA-DEVICEID'] = this.camSettings.deviceId;
    }
    if(this.camSettings.qrDecodeFreq) {
      this.cookies.set('FREQ-QR-DECODE', this.camSettings.qrDecodeFreq, {path: '/', expires: expireDate});
      localStorage['FREQ-QR-DECODE'] = this.camSettings.qrDecodeFreq;
    }
    if(this.camSettings.scanTarget) {
      localStorage['QR-SCAN-TARGET'] = this.camSettings.scanTarget;
    }
    this.props.selected(this.camSettings);
  }

  handleCancel() {
    this.props.selected({});
  }

  render() {
    return <Modal 
      parentSelector={this.props.parentSelector} 
      isOpen={this.state.isOpen} 
      style={modalStyle} 
      onAfterOpen={this.afterOpenModal.bind(this)} 
      shouldCloseOnOverlayClick={false}>
      <Block className="no-margin-bottom">
        {this.state.dict.menu_category_setting}
      </Block>
      <List noHairlinesBetween className="no-margin-top no-margin-bottom">
        <ListItem style={{display: this.$f7.device.ios ? 'none' : 'inline'}}>
          <Label>{this.state.dict.camera}</Label>
          <Input inputId='SelectedCamera' type="text"></Input>
        </ListItem>
        <ListItem>
          <Label>{this.state.dict.freq_qr_decode}</Label>
          <Input inputId='freqQrDecode' type="text"></Input>
        </ListItem>
        <ListItem>
          <Label>{this.state.dict.scan_target}</Label>
          <Input inputId='scanTarget' type="text"></Input>
        </ListItem>
      </List>
      <Block>
        <Row>
          <Col width="50">
            <Button fill onClick={this.handleOK.bind(this)}>{this.state.dict.ok}</Button>
          </Col>
          <Col width="50">
            <Button fill onClick={this.handleCancel.bind(this)}>{this.state.dict.cancel}</Button>
          </Col>
        </Row>
      </Block>
    </Modal>;
  }
}