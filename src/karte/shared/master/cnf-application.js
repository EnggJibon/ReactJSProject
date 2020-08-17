import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class CnfApplication {
  static load(configKey) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'cnfapplication/cnfkey')
        .query({ ...configKey})
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
