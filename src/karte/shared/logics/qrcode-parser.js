// import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

import System from 'karte/shared/master/system';
import Machine from 'karte/shared/master/machine';
import Mold from 'karte/shared/master/mold';
import Component from 'karte/shared/master/component';
import InstllationSite from 'karte/shared/master/installation-site';


export default class QRCodeParser {

  /**
   * QR文字列を解析して金型IDを取得する
   * @param {*} QRString 
   */
  static parseMoldID(QRString) {
    return new Promise(function (resolve, reject) {
      //システム設定取得が成功したら設備IDを切り取ってresolveに渡す
      let config = {
        moldIdStartIdx: 1,
        moldIdSeparater: ','
      };
      System.load(['system.qr_mold_id_start_index', 'system.qr_mold_id_separater']).then((response) => {
        for (let key in response.cnfSystems) {
          let item = response.cnfSystems[key];
          if (item.cnfSystemKey === 'system.qr_mold_id_start_index') {
            config.moldIdStartIdx = parseInt(item.configValue);
          }
          if (item.cnfSystemKey === 'system.qr_mold_id_separater') {
            config.moldIdSeparater = item.configValue;
          }
        }
        let QRStringArray = QRString.split(config.moldIdSeparater);
        let moldId = QRStringArray[config.moldIdStartIdx - 1];
        Mold.getMoldEqual({
          moldId: moldId
        })
          .then((response) => {
            resolve(response);
          })
          .catch(err => {
            reject({ error: true, errorCode: err.status, errorMessage: err.message });
          });
      })
        .catch(err => {
          //システム設定取得に失敗したらエラーコード、エラーメッセージをrejectに渡す
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }
  /**
   * QR文字列を解析して金型IDを取得する
   * @param {*} QRString 
   */
  static parseMoldIDWithoutDispose(QRString) {
    return new Promise(function (resolve, reject) {
      //システム設定取得が成功したら設備IDを切り取ってresolveに渡す
      let config = {
        moldIdStartIdx: 1,
        moldIdSeparater: ','
      };
      System.load(['system.qr_mold_id_start_index', 'system.qr_mold_id_separater']).then((response) => {
        for (let key in response.cnfSystems) {
          let item = response.cnfSystems[key];
          if (item.cnfSystemKey === 'system.qr_mold_id_start_index') {
            config.moldIdStartIdx = parseInt(item.configValue);
          }
          if (item.cnfSystemKey === 'system.qr_mold_id_separater') {
            config.moldIdSeparater = item.configValue;
          }
        }
        let QRStringArray = QRString.split(config.moldIdSeparater);
        let moldId = QRStringArray[config.moldIdStartIdx - 1];
        Mold.getMoldEqualWithoutDispose({
          moldId: moldId
        })
          .then((response) => {
            resolve(response);
          })
          .catch(err => {
            reject({ error: true, errorCode: err.status, errorMessage: err.message });
          });
      })
        .catch(err => {
          //システム設定取得に失敗したらエラーコード、エラーメッセージをrejectに渡す
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }
  /**

  /**
   * QR文字列を解析して設備IDを取得する
   * @param {*} QRString 
   */
  static parseMachineIDWithoutDispose(QRString) {
    return new Promise(function (resolve, reject) {
      //システム設定取得が成功したら設備IDを切り取ってresolveに渡す
      let config = {
        machineIdStartIdx: 1,
        machineIdSeparater: ','
      };
      System.load(['system.qr_machine_id_start_index', 'system.qr_machine_id_separater']).then((response) => {
        for (let key in response.cnfSystems) {
          let item = response.cnfSystems[key];
          if (item.cnfSystemKey === 'system.qr_machine_id_start_index') {
            config.machineIdStartIdx = parseInt(item.configValue);
          }
          if (item.cnfSystemKey === 'system.qr_machine_id_separater') {
            config.machineIdSeparater = item.configValue;
          }
        }
        let QRStringArray = QRString.split(config.machineIdSeparater);
        let machineId = QRStringArray[config.machineIdStartIdx - 1];
        Machine.getMachineEqualWithoutDispose({
          machineId: machineId
        })
          .then((response) => {
            resolve(response);
          })
          .catch(err => {
            reject({ error: true, errorCode: err.status, errorMessage: err.message });
          });
      })
        .catch(err => {
          //システム設定取得に失敗したらエラーコード、エラーメッセージをrejectに渡す
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  /**
   * QR文字列を解析して設備IDを取得する
   * @param {*} QRString 
   */
  static parseMachineID(QRString) {
    return new Promise(function (resolve, reject) {
      //システム設定取得が成功したら設備IDを切り取ってresolveに渡す
      let config = {
        machineIdStartIdx: 1,
        machineIdSeparater: ','
      };
      System.load(['system.qr_machine_id_start_index', 'system.qr_machine_id_separater']).then((response) => {
        for (let key in response.cnfSystems) {
          let item = response.cnfSystems[key];
          if (item.cnfSystemKey === 'system.qr_machine_id_start_index') {
            config.machineIdStartIdx = parseInt(item.configValue);
          }
          if (item.cnfSystemKey === 'system.qr_machine_id_separater') {
            config.machineIdSeparater = item.configValue;
          }
        }
        let QRStringArray = QRString.split(config.machineIdSeparater);
        let machineId = QRStringArray[config.machineIdStartIdx - 1];
        Machine.getMachineEqual({
          machineId: machineId
        })
          .then((response) => {
            resolve(response);
          })
          .catch(err => {
            reject({ error: true, errorCode: err.status, errorMessage: err.message });
          });
      })
        .catch(err => {
          //システム設定取得に失敗したらエラーコード、エラーメッセージをrejectに渡す
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  /**
   * QR文字列を解析して部品IDを取得する
   * @param {*} QRString 
   */
  static parseComponentCode(QRString) {
    return new Promise(function (resolve, reject) {
      Component.getComponentEqual({
        componentCode: QRString
      })
        .then((response) => {
          resolve(response);
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }
  /**
   * QR文字列を解析して発注番号を取得する
   * @param {*} QRString 
   */
  static parsePoqr(QRString, poqrSeq) {
    return new Promise(function (resolve) {
      function doReadDiQr(QRString, poqrSeq) {
        if (typeof poqrSeq !== 'number') return 'is not number';
        switch (poqrSeq) {
          case 1:
            return splitDiQrTextByTab(QRString);
          case 2:
            return splitDiQrTextByWellNumber(QRString);
          default:
            return 'other way';
        }
      }
      function splitDiQrTextByTab(QRString) {
        let QRStringArray = QRString.split(/\t/g);
        if (QRStringArray.length < 10) return 'data is not found';
        let QRObject = {
          componentCode: QRStringArray[0].trim(),
          orderNumber: QRStringArray[8].substr(0, 10).trim(),
          itemNumber: QRStringArray[8].substr(QRStringArray[8].length - 5, 5).trim(),
          orderQuantity: QRStringArray[9].trim(),
        };
        return QRObject;
      }
      function splitDiQrTextByWellNumber(QRString) {
        let QRStringArray = QRString.split('#');
        if (QRStringArray.length < 10) return 'data is not found';
        let QRObject = {
          componentCode: QRStringArray[3].trim(),
          orderNumber: QRStringArray[4].trim(),
          itemNumber: QRStringArray[5].trim(),
          orderQuantity: QRStringArray[9].trim(),
        };
        return QRObject;
      }
      let response = doReadDiQr(QRString, poqrSeq);
      resolve(response);
    });
  }

  static parseInstllationSiteId(QRString) {
    return new Promise(function (resolve, reject) {
      InstllationSite.loadInstllationSite({
        installationSiteCode: QRString
      })
        .then((response) => {
          resolve(response);
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }



  
}