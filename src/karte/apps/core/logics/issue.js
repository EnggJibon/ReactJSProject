
import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

class Issue {

  static register(param) {
    var reqBody = { ...param };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'mold/issue')
        .send(reqBody)
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

  static getIssues(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/issue/getissues')
        .query({ ...param })
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

  static getIssue(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/issue/' + id)
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
  static deleteIssue(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .del(API_BASE_URL + 'mold/issue/' + id)
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

export default Issue;