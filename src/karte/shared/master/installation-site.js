import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class InstallationSite {
  static load(_locationCode, _equals) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'installationsite')
        .query({locationCode: _locationCode})
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
  static loadInstllationSite(installationSiteCode) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'installationsite')
        .query({ ...installationSiteCode})
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
  static loadInstllationSiteByLocation(locationId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'installationsite/cliautocomplete')
        .query({ locationId:locationId})
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

  static loadInstallationSiteById(installationSiteId){
    return new Promise(function (resolve, reject) {
      if(installationSiteId === '' || installationSiteId === undefined){
        let res = {
          'installationSiteName': '',
          'id': ''
        };
        resolve(res);
      }
      else{
        jsonAgent
          .get(API_BASE_URL + 'installationsite/getbyid?installationSiteId=' + installationSiteId)
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