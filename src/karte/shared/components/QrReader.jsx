import React from 'react';
import jsQR from 'jsqr';
import {BrowserBarcodeReader} from '@zxing/library';

/**
 * QRリーダーコンポーネント。
 * カメラを起動、プレビューを表示、qrの解析に成功した場合、onQrReadイベントで通知を行う。
 */
export default class QrReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertMessages: []
    };
    this.wrapDivRef = React.createRef();
    this.prevCanvasRef = React.createRef();
    this.videoPermitted = this.videoPermitted.bind(this);
    this.videoDenied = this.videoDenied.bind(this);
    this.tick = this.tick.bind(this);
    this.fireQrCodeRead = this.fireQrCodeRead.bind(this);
    this.startCapture = this.startCapture.bind(this);
    this.stopCamera = this.stopCamera.bind(this);
    this.video = document.createElement('video');
    this.frameCnt = 0;
    this.rotateCanvas = this.rotateCanvas.bind(this);
    this.monochrome = this.monochrome.bind(this);
    this.sigmoid = this.sigmoid.bind(this);
    this.smoothing = this.smoothing.bind(this);
    this.scanQr = this.scanQr.bind(this);
    this.scanBarcode = this.scanBarcode.bind(this);
    this.turnRect = this.turnRect.bind(this);
    this.turnImage = this.turnImage.bind(this);
    /**カメラ映像を拡縮せずにプレビューのアスペクト比に切り落とすためのcanvas要素。 */
    this.rawCanvas = document.createElement('canvas');
    this.barcodeReader = new BrowserBarcodeReader();
  }

  componentDidMount() {
    this.startCapture(this.props.deviceId);
  }

  componentDidUpdate(prevProps) {
    if(prevProps.deviceId !== this.props.deviceId) {
      this.stopCamera();
      this.startCapture(this.props.deviceId);
    }
    if(this.prevCanvasRef.current) {
      const prvCtx = this.prevCanvasRef.current.getContext('2d');
      prvCtx.restore();
      prvCtx.save();
      if(prevProps.rotation !== this.props.rotation) {
        this.rotateCanvas(this.prevCanvasRef.current);
      }
    }
  }

  rotateCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.restore();
    ctx.save();
    ctx.rotate(this.props.rotation);
    switch(this.props.rotation) {
      case Math.PI/2:
        ctx.translate(0, -1 * canvas.width);
        break;
      case Math.PI:
        ctx.translate(-1 * canvas.width, -1 * canvas.height);
        break;
      case Math.PI * 3/2:
        ctx.translate(-1 * canvas.height, 0);
        break;
      default:
    }
  }

  startCapture(deviceId) {
    const videoOpt = deviceId ? {deviceId: deviceId} : {facingMode: 'environment'};
    videoOpt.advanced = [{width: 1920}, {height: 3840}];
    const constraint = {audio : false, video : videoOpt};
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraint)
        .then(this.videoPermitted)
        .catch(this.videoDenied);
    } else if (navigator.getUserMedia) {
      navigator.getUserMedia(constraint, this.videoPermitted, this.videoDenied);
    } else {
      this.setState({alertMessages: ['カメラの起動に失敗しました。',
        'Androidの場合はChromeをiPhoneの場合はSafariをご利用ください。',
        'iPhoneのホーム画面から開くとカメラが起動できないことがあります。',
        '',
        'Failed to launch the camera.',
        'If your phone is Android, please use Chrome. If it is iPhone, please use Safari.',
        'When opening from Home screen on iPhone, the camera usually cannot be launched.']
      });
      if(this.props.alertShown) {
        this.props.alertShown();
      }
    }
  }

  videoPermitted(stream) {
    this.initCanvasSize();
    this.rotateCanvas(this.prevCanvasRef.current);
    this.video.srcObject = stream;
    this.video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
    this.video.play();
    requestAnimationFrame(this.tick);
  }

  initCanvasSize() {
    const wrapDiv = this.wrapDivRef.current;
    const rect = wrapDiv.getBoundingClientRect();
    const prevCanvas = this.prevCanvasRef.current;
    prevCanvas.setAttribute('width', rect.width);
    prevCanvas.setAttribute('height', rect.height);
    const prvCtx = prevCanvas.getContext('2d');
    prvCtx.save();
  }

  videoDenied(err) {
    this.setState({alertMessages: ['Camera access denied: ' + err.name + ' : ' + err.message]});
    if(this.props.alertShown) {
      this.props.alertShown();
    }
  }

  fireQrCodeRead() {
    if(this.props.onQrRead) {
      this.props.onQrRead(this.state.readCode);
    }
  }

  tick() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      const prevCanvas = this.prevCanvasRef.current;
      if(!prevCanvas) {
        return;
      }
      const wrapDiv = this.wrapDivRef.current;
      const rect = wrapDiv.getBoundingClientRect();
      prevCanvas.setAttribute('width', rect.width);
      prevCanvas.setAttribute('height', rect.height);
      this.rotateCanvas(prevCanvas);
      const imageData = this.drawRawImage(this.rawCanvas, prevCanvas.getBoundingClientRect());
      const prevCtx = prevCanvas.getContext('2d');
      if(this.props.rotation % Math.PI === 0){
        prevCtx.drawImage(this.rawCanvas, 0, 0, this.rawCanvas.width, this.rawCanvas.height, 0, 0, prevCanvas.width, prevCanvas.height);
      } else {
        prevCtx.drawImage(this.rawCanvas, 0, 0, this.rawCanvas.width, this.rawCanvas.height, 0, 0, prevCanvas.height, prevCanvas.width);
      }
      prevCtx.save();
      
      if(this.frameCnt % this.props.qrDecodeFreq === 0) {
        if(['BARCODE'].includes(this.props.scanTarget)) {
          this.scanBarcode(imageData);
        }
        if(['QR'].includes(this.props.scanTarget)) {
          this.scanQr(imageData);
        }

        if(this.state.readCode) {
          this.fireQrCodeRead();
          return;
        }
      }
      prevCtx.restore();
      this.frameCnt = this.frameCnt % this.props.qrDecodeFreq + 1;
    }
    requestAnimationFrame(this.tick);
  }

  scanQr(imageData) {
    let code = jsQR(imageData.data, imageData.width, imageData.height, {inversionAttempts:'invertFirst'});
    if(!(code && code.data)) {
      const converted = this.sigmoid(this.sharpen(this.smoothing(imageData)));
      code = jsQR(converted.data, converted.width, converted.height, {inversionAttempts:'invertFirst'});
    }
    if(code && code.data) {
      this.setState({readCode: code.data});
    }
  }

  scanBarcode(imageData) {
    const converted = this.sigmoid(this.sharpen(this.smoothing(imageData)));
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext('2d').putImageData(converted, 0, 0);
    this.barcodeReader.decodeFromImage(null, canvas.toDataURL()).then(result =>{
      if(result.text) {
        this.setState({readCode: result.text});
      }
    }).catch(()=>{/* This library throws exception when failed to decode. So suppress the exception.*/});
  }

  /**カメラ画像からrectのアスペクト比の領域を最大で切り取り、canvasに描画。また、そのImageDataを返す。 */
  drawRawImage(canvas, rect) {
    var cutImgSize;
    var isBarcode = ['BARCODE'].includes(this.props.scanTarget);
    var zoomRatio = isBarcode ? 1.0 : 0.5;
    const isTrun = this.props.rotation % Math.PI !== 0;
    let ratio;
    if(!isTrun) {
      ratio = Math.min(this.video.videoWidth/rect.width, this.video.videoHeight/rect.height) * zoomRatio;
      cutImgSize = {width: rect.width * ratio, height: rect.height * ratio};
    } else {
      ratio = Math.min(this.video.videoWidth/rect.height, this.video.videoHeight/rect.width) * zoomRatio;
      cutImgSize = {width: rect.height * ratio, height: rect.width * ratio};
    }
    canvas.setAttribute('width', cutImgSize.width);
    canvas.setAttribute('height', cutImgSize.height);
    const rawCtx = canvas.getContext('2d');
    const cutPoint = {x: (this.video.videoWidth - cutImgSize.width)/2, y:(this.video.videoHeight - cutImgSize.height)/2};
    rawCtx.drawImage(this.video, Math.max(0, cutPoint.x), Math.max(0, cutPoint.y), cutImgSize.width, cutImgSize.height, 0, 0, canvas.width, canvas.height);
    /* 短辺の90%の正方形領域をqr解析に掛ける。*/
    let qrJudSquare = this.getScanArea({width: rect.width * ratio, height: rect.height * ratio}, isBarcode);
    qrJudSquare = isTrun ? this.turnRect(qrJudSquare) : qrJudSquare;
    const img = rawCtx.getImageData((canvas.width - qrJudSquare.width)/2, (canvas.height - qrJudSquare.height)/2, qrJudSquare.width, qrJudSquare.height);
    rawCtx.strokeStyle = '#FF3B58';
    rawCtx.lineWidth = isBarcode ? 4 : 2;
    rawCtx.strokeRect((canvas.width - qrJudSquare.width * 0.9)/2, (canvas.height - qrJudSquare.height * 0.9)/2, qrJudSquare.width * 0.9, qrJudSquare.height * 0.9);
    return isTrun ? this.turnImage(img) : img;
  }

  turnRect(rect) {
    return {width: rect.height, height: rect.width};
  }

  getScanArea(cutImgSize, isBarcode) {
    if(isBarcode) {
      return {width: cutImgSize.width, height: cutImgSize.height * 0.12};
    } else {
      const square = Math.min(cutImgSize.width, cutImgSize.height) * 0.45;
      return {width: square, height: square};
    }
  }

  turnImage(img) {
    const orgCanvas = document.createElement('canvas');
    orgCanvas.width = img.width;
    orgCanvas.height = img.height;
    
    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = img.height;
    rotCanvas.height = img.width;

    const orgCtx = orgCanvas.getContext('2d');
    orgCtx.putImageData(img, 0, 0);

    this.rotateCanvas(rotCanvas);
    const rotCtx = rotCanvas.getContext('2d');
    rotCtx.drawImage(orgCanvas, 0, 0);
    return rotCtx.getImageData(0, 0, rotCanvas.width, rotCanvas.height);
  }

  sigmoid(imgdata) {
    const gray = this.monochrome(imgdata);
    const ret = new ImageData(imgdata.width, imgdata.height);
    const a = 15; //5
    const sigmoidVal = val => (((Math.tanh(a * (val - 128)/255/2) + 1) / 2) * 255);
    const r = 2; //1.5
    const correctify = val => 255 * Math.pow(val / 255, 1 / r);
    for(let x = 0; x < gray.width; x++) {
      for(let y = 0; y < gray.height; y++) {
        const ridx = (imgdata.width * y + x) * 4;
        ret.data[ridx] = sigmoidVal(correctify(gray.data[ridx]));
        ret.data[ridx + 1] = sigmoidVal(correctify(gray.data[ridx]));
        ret.data[ridx + 2] = sigmoidVal(correctify(gray.data[ridx]));
        ret.data[ridx + 3] = 255;
      }
    }
    return ret;
  }

  monochrome(imgdata) {
    const ret = new ImageData(imgdata.width, imgdata.height);
    for(let x = 0; x < imgdata.width; x++) {
      for(let y = 0; y < imgdata.height; y++) {
        const ridx = (imgdata.width * y + x) * 4;
        const gray = (0.2126 * imgdata.data[ridx]) + (0.7152 * imgdata.data[ridx + 1]) + (0.0722 * imgdata.data[ridx + 2]);
        ret.data[ridx] = gray;
        ret.data[ridx + 1] = gray;
        ret.data[ridx + 2] = gray;
        ret.data[ridx + 3] = 255;
      }
    }
    return ret;
  }

  sharpen(imgdata) {
    const ret = new ImageData(imgdata.width, imgdata.height);
    for(let x = 0; x < imgdata.width; x++) {
      for(let y = 0; y < imgdata.height; y++) {
        const ridx = (imgdata.width * y + x) * 4;
        if(x === 0 || y === 0 || x === imgdata.width - 1 || y === imgdata.height - 1) {
          ret.data[ridx] = imgdata.data[ridx];
          ret.data[ridx + 1] = imgdata.data[ridx + 1];
          ret.data[ridx + 2] = imgdata.data[ridx + 2];
          ret.data[ridx + 3] = imgdata.data[ridx + 3];
        } else {
          const preRidx = (imgdata.width * (y - 1) + x) * 4;
          const nxtRidx = (imgdata.width * (y + 1) + x) * 4;
          ret.data[ridx] = (
            0 - imgdata.data[preRidx - 4] - imgdata.data[preRidx] - imgdata.data[preRidx + 4] -
            imgdata.data[ridx - 4] + (imgdata.data[ridx] * 9) - imgdata.data[ridx + 4] -
            imgdata.data[nxtRidx - 4] - imgdata.data[nxtRidx] - imgdata.data[nxtRidx + 4]
          );
          ret.data[ridx + 1] = (
            0 - imgdata.data[preRidx - 3] - imgdata.data[preRidx + 1] - imgdata.data[preRidx + 5] -
            imgdata.data[ridx - 3] + (imgdata.data[ridx + 1] * 9) - imgdata.data[ridx + 5] -
            imgdata.data[nxtRidx - 3] - imgdata.data[nxtRidx + 1] - imgdata.data[nxtRidx + 5]
          );
          ret.data[ridx + 2] = (
            0 - imgdata.data[preRidx - 2] - imgdata.data[preRidx + 2] - imgdata.data[preRidx + 6] -
            imgdata.data[ridx - 2] + (imgdata.data[ridx + 2] * 9) - imgdata.data[ridx + 6] -
            imgdata.data[nxtRidx - 2] - imgdata.data[nxtRidx + 2] - imgdata.data[nxtRidx + 6]
          );
          ret.data[ridx + 3] = imgdata.data[ridx + 3];
        }
      }
    }
    return ret;
  }

  smoothing(imgdata) {
    const ret = new ImageData(imgdata.width, imgdata.height);
    for(let x = 0; x < imgdata.width; x++) {
      for(let y = 0; y < imgdata.height; y++) {
        const ridx = (imgdata.width * y + x) * 4;
        if(x === 0 || y === 0 || x === imgdata.width - 1 || y === imgdata.height - 1) {
          ret.data[ridx] = imgdata.data[ridx];
          ret.data[ridx + 1] = imgdata.data[ridx + 1];
          ret.data[ridx + 2] = imgdata.data[ridx + 2];
          ret.data[ridx + 3] = imgdata.data[ridx + 3];
        } else {
          const preRidx = (imgdata.width * (y - 1) + x) * 4;
          const nxtRidx = (imgdata.width * (y + 1) + x) * 4;
          ret.data[ridx] = (
            imgdata.data[preRidx - 4] + imgdata.data[preRidx] + imgdata.data[preRidx + 4] +
            imgdata.data[ridx - 4] + imgdata.data[ridx] + imgdata.data[ridx + 4] +
            imgdata.data[nxtRidx - 4] + imgdata.data[nxtRidx] + imgdata.data[nxtRidx + 4]
          )/9;
          ret.data[ridx + 1] = (
            imgdata.data[preRidx - 3] + imgdata.data[preRidx + 1] + imgdata.data[preRidx + 5] +
            imgdata.data[ridx - 3] + imgdata.data[ridx + 1] + imgdata.data[ridx + 5] +
            imgdata.data[nxtRidx - 3] + imgdata.data[nxtRidx + 1] + imgdata.data[nxtRidx + 5]
          )/9;
          ret.data[ridx + 2] = (
            imgdata.data[preRidx - 2] + imgdata.data[preRidx + 2] + imgdata.data[preRidx + 6] +
            imgdata.data[ridx - 2] + imgdata.data[ridx + 2] + imgdata.data[ridx + 6] +
            imgdata.data[nxtRidx - 2] + imgdata.data[nxtRidx + 2] + imgdata.data[nxtRidx + 6]
          )/9;
          ret.data[ridx + 3] = imgdata.data[ridx + 3];
        }
      }
    }
    return ret;
  }

  componentWillUnmount() {
    this.stopCamera();
  }

  stopCamera() {
    if(this.video.srcObject && this.video.srcObject.getVideoTracks()) {
      this.video.srcObject.getVideoTracks()[0].stop();
    }
    this.video.removeAttribute('srcObject');
    this.video.load();
  }

  render() {
    if(!this.state.alertMessages.length) {
      return <div ref={this.wrapDivRef} style={this.props.style} className={this.props.className}>
        <div style={{position: 'absolute', top: '70px', marginLeft: '30px', fontSize: '24px', color: 'white', width: '100%'}} onClick={this.fireQrCodeRead}>{this.props.scanTarget}</div>
        <canvas ref={this.prevCanvasRef}></canvas>
      </div>;
    } else {
      return <div>{this.state.alertMessages.map(m=>m ? <div>{m}</div> : <br/>)}</div>;
    }
  }
}