import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class MaintenanceCycle {

  static getMaintenanceCycle(_type,cycleCode) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'maintenance/cycle/ptn?type='+_type+'&cycleCode='+cycleCode)
        .then(res => {
          if (res.body.error) {            
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body);
          }
          else {
            res.body.tblMaintenanceCyclePtnList[0].mainteConditionsCol01_CommaSeparated = MaintenanceCycle.formatNumber(res.body.tblMaintenanceCyclePtnList[0].mainteConditionsCol01);
            res.body.tblMaintenanceCyclePtnList[0].mainteConditionsCol02_CommaSeparated = MaintenanceCycle.formatNumber(res.body.tblMaintenanceCyclePtnList[0].mainteConditionsCol02);
            res.body.tblMaintenanceCyclePtnList[0].mainteConditionsCol03_CommaSeparated = MaintenanceCycle.formatNumber(res.body.tblMaintenanceCyclePtnList[0].mainteConditionsCol03);
            resolve(res.body);
          }
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }

  static formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
}
