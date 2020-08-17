import React from 'react';
import {
  Page,
  Navbar,
  Fab,
  Icon
} from 'framework7-react';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import {UnexpectedError} from 'karte/shared/logics/errors';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import QrReader from 'karte/shared/components/QrReader';
import Cookies from 'universal-cookie';
import CamSettingDialog from 'karte/shared/components/CamSettingDialog';

/**
 * QRリーダーページ。qrの解析に成功した場合、onQrReadイベントで通知を行う。
 * 以下のように、ページ遷移時にpropsへイベントハンドラーを渡す。
 * this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props:{onQrRead: this.onQrRead.bind(this)}});
 * イベントハンドラのコールバックは
 * onQrRead(code)のように読取に成功したqrコードの内容を文字列で受け取ります。
 */
export default class QrPage extends React.Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
    let deviceId = this.cookies.get('CAMERA-DEVICEID');
    deviceId = deviceId ? deviceId : localStorage['CAMERA-DEVICEID'];
    let rot = this.cookies.get('CAMERA-ROTATION');
    rot = rot ? rot : localStorage['CAMERA-ROTATION'];
    const rotation = Number(rot ? rot : '0');
    let qrDecodeFreq = parseInt(this.cookies.get('FREQ-QR-DECODE'));
    qrDecodeFreq = qrDecodeFreq ? qrDecodeFreq : parseInt(localStorage['FREQ-QR-DECODE']);
    const scanTgt = localStorage['QR-SCAN-TARGET'];
    this.onQrRead = this.onQrRead.bind(this);
    this.state = {
      modalIsOpen: false,
      deviceId: deviceId,
      rotation: rotation,// 0~3. pi/2を掛けると実際の角度になる。
      qrDecodeFreq: (isNaN(qrDecodeFreq) ? 3 : qrDecodeFreq),
      scanTarget: scanTgt ? scanTgt : 'QR',
      hideFab: false,
      dict: {
        application_title: ''
      }
    };
  }

  componentDidMount() {
    var me = this;
    DictionaryLoader.getDictionary(this.state.dict)
      .then(values => me.setState({dict: values}))
      .catch(err => {
        if (err.errorCode === 'E103') {
          me.$f7.views.main.router.navigate(APP_DIR_PATH + '/login', {reloadAll: true});
        } else {
          me.setState(() => { throw new UnexpectedError(err); });
        }
      });
  }

  onQrRead(code) {
    if(this.props.onQrRead) {
      this.props.onQrRead(code);
    }
    this.$f7router.back();
  }

  openSettings() {
    this.setState({modalIsOpen: true});
  }

  rotateCam() {
    const newRot = (this.state.rotation + 1) % 4;
    const expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + 10);
    this.cookies.set('CAMERA-ROTATION', newRot, {path: '/', expires: expireDate});
    localStorage['CAMERA-ROTATION'] = newRot;
    this.setState({rotation: newRot});
  }

  handleSettingChanged(settings) {
    let newState = {modalIsOpen: false};
    if(settings && settings.deviceId) {
      newState = Object.assign(newState, {deviceId: settings.deviceId});
    }
    if(settings && settings.qrDecodeFreq) {
      newState = Object.assign(newState, {qrDecodeFreq: settings.qrDecodeFreq});
    }
    if(settings && settings.scanTarget) {
      newState = Object.assign(newState, {scanTarget: settings.scanTarget});
    }
    this.setState(newState);
  }

  handleAlertShown() {
    this.setState({hideFab: true});
  }

  render() {
    return <Page id='qrPage'>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <QrReader 
        onQrRead={this.onQrRead} 
        style={{width: '100%', height: '100%'}} 
        deviceId={this.state.deviceId} 
        rotation={this.state.rotation * Math.PI / 2} 
        qrDecodeFreq={this.state.qrDecodeFreq} 
        scanTarget={this.state.scanTarget} 
        alertShown={this.handleAlertShown.bind(this)}>
      </QrReader>
      <Fab position="right-bottom" slot="fixed" color="blue" onClick={this.openSettings.bind(this)} style={{display: this.state.hideFab ? 'none' : ''}}>
        <Icon material='settings'></Icon>
      </Fab>
      <Fab position='right-top' slot='fixed' color='blue' onClick={this.rotateCam.bind(this)} style={{display: this.state.hideFab ? 'none' : ''}}>
        <Icon material='rotate_right'></Icon>
      </Fab>
      <CamSettingDialog parentSelector={()=>document.querySelector('#qrPage')} selected={this.handleSettingChanged.bind(this)} isOpen={this.state.modalIsOpen}></CamSettingDialog>
    </Page>;
  }
}