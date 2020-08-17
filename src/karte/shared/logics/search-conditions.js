//import { UnexpectedError } from 'karte/shared/logics/errors';
import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

class SearchConditions {

  getSavedSearchConditions(screenId){

    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'cond/search?screenId=' + screenId)
        .then(res => {
          let availableSearchConditions = [];
          for (var i = 0; i < res.body.tblSearchCondMemoryValues.length; i++) {
            var searchCond = res.body.tblSearchCondMemoryValues[i];
            if (searchCond !== '') {
              availableSearchConditions.push(searchCond);
            }
          }
          //this.setState({ searchCondList: availableSearchConditions });
          resolve(availableSearchConditions);
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });

  }

  saveSearchConditions(screenId,searchConditions){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'cond/search/' + screenId)
        .send(searchConditions)
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

  replaceSearchConditions(screenId, searchConditions){
    return new Promise(function(resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'cond/search/replace/' + screenId)
        .send(searchConditions)
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            resolve(res.body);
          }
        });
    });
  }
  
  deleteSearchConditions(screenId){
    return new Promise(function (resolve, reject) {
      jsonAgent
        .delete(API_BASE_URL + 'cond/search/' + screenId)
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
export default new SearchConditions();