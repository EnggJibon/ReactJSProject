import {API_BASE_URL, createPlaneAgent} from 'karte/shared/logics/api-agent';
import EXIF from 'exif-js';

export default class FileUtil {
  /** 画像データのblobをファイルとしてアップロードする。*/
  static uploadBlob(blob, fileType, functionId, fileName) {
    return new Promise((resolve, reject) => {
      createPlaneAgent()
        .post(API_BASE_URL + 'files/upload')
        .field('fileType', fileType)
        .field('functionId', functionId)
        .attach('upfile', blob, fileName)
        .then(res => {
          if(res.body.error) {
            reject(res.body);
          } else {
            resolve(res);
          }
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }

  static uploadsBlob(blobs, fileType, functionId) {
    return new Promise((resolve, reject) => {
      createPlaneAgent()
        .post(API_BASE_URL + 'files/uploads')
        .field('fileType', fileType)
        .field('functionId', functionId)
        .field('upfile',blobs)
        .then(res => {
          if(res.body.error) {
            reject(res.body);
          } else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }

  static download(url) {
    return new Promise((resolve, reject) => {
      createPlaneAgent()
        .get(url)
        .responseType('blob')
        .then(res => {
          if(res.body.error) {
            reject(res.body);
          } else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }
  static imgLoad(imgUrl) {
    return new Promise((resolve, reject) => {
      this.download(imgUrl).then((response) => {
        var blob = response;
        let oFileReader = new FileReader();
        oFileReader.onloadend = function (e) {
          let base64 = e.target.result;
          resolve({ src: base64, blob: blob });
        };
        oFileReader.readAsDataURL(blob);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  /**
   * 画像を等比縮小する。
   * @param {*} src ImageElement.srcに指定可能なURL
   * @param {*} width 縮小対象幅
   * @param {*} height 縮小対象高さ
   */
  static shrinkImg(src, width, height) {
    return new Promise((resolve)=>{
      const img = new Image();
      img.src = src;
      img.onload = ()=>{
        FileUtil.getTransMatrix(img, width, height).then(trans=>{
          const mat = trans.matrix;
          const canvas = document.createElement('canvas');
          canvas.setAttribute('width', trans.width);
          canvas.setAttribute('height', trans.height);
          const ctx = canvas.getContext('2d');
          ctx.transform(mat[0][0], mat[1][0], mat[0][1], mat[1][1], mat[0][2], mat[1][2]);
          ctx.drawImage(img, 0, 0, img.width, img.height);
          canvas.toBlob(blob => {
            const shrinked = {
              imgData: ctx.getImageData(0, 0, trans.width, trans.height),
              blob: blob,
              dataUrl: canvas.toDataURL()
            };
            resolve(shrinked);
          }, 'image/jpeg');
        });
      };
    });
  }

  /**imgのEXIF情報に基づいて向きとサイズを補正するための変換行列を取得する。 */
  static getTransMatrix(img, width, height) {
    return new Promise(resolve=>{
      EXIF.getData(img, function() {
        const orient = EXIF.getTag(this, 'Orientation');
        /** 画像を水平反転するかのフラグ */
        const isTurnH = orient ? (orient - 1) & 1 : 0;
        /** 画像を垂直反転するかのフラグ */
        const isTurnV = orient ? (orient - 1) & 2 : 0;
        /** 画像を対角反転するかのフラグ */
        const isTurnD = orient ? (orient - 1) & 4 : 0;
        let mat = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        if(isTurnD) {
          let matd = [[0, 1, 0], [1, 0, 0], [0, 0, 1]];
          mat = FileUtil.matMul(matd, mat);
        }
        if(isTurnH) {
          let math = [[-1, 0, isTurnD ? img.height : img.width], [0, 1, 0], [0, 0, 1]];
          mat = FileUtil.matMul(math, mat);
        }
        if(isTurnV) {
          let matv = [[1, 0, 0], [0, -1, isTurnD ? img.width : img.height], [0, 0, 1]];
          mat = FileUtil.matMul(matv, mat);
        }
        const ratio = Math.min(width / img.width, height / img.height);
        let mats = [[ratio, 0, 0], [0, ratio, 0], [0, 0, 1]];
        mat = FileUtil.matMul(mats, mat);
        let newWidth = isTurnD ? (img.height * ratio) : (img.width * ratio);
        let newHeight = isTurnD ? (img.width * ratio) : (img.height * ratio);
        resolve({matrix: mat, width: newWidth, height: newHeight});
      });
    });
  }

  /** 3×3の行列の積算 */
  static matMul(m1, m2) {
    let ret = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for(let i = 0; i < 3; i++) {
      for(let j = 0; j < 3; j++) {
        ret[i][j] = FileUtil.vecMul(m1[i], [m2[0][j], m2[1][j], m2[2][j]]);
      }
    }
    return ret;
  }

  /** 同じ長さのベクトルの内積 */
  static vecMul(v1, v2) {
    let ret = 0;
    for(let i = 0; i < v1.length; i++) {
      ret += (v1[i] * v2[i]);
    }
    return ret;
  }
}