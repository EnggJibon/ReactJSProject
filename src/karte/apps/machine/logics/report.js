import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

// 機械日報
class Report {
  /**
   *
   * @param param
   * @returns {Promise<any>}
   */
  static getMachineList(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine')
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

  /**
   *
   * @param param
   * @returns {Promise<any>}
   */
  static getSearchTime(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/dailyreport2')
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

  static getSearchTimeCollect(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/dailyreport2/collect')
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

  /**
   *
   * @param param
   * @returns {Promise<any>}
   */
  static getCollectTime(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/dailyreport2/collect')
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

  /**
   *
   * @param param
   * @returns {Promise<any>}
   */
  static checkprevdays(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/dailyreport2/checkprevdays')
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

  /**
   * 停止理由取得用
   * @param {*} param 
   */
  static downtime(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/downtime')
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

  /**
   * 
   * @param {*} param 
   */
  static updateDailyReport(param) {
    var reqBody = { ...param };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'machine/dailyreport2')
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

  /**
   * 
   * @param {*} id 
   */
  static deletedowntimeById(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .del(API_BASE_URL + 'machine/dailyreport2/deletedowntime/' + id)
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

export default Report;