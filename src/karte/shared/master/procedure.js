
import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

export default class procedure {
  static getProcedureForComponent(componentId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'procedure/list/' + componentId)
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
  static getProductionLotList(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'production/lot/list')
        .query({...param})
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