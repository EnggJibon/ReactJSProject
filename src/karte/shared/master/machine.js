import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class Machine {
  static getMachine(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine')
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

  static getMachineWithoutDispose(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/machineListWithoutDispose')
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

  static checkMachineUnderMaintenance(machineid){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/detail/'+machineid)
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
  static getMachineLike(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/like')
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

  static getMachineLikeWithoutDispose(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/likeWithoutDispose')
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

  static getMachineEqual(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/equal')
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

  static getMachineEqualWithoutDispose(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/equalWithoutDispose')
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

  static getMachineByUuid(machineId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(`${API_BASE_URL}machine/getMachine?machineUuid=${machineId}`)
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
