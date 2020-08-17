import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

class Machine {

  static getMachineDetails(params) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'machine/detail/'+params)
        .then(res => {
          if (res.body.error) {            
            res.body.errorCode === 'E201' ? resolve(res.body) : reject(res.body); 
          }
          else {
            res.body.totalProducingTimeHour_CommaSeparated = Machine.formatNumber(res.body.totalProducingTimeHour);
            res.body.totalShotCount_CommaSeparated = Machine.formatNumber(res.body.totalShotCount);
            res.body.afterMainteTotalProducingTimeHour_CommaSeparated = Machine.formatNumber(res.body.afterMainteTotalProducingTimeHour);
            res.body.afterMainteTotalShotCount_CommaSeparated = Machine.formatNumber(res.body.afterMainteTotalShotCount);
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

export default Machine;