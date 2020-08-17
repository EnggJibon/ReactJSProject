import React from 'react';

/**Image編集コンポーネント。
 * 編集対象画像はprops.imageSrcにHTMLImageElement型のインスタンスを渡す。
 */
export default class ImgEdit extends React.Component {
  constructor(props) {
    super(props);
    this.backupImgData = null;
    this.rawScaleCanvas = document.createElement('canvas');
    this.touchStartTime = 0;
    /**拡大率。0.2～3 */
    this.zoomRatio = 1;
    this.minScale = 0.2;
    /**二本指タッチ開始時の2点間の距離。(2点タッチしていない場合0とする) */
    this.touchDistance = 0;
    this.prevCanvasRef = React.createRef();
    this.wrapDivRef = React.createRef();
    this.initCanvasSize = this.initCanvasSize.bind(this);
    this.imgToCanvas = this.imgToCanvas.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.pinch = this.pinch.bind(this);
    this.clearEdit = this.clearEdit.bind(this);
    this.singleSwipe = this.singleSwipe.bind(this);
    this.doubleSwipe = this.doubleSwipe.bind(this);
    this.takeEditedPict = this.takeEditedPict.bind(this);
    /**前回のtouchMoveイベントで触っていた場所の座標(prevCanvas座標系) */
    this.prevPosInCanvas = {x:0, y:0};
    /**前回のtouchMoveイベントで触っていた場所の座標(client座標系) */
    this.prevPosInClient = {x:0, y:0};
    /**本画面はスクロールを2本指スワイプで行い、1本指スワイプで編集を行うが、
     * 2本指スワイプを行おうとしても一瞬1本指スワイプと判定されてしまう。
     * そこでコンマ数秒の判定期間を設け、その間は編集を行わない。
     * 判定期間中の軌跡をstrokeBufferに保持し、1本指スワイプだった時に描画する。
     */
    this.strokeBuffer = [];
  }

  componentDidMount() {
    this.initCanvasSize();
    
    const prevCanvas = this.prevCanvasRef.current;
    prevCanvas.addEventListener('touchstart', this.handleTouchStart, {passive: false});
    prevCanvas.addEventListener('touchmove', this.handleTouchMove, {passive: false});
    prevCanvas.addEventListener('touchend', this.handleTouchEnd, {passive: false});

    const wrapDiv = this.wrapDivRef.current;
    const rect = wrapDiv.getBoundingClientRect();
    this.minScale = Math.min(rect.width/prevCanvas.width, rect.height/prevCanvas.height);
  }

  initCanvasSize() {
    if(this.props.imageSrc.naturalWidth === 0 || this.props.imageSrc.naturalHeight === 0) {
      return;
    }
    this.imgToCanvas(this.rawScaleCanvas, this.props.imageSrc);
    const prevCanvas = this.prevCanvasRef.current;
    this.imgToCanvas(prevCanvas, this.props.imageSrc);
    const ctx = prevCanvas.getContext('2d');
    this.backupImgData = ctx.getImageData(0, 0, prevCanvas.width, prevCanvas.height);
  }

  imgToCanvas(canvas, imgEl) {
    canvas.setAttribute('width', imgEl.naturalWidth);
    canvas.setAttribute('height', imgEl.naturalHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0);
  }

  handleTouchStart(event) {
    this.touchStartTime = event.timeStamp;
    this.strokeBuffer = [];
    this.prevPosInCanvas = this.getPosInCanvas(event);
    this.prevPosInClient = this.getPosInClient(event);
  }

  handleTouchMove(event) {
    event.preventDefault();
    const elapsed = event.timeStamp - this.touchStartTime;
    const currPosInCanvas = this.getPosInCanvas(event);
    if(elapsed < 200) {
      this.strokeBuffer.push(currPosInCanvas);
      return;
    }
    const currPosInClient = this.getPosInClient(event);
    if(event.targetTouches.length === 1) {
      this.singleSwipe(currPosInCanvas);
    } else if(event.targetTouches.length === 2) {
      this.doubleSwipe(currPosInClient);
      this.pinch(event.targetTouches[0], event.targetTouches[1]);
    }
    this.strokeBuffer = [];
    this.prevPosInCanvas = currPosInCanvas;
    this.prevPosInClient = currPosInClient;
  }

  /**Canvas座標系での現在地を取得する。 */
  getPosInCanvas(event) {
    const touch = event.targetTouches[0];
    const prevCanvas = this.prevCanvasRef.current;
    const wrapDiv = this.wrapDivRef.current;
    return {
      x: touch.clientX + wrapDiv.scrollLeft,
      y: touch.clientY + wrapDiv.scrollTop - prevCanvas.offsetTop
    };
  }

  /**Client座標系での現在地を取得する。 */
  getPosInClient(event) {
    const touch = event.targetTouches[0];
    const prevCanvas = this.prevCanvasRef.current;
    return {
      x: touch.clientX - prevCanvas.offsetLeft,
      y: touch.clientY - prevCanvas.offsetTop
    };
  }

  singleSwipe(currPosition) {
    if((this.prevPosInCanvas.x === 0 && this.prevPosInCanvas.y === 0) || this.touchDistance > 0) {
      return;
    }
    const prevCanvas = this.prevCanvasRef.current;
    for(let i = 1; i < this.strokeBuffer.length; i++) {
      this.drawTrace(prevCanvas, this.strokeBuffer[i], this.strokeBuffer[i - 1], 1);
      this.drawTrace(this.rawScaleCanvas, this.strokeBuffer[i], this.strokeBuffer[i - 1], 1 / this.zoomRatio);
      this.prevPosInCanvas = this.strokeBuffer[i];
    }
    this.drawTrace(prevCanvas, currPosition, this.prevPosInCanvas, 1);
    this.drawTrace(this.rawScaleCanvas, currPosition, this.prevPosInCanvas, 1 / this.zoomRatio);
  }

  doubleSwipe(currPosition) {
    if(this.prevPosInCanvas.x === 0 && this.prevPosInCanvas.y === 0) {
      return;
    }
    const wrapDiv = this.wrapDivRef.current;
    const diff = {
      x: currPosition.x - this.prevPosInClient.x,
      y: currPosition.y - this.prevPosInClient.y
    };
    if(diff.x !== 0 || diff.y !== 0) {
      wrapDiv.scroll(wrapDiv.scrollLeft - diff.x, wrapDiv.scrollTop - diff.y);
    }
  }

  pinch(touch1, touch2) {
    if(this.touchDistance === 0) {
      this.touchDistance = this.getDistance(touch1, touch2);
      return;
    }
    const currDistance = this.getDistance(touch1, touch2);
    this.zoomRatio *= (currDistance / this.touchDistance);
    this.zoomRatio = Math.min(Math.max(this.zoomRatio, this.minScale), 3);
    this.touchDistance = currDistance;

    const prevCanvas = this.prevCanvasRef.current;
    prevCanvas.setAttribute('width', this.rawScaleCanvas.width * this.zoomRatio);
    prevCanvas.setAttribute('height', this.rawScaleCanvas.height * this.zoomRatio);
    prevCanvas.getContext('2d').drawImage(this.rawScaleCanvas, 0, 0, prevCanvas.width, prevCanvas.height);
  }

  getDistance(touch1, touch2) {
    const difX = touch1.clientX - touch2.clientX;
    const difY = touch1.clientY - touch2.clientY;
    return Math.sqrt((difX * difX) + (difY * difY));
  }

  drawTrace(canvas, currPosition, prevPosition, ratio) {
    const ctx = canvas.getContext('2d');
    const color = '#FF1133';
    ctx.beginPath();
    if(prevPosition.x !== 0 && prevPosition.y !== 0) {
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

  handleTouchEnd() {
    this.prevPosInCanvas = {x:0, y:0};
    this.touchStartTime = 0;
    this.touchDistance = 0;
  }

  takeEditedPict() {
    return new Promise((resolve)=>{
      this.rawScaleCanvas.toBlob(blob => {
        const captured = {
          imgData: this.rawScaleCanvas.getContext('2d').getImageData(0, 0, this.rawScaleCanvas.width, this.rawScaleCanvas.height),
          blob: blob,
          dataUrl: this.rawScaleCanvas.toDataURL()
        };
        resolve(captured);
      }, 'image/jpeg');
    });
  }

  clearEdit() {
    const prevCanvas = this.prevCanvasRef.current;
    this.rawScaleCanvas.getContext('2d').putImageData(this.backupImgData, 0, 0);
    prevCanvas.getContext('2d').drawImage(this.rawScaleCanvas, 0, 0, prevCanvas.width, prevCanvas.height);
  }

  render() {
    return <div ref={this.wrapDivRef} style={Object.assign(this.props.style, {overflow: 'scroll'})} className={this.props.className}>
      <canvas ref={this.prevCanvasRef}></canvas>
    </div>;
  }
}