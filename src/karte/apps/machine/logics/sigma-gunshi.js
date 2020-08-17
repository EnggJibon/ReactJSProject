import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';
class SigmaGunshi{
  static loadShotCountFromLog(param){
    return new Promise(function(resolve, reject){
      jsonAgent
        .get(API_BASE_URL + 'machine/history/shotcount')
        .query({ machineId:param.machineId})
        .query({ startDateTime:param.startDateTime})
        .query({ endDateTime:param.endDateTime })
        .then((res) => {
          if (!res.body.error) {
            resolve(res.body);
          }
          else {
            reject(res.body);
          }
        })
        .catch((err) => {
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }


}
export default SigmaGunshi;