
import { jsonAgent, API_BASE_URL } from 'karte/shared/logics/api-agent';
// 作業登録
class Work {

  
  static register(param) {
    var reqBody = { ...param };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'work')
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
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }

  static update(param) {
    var reqBody = { ...param };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .put(API_BASE_URL + 'work')
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
          reject({ error: true, errorCode: err.status, errorMessage: err.message });
        });
    });
  }
  // MACHINE作業中CHECK
  static workMachineConflictCheck(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'work/conflictcheck')
        .query({ ...param })
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
  // MOLD作業中CHECK
  static workMoldConflictCheck(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'work/mold/conflictcheck')
        .query({ ...param })
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

  // 次作業工程の確認
  static getNextWorkPhaseList(phaseId,param) {
    var reqBody = { ...param };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'work/phase/next/'+ phaseId)
        .query(reqBody)
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

  //標準業務時間を取得
  static getStandardWorkTime(param) {
    var reqBody = { ...param };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'standard/worktime/byuser')
        .query(reqBody)
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

  // 作業開始情報を取得
  // Dim url As String = loginInfo.settings.apiUrl & "work/search/workingDate?workingDate=" & searchDate.ToString("yyyy'/'MM'/'dd")
  static searchWorkInfo(param) {
    var reqBody = { ...param };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'work/search/workingDate')
        .query(reqBody)
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

  // Dim url As String = loginInfo.settings.apiUrl & "work/phase?langId=" & If(loginInfo.langId, "ja")
  static getWorkPhase(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'work/phase')
        .query({ ...param })
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


  static getWork(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'work/' + id)
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

  static deleteWorkById(id) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .del(API_BASE_URL + 'work/' + id)
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

  static getWorkList(param) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'work')
        .query({ ...param })
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

export default Work;