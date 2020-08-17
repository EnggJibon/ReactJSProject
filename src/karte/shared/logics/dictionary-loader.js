import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

class DictionaryLoader {
  constructor() {
    this.cache = new Map();
  }

  requiredField() {
    return ' (*)';
  }
  clearCashe() {
    this.cache.clear();
  }

  // setLang(langId) {
  //   this.langId = langId;
  // }

  getLanguages() {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'language')
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

  getDictionaryBeforeLogin(_langId) {
    var langId = _langId;
    var cache = this.cache;
    return new Promise(function (resolve, reject) {
      var dic = {};
      //request
      jsonAgent
        .get(API_BASE_URL + 'dictionary/getloginwords' + (langId ? '?lang=' + langId : ''))
        .then(res => {
          for (var i = 0; i < res.body.mstDictionary.length; i++) {
            var mstDictionary = res.body.mstDictionary[i];
            dic[mstDictionary.dictKey] = mstDictionary.dictValue;
            if (!cache.has(mstDictionary.dictKey)) {
              cache.set(mstDictionary.dictKey, mstDictionary.dictValue);
            }
          }
          resolve(dic);
          // res.body, res.headers, res.status
        })
        .catch(err => {
          reject({error:true, errorCode:err.status, errorMessage:err.message});
        });
    });
  }

  getDictionary(dict) {
    //要求された文言キーの配列
    const dictKeys = Object.keys(dict);
    var oldDict = {...dict}; //要求された文言オブジェクトのコピー。エラー時使用
    var newDict = {...dict}; //要求された文言オブジェクトのコピー。結果格納用
    //キャッシュにあればキャッシュから取得、なければAPIコールする
    var newDictKeys = []; //キャッシュに見つからない文言キーの配列。APIに渡す
    for (var i = 0; i < dictKeys.length; i++) {
      if (this.cache.has(dictKeys[i])) {
        //キャッシュにあればキャッシュから取得
        newDict[dictKeys[i]] = this.cache.get(dictKeys[i]);
      }
      else {
        //キャッシュになければAPIに渡す配列に追加
        newDictKeys.push(dictKeys[i]);
      }
    }
    var cache = this.cache;
    return new Promise(function (resolve, reject) {
      if (newDictKeys.length <= 0) {
        //APIに渡す文言キーがひとつもないとき。すべてキャッシュにあった場合
        resolve(newDict);
      }
      else {
        jsonAgent
          .post(API_BASE_URL + 'dictionary/getlist')
          .send(newDictKeys)
          .then(res => {
            if (res.body.mstDictionary) {
              for (var i = 0; i < res.body.mstDictionary.length; i++) {
                var mstDictionary = res.body.mstDictionary[i];
                newDict[mstDictionary.dictKey] = mstDictionary.dictValue;
                //キャッシュに追加
                if (!cache.has(mstDictionary.dictKey)) {
                  cache.set(mstDictionary.dictKey, mstDictionary.dictValue);
                }
              }
              resolve(newDict);
            }
            else if (res.body.error) {
              reject(res.body);
            }
            else {
              resolve(oldDict);
            }
            // res.body, res.headers, res.status
          })
          .catch(err => {
            reject({error:true, errorCode:err.status, errorMessage:err.message});
          });
      }
    });
  }
}

export default new DictionaryLoader();