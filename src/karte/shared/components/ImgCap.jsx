import React from 'react';
import FileUtil from 'karte/shared/logics/fileutil';

/**
 * 画像キャプチャコンポーネント。
 * 外部からcapture()を呼ぶことで画像を撮影し、
 * takeEditedPict()を呼ぶことで編集された画像を取得します。
 */
export default class ImgCap extends React.Component {
  /**動作モード */
  static OperationMode = {
    /**画像撮影モード */
    Capturing: 'Capturing',
    /**画像編集モード */
    Editing: 'Editing'
  }

  constructor(props) {
    super(props);
    this.state = {
      alertMessages: []
    };
    /** カメラ画像取得用Video要素*/
    this.video = document.createElement('video');
    /** カメラ画像を非縮小で保持するcanvas。ただし、プレビュー領域とアスペクト比が一致するようにトリムされています。*/
    this.rawScaleCanvas = document.createElement('canvas');
    this.prevCanvasRef = React.createRef();
    this.wrapDivRef = React.createRef();
    /** 撮影時のイメージデータ(Rawスケール)。 */
    this.backupImgData = null;
    this.videoPermitted = this.videoPermitted.bind(this);
    this.videoDenied = this.videoDenied.bind(this);
    this.tick = this.tick.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.clearEdit = this.clearEdit.bind(this);
    this.startCapture = this.startCapture.bind(this);
    this.stopCamera = this.stopCamera.bind(this);
    this.rotatePreview = this.rotateCanvas.bind(this);
    this.rotatePos = this.rotatePos.bind(this);
    this.rotPosInv = this.rotPosInv.bind(this);
    /**前回のtouchMoveイベントで触っていた場所の座標(prevCanvas座標系) */
    this.prevPosition = {x:0, y:0};
  }

  componentDidMount() {
    this.startCapture(this.props.deviceId);
  }

  startCapture(deviceId) {
    const constraint = {audio : false, video : deviceId ? {deviceId: deviceId} : {facingMode: 'environment'}};
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

  componentDidUpdate(prevProps) {
    if(prevProps.opMode !== this.props.opMode) {
      if(this.props.opMode === ImgCap.OperationMode.Editing) {
        // 撮影モード→編集モードへ移行する際はバックアップイメージを取得。
        this.backupImgData = this.rawScaleCanvas.getContext('2d').getImageData(0, 0, this.rawScaleCanvas.width, this.rawScaleCanvas.height);
        this.prevPosition = {x:0, y:0};
        if(this.prevCanvasRef.current) {
          const prvCtx = this.prevCanvasRef.current.getContext('2d');
          prvCtx.restore();
          prvCtx.save();
        }
      } else {
        this.rotateCanvas(this.prevCanvasRef.current);
      }
    }
    if(prevProps.deviceId !== this.props.deviceId) {
      this.stopCamera();
      this.startCapture(this.props.deviceId);
    }
    if(prevProps.rotation !== this.props.rotation) {
      this.rotateCanvas(this.prevCanvasRef.current);
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

  tick() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      const prevCanvas = this.prevCanvasRef.current;
      if(prevCanvas && this.props.opMode === ImgCap.OperationMode.Capturing) {
        const wrapDiv = this.wrapDivRef.current;
        const rect = wrapDiv.getBoundingClientRect();
        prevCanvas.setAttribute('width', rect.width);
        prevCanvas.setAttribute('height', rect.height);
        this.rotateCanvas(prevCanvas);
        this.drawImage(this.rawScaleCanvas, prevCanvas.getBoundingClientRect());
        const prevCtx = prevCanvas.getContext('2d');
        if(this.props.rotation % Math.PI === 0) {
          prevCtx.drawImage(this.rawScaleCanvas, 0, 0, this.rawScaleCanvas.width, this.rawScaleCanvas.height, 0, 0, prevCanvas.width, prevCanvas.height);
        } else {
          prevCtx.drawImage(this.rawScaleCanvas, 0, 0, this.rawScaleCanvas.width, this.rawScaleCanvas.height, 0, 0, prevCanvas.height, prevCanvas.width);
        }
      }
    }
    requestAnimationFrame(this.tick);
  }

  drawImage(canvas, rect) {
    var cutImgSize;
    if(this.props.rotation % Math.PI === 0) {
      const ratio = Math.min(this.video.videoWidth/rect.width, this.video.videoHeight/rect.height);
      cutImgSize = {width: rect.width * ratio, height: rect.height * ratio};
    } else {
      const ratio = Math.min(this.video.videoWidth/rect.height, this.video.videoHeight/rect.width);
      cutImgSize = {width: rect.height * ratio, height: rect.width * ratio};
    }
    canvas.setAttribute('width', cutImgSize.width);
    canvas.setAttribute('height', cutImgSize.height);
    const ctx = canvas.getContext('2d');
    const cutPoint = {x: (this.video.videoWidth - cutImgSize.width)/2, y:(this.video.videoHeight - cutImgSize.height)/2};
    ctx.drawImage(this.video, cutPoint.x, cutPoint.y, cutImgSize.width, cutImgSize.height, 0, 0, canvas.width, canvas.height);
  }

  videoDenied(err) {
    this.setState({alertMessage: ['Camera access denied: ' + err.name + ' : ' + err.message]});
    if(this.props.alertShown) {
      this.props.alertShown();
    }
  }

  handleTouchMove(event) {
    if(this.props.opMode !== ImgCap.OperationMode.Editing || event.targetTouches.length === 0) {
      return;
    }
    const touch = event.targetTouches[0];
    const prevCanvas = this.prevCanvasRef.current;
    const currPosition = {
      x: touch.clientX - prevCanvas.offsetLeft,
      y: touch.clientY - prevCanvas.offsetTop
    };
    this.drawTrace(prevCanvas, currPosition, this.prevPosition, 1);

    const ratio = (this.props.rotation % Math.PI === 0) ? this.rawScaleCanvas.width / prevCanvas.width : this.rawScaleCanvas.height / prevCanvas.width;
    this.drawTrace(this.rawScaleCanvas, this.rotatePos(currPosition), this.rotatePos(this.prevPosition), ratio);
    this.prevPosition = currPosition;
  }

  rotatePos(point) {
    if(this.props.rotation === 0) {
      return point;
    } else if (this.props.rotation === (Math.PI / 2)) {
      return {x: point.y, y: this.prevCanvasRef.current.width - point.x};
    } else if (this.props.rotation === Math.PI) {
      return {x: this.prevCanvasRef.current.width - point.x, y: this.prevCanvasRef.current.height - point.y};
    } else if (this.props.rotation === (3 * Math.PI / 2)) {
      return {x: this.prevCanvasRef.current.height - point.y, y: point.x};
    }
  }

  rotPosInv(point) {
    if(this.props.rotation === 0) {
      return point;
    } else if (this.props.rotation === (Math.PI / 2)) {
      return {x: this.prevCanvasRef.current.width - point.y, y: point.x};
    } else if (this.props.rotation === Math.PI) {
      return {x: this.prevCanvasRef.current.width - point.x, y: this.prevCanvasRef.current.height - point.y};
    } else if (this.props.rotation === (3 * Math.PI / 2)) {
      return {x: point.y, y: this.prevCanvasRef.current.height - point.x};
    }
  }

  drawTrace(canvas, currPosition, prevPosition, ratio) {
    const ctx = canvas.getContext('2d');
    const color = '#FF1133';
    const invRoted = this.rotPosInv(prevPosition);
    ctx.beginPath();
    if((prevPosition.x !== 0 && prevPosition.y !== 0) 
      && (invRoted.x !== 0 && invRoted.y !== 0)) {

      ctx.strokeStyle = color;
      ctx.lineWidth = 4 * ratio;
      ctx.moveTo(prevPosition.x * ratio, prevPosition.y * ratio);
      ctx.lineTo(currPosition.x * ratio, currPosition.y * ratio);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.arc(currPosition.x * ratio, currPosition.y * ratio, 2 * ratio, 0, Math.PI*2.0, true);
    ctx.fill();
  }

  /** 画像を取得する。ImageDataオブジェクト及びblobを返します。*/
  takeEditedPict() {
    const canvas = document.createElement('canvas');
    if(this.props.rotation % Math.PI === 0) {
      canvas.setAttribute('width', this.rawScaleCanvas.width);
      canvas.setAttribute('height', this.rawScaleCanvas.height);
    } else {
      canvas.setAttribute('width', this.rawScaleCanvas.height);
      canvas.setAttribute('height', this.rawScaleCanvas.width);
    }
    this.rotateCanvas(canvas);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.rawScaleCanvas, 0, 0);
    return FileUtil.shrinkImg(canvas.toDataURL(), 750, 1000);
  }

  clearEdit() {
    this.rawScaleCanvas.getContext('2d').putImageData(this.backupImgData, 0, 0);
    const prvCanvas = this.prevCanvasRef.current;
    this.rotateCanvas(prvCanvas);
    const prvCtx = prvCanvas.getContext('2d');
    if(this.props.rotation % Math.PI === 0) {
      prvCtx.drawImage(this.rawScaleCanvas, 0, 0, this.rawScaleCanvas.width, this.rawScaleCanvas.height, 0, 0, prvCanvas.width, prvCanvas.height);
    } else {
      prvCtx.drawImage(this.rawScaleCanvas, 0, 0, this.rawScaleCanvas.width, this.rawScaleCanvas.height, 0, 0, prvCanvas.height, prvCanvas.width);
    }
    prvCtx.restore();
    prvCtx.save();
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
        <canvas ref={this.prevCanvasRef} onTouchStart={this.handleTouchMove} onTouchMove={this.handleTouchMove} onTouchEnd={()=>{this.prevPosition = {x:0, y:0};}}></canvas>
      </div>;
    } else {
      return <div>{this.state.alertMessages.map(m=>m ? <div>{m}</div> : <br/>)}</div>;
    }
  }
}