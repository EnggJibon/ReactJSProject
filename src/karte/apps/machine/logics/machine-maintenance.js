import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class MachineId {
  // TODO
  static CheckIssues(_machineIdCode) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/issue')
        .query({machineId: _machineIdCode})
        .query({nomachineMainte: 1}) //メンテナンス未実施の不具合
        .then(res => {
          if (res.body.error) {
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
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

  static getMaintenanceId(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'machine/maintenance/remodeling/startmainte')
        .send({...params})
        .then(res => {
          if (res.body.error) {
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
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

  static submitMaintenance(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'machine/maintenance/startdetailes')
        .send({...params})
        .then(res => {
          if (res.body.error) {
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
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

  static endMaintenances(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/maintenance/remodeling')
        .query(params)
        .then(res => {
          if (res.body.error) {
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
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

  static getInitTabData(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/maintenance/remodeling/detail/'+params)
        .then(res => {
          if (res.body.error) {            
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
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

  static submitMaintenanceEnd(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'machine/maintenance/detailes')
        .send({...params})
        .then(res => {
          if (res.body.error) {
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body);  
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

  static cancleMaintenance(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .put(API_BASE_URL + 'machine/maintenance/startcancel/'+params)
        .then(res => {
          if (res.body.error) {            
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body);            
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

  static getRecomendList() {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/maintenance/recomend')
        .then(res => {
          if (res.body.error) {            
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
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
  static machineMaintenanceGetApi(ulr){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + ulr)
        .then(res => {
          if (res.body.error && res.body.errorCode !== 'E201') {
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

  static getItems(params) {
    return this.machineMaintenanceGetApi('machine/inspection/item?'+params);
  }

  static getInspectionChoice(id) {
    return this.machineMaintenanceGetApi('machine/inspection/choice?inspectionItemId='+id);
  }
}
