import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class Company {
  static load() {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'company')
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

  static loadCompanyById(companyId){
    return new Promise(function (resolve, reject) {
      if(companyId === '' || companyId === undefined){
        let res = {
          'companyName':'',
          'id':''
        };
        resolve(res);
      }
      else {
        jsonAgent
          .get(API_BASE_URL + 'company/getbyid?companyId=' + companyId)
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
      }
    });
  }

}