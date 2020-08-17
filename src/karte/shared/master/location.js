import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class Location {
  static load(_companyCode, _equals) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'location')
        .query({companyCode: _companyCode})
        .query({isEquals: _equals})
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
  static loadLocationByCompanyId(companyId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'installationsite/cliautocomplete')
        .query({ companyId:companyId})
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

  static loadLocationById(locationId){
    return new Promise(function (resolve, reject) {
      if(locationId === '' || locationId === undefined){
        let res = {
          'locationName': '',
          'id': ''
        };
        resolve(res);
      }
      else {
        jsonAgent
          .get(API_BASE_URL + 'location/getbyid?locationId=' + locationId)
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