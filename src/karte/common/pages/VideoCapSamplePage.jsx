import React from 'react';
import {
  Page,
  Navbar,
  List,
  ListItem
} from 'framework7-react';
import {APP_DIR_PATH} from 'karte/shared/logics/app-location';
import VideoCap from 'karte/shared/components/VideoCap';
import FileUtil from 'karte/shared/logics/fileutil';

export default class VideoCapSamplePage extends React.Component {
  constructor(props) {
    super(props);
    this.onVideoCapture = this.onVideoCapture.bind(this);
  }

  onVideoCapture(file) {
    FileUtil.uploadBlob(file, 'video', '30800', 'captured.mp4');
  }

  sendToImgCap() {
    this.$f7router.navigate(APP_DIR_PATH + '/imgcap', {props:{onCapture: this.onImgCapture.bind(this)}});
  }

  onImgCapture(captured) {
    FileUtil.uploadBlob(captured.blob, 'image', '30800', 'capturedimg.png');
    const img = document.getElementById('sampleImg');
    img.src = captured.dataUrl;
  }

  sendToQrRead() {
    this.$f7router.navigate(APP_DIR_PATH + '/qrpage', {props:{onQrRead: this.onQrRead.bind(this)}});
  }

  onQrRead(code) {
    alert(code);
  }

  sendToImgEdit() {
    const img = document.getElementById('sampleImg');
    if(!img.src) {
      alert('Edit target is not captured.');
    } else {
      this.$f7router.navigate(APP_DIR_PATH + '/imgedit', {props:{onCapture: this.onImgEdited.bind(this), imageSrc: img}});
    }
  }

  onImgEdited(edited) {
    FileUtil.uploadBlob(edited.blob, 'image', '30800', 'editedimg.png');
    const img = document.getElementById('sampleImg');
    img.src = edited.dataUrl;
  }

  render() {
    return <Page>
      <Navbar title="VideoReaderSample" backLink="Back"></Navbar>
      <List>
        <ListItem key='1' onClick={this.sendToQrRead.bind(this)} title='QrRead'></ListItem>
        <ListItem key='2' onClick={this.sendToImgCap.bind(this)} title='imgCap'></ListItem>
        <ListItem key='3' onClick={this.sendToImgEdit.bind(this)} title='imgEdit'></ListItem>
      </List>
      <img id='sampleImg' alt=''></img>
      <VideoCap position='center-bottom' onCapture={this.onVideoCapture} capture='environment'></VideoCap>
    </Page>;
  }
}