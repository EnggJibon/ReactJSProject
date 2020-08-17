
import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

class Production {

  static getProductions(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'production/header/list')
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

  static getProductiondefect(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'productiondefect')
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

  static postProductiondefect(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'productiondefect')
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


  static getProductionDetail(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'production/detail/' + id)
        // .query({ ...param })
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

  static conflictcheck(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'production/conflictcheck')
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

  // MOLD生産中CHECK
  static moldConflictCheck(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'production/mold/conflictcheck')
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

  static post(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'production')
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

  static end(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'production/end')
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

  static delete(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .del(API_BASE_URL + 'production/' + id)
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
  static productioncomponentcheck(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'production/productioncomponentcheck')
        .send(param)
        .then(res => {
          resolve(res.body);
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }
}

export default Production;
