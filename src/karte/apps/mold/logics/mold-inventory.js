import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

class MoldInventory {

  searchMoldInventory(searchConditions) {
    var reqBody = {
      searchConditions: [...searchConditions]
    };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'mold/stocktake/search')
        .send(reqBody)
        .then((res) => {
          if (!res.body.error) {
            resolve(res.body);
          }
          else {
            reject(res.body);
          }
        })
        .catch((err) => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }

}

export default MoldInventory;