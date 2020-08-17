
import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

export default class Direction {
  static equal(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'direction/equal')
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

  static like(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'direction/like')
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

  static getDataByDirectionId(directionId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'direction/' + directionId)
        .then((res) => {
          if (!res.body.error) {
            resolve(res.body);
          }
          else {
            reject(res.body);
          }
        })
        .catch((err) => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }
}