import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class Component {
  static getComponent(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'component')
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
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }
  static getComponentDetail(code){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'component/detail/'+code)
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }
  static getComponentLike(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'component/like')
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
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }
  static getComponentEqual(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'component/equal')
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
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }
  
}