import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';
//import store, {sendError} from 'karte/shared/logics/store';
//import {sendError} from 'karte/shared/logics/store';
//import {store2} from 'karte/common/App';

class Authorization {

  getAvailableFunctions() {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'authctrl/authorizedfuncs')
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            let availableFunctions = [];
            for (var i = 0; i < res.body.mstAuthCtrlList.length; i++) {
              var authCtrl = res.body.mstAuthCtrlList[i];
              if (authCtrl.available === 1) {
                availableFunctions.push(authCtrl.functionId);
              }
            }
            resolve(availableFunctions);
          }
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }

  dispatchSendError(sendError) {
    this.sendError = sendError;
  }

  hasPermission(functionId) {
    var me = this;
    return new Promise(function (resolve, reject) {
      if (functionId === null || functionId === '') {
        reject();
      }
      jsonAgent
        .get(API_BASE_URL + 'authctrl/checkfunc/' + functionId)
        .then(res => {
          if (res.body.error) {
            reject(res.body);
            me.sendError(res.body);
          }
          else {
            resolve();
          }
        })
        .catch(err => {
          var errObj = {
            error: true,
            errorCode: err.status,
            errorMessage: err.message
          };
          reject(errObj);
          me.sendError(errObj);
        });
    });
  }
}

export default new Authorization();