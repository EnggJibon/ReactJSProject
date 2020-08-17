import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class MoldId {
 
  static CheckIssues(_moldIdCode) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/issue')
        .query({moldId: _moldIdCode})
        .query({noMoldMainte: 1}) //メンテナンス未実施の不具合
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
        .post(API_BASE_URL + 'mold/maintenance/remodeling/startmainte')
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
        .post(API_BASE_URL + 'mold/maintenance/startdetailes')
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
        .get(API_BASE_URL + 'mold/maintenance/remodeling')
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
        .get(API_BASE_URL + 'mold/maintenance/remodeling/detail/'+params)
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

  static submitMaintenanceEnd(params, tblMoldlMaintenanceDetailPRVos ) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'mold/maintenance/detailes')
        .send({...params, tblMoldlMaintenanceDetailPRVos})
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
        .put(API_BASE_URL + 'mold/maintenance/startcancel/'+params)
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
        .get(API_BASE_URL + 'mold/maintenance/recomend')
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

  static getReplaceRepairMoldPartList(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'mold/part/rel?maintenanceId=' + id)
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
  
  static moldMaintenanceGetApi(ulr){
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
    return this.moldMaintenanceGetApi('mold/inspection/item?'+params);
  }

  static getInspectionChoice(id) {
    return this.moldMaintenanceGetApi('mold/inspection/choice?inspectionItemId='+id);
  }

  static getOrderPointList(maintId) {
    return this.moldMaintenanceGetApi('moldpartstock/orderrequired?maintid='+maintId);
  }
}
