
import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

export default class po {
  static poqrLoad() {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'poqr/load')
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  /**
   * Load existing PO from unique keys - deliveryDestId, orderNumber, itemNumber
   * @param {*} param 
   */
  static loadPo(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'po/load')
        .query({ ...param })
        .then(res => {
          if (res.status === 204) resolve(null);
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  static shipmentLotnumber(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'po/shipment/lotnumber')
        .query({ ...param })
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  static shipmentLotnumberEqual(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'po/shipment/lotnumber/equal')
        .query({ ...param })
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  static shipment(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'po/shipment')
        .send({ ...param })
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  static stockQuantity(componentId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'po/shipment/stock/'+componentId)
        // .query({ ...param })
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }
}