import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class Material {
  /**
   * 材料获取 LIKE
   * @param {*} param 
   */
  static getMaterial(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'material')
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

  /**
   * 材料获取
   * @param {*} param 
   */
  static getMaterialFForComponent(param){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'component/material/list')
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

  /**
   * 材料ロット番号
   * @param {*} materialId 
   */
  static getMaterialLot(materialId){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'material/lot/mobile/'+ materialId)
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
}