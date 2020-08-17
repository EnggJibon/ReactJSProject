
import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

export default class system {
  static load(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'cnfsystem')
        .send(param)
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