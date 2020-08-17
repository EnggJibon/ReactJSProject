import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class Choice {
  static load(_category) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'choice/getlist')
        .query({category: _category})
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
          // res.body, res.headers, res.status
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });

  }
  static categories(_category,param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'choice/getcategories')
        .query({category: _category,...param})
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
          // res.body, res.headers, res.status
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });

  }

  static GetChoiceTxtBySeq(_category,param,skipZero=true) {
    return new Promise(function (resolve, reject) {
      if (skipZero === true && (param === 0 || param === undefined)) {
        let res = {'type':'mstChoiceList', 'error':false, 'mstChoice':[]};
        resolve(res);
      }
      else {
        jsonAgent
          .get(API_BASE_URL + 'choice')
          .query({category: _category,...param})
          .then(res => {
            if (res.body.error) {
              reject(res.body);
            }
            else {
              resolve(res.body);
            }
            // res.body, res.headers, res.status
          })
          .catch(err => {
            reject({error:true, errorCode:err.status, errorMessage:err.message});
          });
      }
    });
  }
}
