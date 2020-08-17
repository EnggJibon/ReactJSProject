import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

class Mold {

  static getMoldDetails(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/diteal?moldId='+params)
        .then(res => {
          if (res.body.error) {            
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
          }
          else {
            res.body.totalProducingTimeHour_CommaSeparated = Mold.formatNumber(res.body.totalProducingTimeHour);
            res.body.totalShotCount_CommaSeparated = Mold.formatNumber(res.body.totalShotCount);
            res.body.afterMainteTotalProducingTimeHour_CommaSeparated = Mold.formatNumber(res.body.afterMainteTotalProducingTimeHour);
            res.body.afterMainteTotalShotCount_CommaSeparated = Mold.formatNumber(res.body.afterMainteTotalShotCount);
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }

  static updateLocation(data){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'mold/changeLocation')
        .send({...data})
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

  static getMoldParts(params){
    return new Promise ( function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/part/rel?moldUuid='+params)
        .then( res => {
          if(res.body.error){
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body);
          }else{
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  static updateMstMold(data){
    var reqBody = { ...data };
    return new Promise(function(resolve,reject){
      jsonAgent
        .put(API_BASE_URL + 'mold/updateImage')
        .send(reqBody)
        .then(res =>{
          if(res.body.error){
            reject(res.body);
          }else{
            resolve(res.body);
          }          
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }
 
  static updateMoldLocationHistory(data){
    var reqBody = [];
    reqBody.push(data);
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'mold/location/history')
        .send(reqBody)
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
  static formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

}

export default Mold;