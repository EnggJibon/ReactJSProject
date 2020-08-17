import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';

export default class Mold {
  static getMold(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold')
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

  
  static getMoldListWithoutDispose(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/moldListWithoutDispose')
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
  static getMoldByUuid(_moldUuid) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/uuid/' + _moldUuid)
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

  static getMoldDetail(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/diteal')
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

  static checkMoldUnderMaintenance(moldId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/detail/'+moldId)
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

  static getMoldLike(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/like')
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

  static getMoldLikeWithoutDispose(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/likeWithoutDispose')
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

  static getMoldEqual(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/equal')
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
  
  static getMoldEqualWithoutDispose(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/equalWithoutDispose')
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
  static getMoldIncludeComponent(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/diteal/component')
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
  static getMoldForComponent(componentId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/component/relation/' + componentId)
        // .query({...param})
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
  static getMoldForComponentWithoutDispose(componentId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/component/relation/withoutdispose/' + componentId)
        // .query({...param})
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