import React from 'react';
import {
  Page,
  Navbar,
  Button,
  Toolbar,
  Fab,
  Icon
} from 'framework7-react';
import DictionaryLoader from 'karte/shared/logics/dictionary-loader';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import {UnexpectedError} from 'karte/shared/logics/errors';
import ImgCap from 'karte/shared/components/ImgCap';
import Cookies from 'universal-cookie';
import CamSettingDialog from 'karte/shared/components/CamSettingDialog';

/**
 * 画像キャプチャページ。
 * 以下のように、ページ遷移時にpropsへイベントハンドラーを渡す。
 * this.$f7router.navigate(APP_DIR_PATH + '/imgcap', {props:{onCapture: this.onCapture.bind(this)}});
 * イベントハンドラのコールバックは
 * onCapture(captured)
 * のように引数capturedを受け取り、下記プロパティを持つ。
 * captured
 * {
 *  imgData: キャプチャしたImageData, 
 *  blob: キャプチャ画像のblob,
 *  dataUrl: キャプチャ画像のdata:URL(canvas.toDataURL())
 * }
 */
export default class ImgCapPage extends React.Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
    //Cookieは有効期限切れになるケースがあるのでlocalstrageも見に行く。
    let deviceId = this.cookies.get('CAMERA-DEVICEID');
    deviceId = deviceId ? deviceId : localStorage['CAMERA-DEVICEID'];
    let rot = this.cookies.get('CAMERA-ROTATION');
    rot = rot ? rot : localStorage['CAMERA-ROTATION'];
    const rotation = Number(rot ? rot : '0');
    this.state = {
      opMode: ImgCap.OperationMode.Capturing,
      modalIsOpen: false,
      deviceId: deviceId,
      rotation: rotation,// 0~3. pi/2を掛けると実際の角度になる。
      hideFab: false,
      dict: {
        application_title: ''
      }
    };
    this.imgCapref = React.createRef();
    this.done = false;
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

  startEdit() {
    this.setState({opMode: ImgCap.OperationMode.Editing});
  }

  capture() {
    if(this.done) {
      return;
    }
    
    this.imgCapref.current.takeEditedPict().then((captured)=>{
      if(this.props.onCapture) {
        this.props.onCapture(captured);
      }
      this.$f7router.back();
    });
    this.done = true;
  }

  retake() {
    this.setState({opMode: ImgCap.OperationMode.Capturing});
  }

  clearEdit() {
    this.imgCapref.current.clearEdit();
  }

  openSettings() {
    this.setState({modalIsOpen: true});
  }

  handleSettingChanged(settings) {
    let newState = {modalIsOpen: false};
    if(settings && settings.deviceId) {
      newState = Object.assign(newState, {deviceId: settings.deviceId});
    }
    this.setState(newState);
  }

  rotateCam() {
    const newRot = (this.state.rotation + 1) % 4;
    const expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + 10);
    this.cookies.set('CAMERA-ROTATION', newRot, {path: '/', expires: expireDate});
    localStorage['CAMERA-ROTATION'] = newRot;
    this.setState({rotation: newRot});
  }

  handleAlertShown() {
    this.setState({hideFab: true});
  }

  render() {
    return <Page id='imgCapPage'>
      <Navbar title={this.state.dict.application_title} backLink="Back"></Navbar>
      <ImgCap 
        ref={this.imgCapref} 
        style={{width: '100%', height: '100%'}} 
        opMode={this.state.opMode} 
        deviceId={this.state.deviceId} 
        rotation={this.state.rotation * Math.PI / 2} 
        alertShown={this.handleAlertShown.bind(this)}
      ></ImgCap>
      <Fab position="center-bottom" slot="fixed" color="blue" onClick={this.startEdit.bind(this)} style={{display: this.state.opMode === ImgCap.OperationMode.Capturing && !this.state.hideFab ? '' : 'none'}}>
        <Icon material='camera'></Icon>
      </Fab>
      <Fab position='right-top' slot='fixed' color='blue' onClick={this.rotateCam.bind(this)} style={{display: this.state.opMode === ImgCap.OperationMode.Editing || this.state.hideFab ? 'none' : ''}}>
        <Icon material='rotate_right'></Icon>
      </Fab>
      <Fab position="right-bottom" style={{display: (this.state.opMode === ImgCap.OperationMode.Editing || this.state.hideFab) ? 'none' : 'inline'}} slot="fixed" color="blue" onClick={this.openSettings.bind(this)}>
        <Icon material='settings'></Icon>
      </Fab>
      <div style={{display: this.state.opMode === ImgCap.OperationMode.Capturing ? 'none' : '', width: '100%', position: 'fixed', bottom:'0px'}}>
        <Toolbar bottomMd={true}>
          <Button iconMaterial='camera_alt' onClick={this.retake.bind(this)}></Button>
          <Button iconMaterial='check' onClick={this.capture.bind(this)}></Button>
          <Button iconMaterial='undo' onClick={this.clearEdit.bind(this)}></Button>
        </Toolbar>
      </div>
      <CamSettingDialog parentSelector={()=>document.querySelector('#imgCapPage')} selected={this.handleSettingChanged.bind(this)} isOpen={this.state.modalIsOpen}></CamSettingDialog>
    </Page>;
  }
}