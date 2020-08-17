import Cookies from 'universal-cookie';
import {jsonAgent, API_BASE_URL} from 'karte/shared/logics/api-agent';

export default class Authentication {
  static login(_userId, _password, _lang) {
    return new Promise(function (resolve, reject) {
      if (!_userId || !_password) {
        reject({error:true, errorCode:'E201', errorMessage: 'Both user id and password are required.'});
      }
      var reqBody = {
        userid: _userId,
        password: _password
      };
      var url = API_BASE_URL + 'authentication/login';
      if (_lang && _lang.length > 0) {
        url = url + '?lang=' + _lang;
      }
      jsonAgent
        .post(url)
        .send(reqBody)
        .then(res => {
          if (!res.body.error && res.body.token) {
            const cookies = new Cookies();
            cookies.set('APITOKEN', res.body.token, {path: '/'});
            jsonAgent.set('APITOKEN', res.body.token);
            //レスポンスの言語で上書き
            var lang = res.body.langId;            
            //言語をCookieに保存
            if (lang && lang.length > 0) {
              var expireDate = new Date();
              expireDate.setFullYear(expireDate.getFullYear() + 1); //1年保存
              cookies.set('LANG', lang, {path: '/', expires: expireDate});
            }
          }
          resolve(res.body);
        })
        .catch(err => {
          reject({error: true, errorCode: err.status, errorMessage: err.message});
        });
    });
  }

  static isLoggedIn() {
    const cookies = new Cookies();
    const token = cookies.get('APITOKEN');
    return token ? true : false;
  }

  static getToken() {
    const cookies = new Cookies();
    const token = cookies.get('APITOKEN');
    return token;
  }

  static whoAmI() {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .get(API_BASE_URL + 'authentication/whoami')
        .then(res => {
          if (res.body.error) {
            reject(res.body);
          }
          else {
            let who = {
              userUuid: '',
              userId: '',
              authId: '',
              langId: '',
              department: '0',
              companyId: ''
            };
            resolve(Object.assign(who, res.body));
          }
        })
        .catch(err => {
          reject({error: true, errorCode: err.status, errorMessage: err.message});
        });
    });
  }

  static resetPassword(userId) {
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'user/pwdselfreset/' + userId)
        .then((res) => {
          resolve(res.body);
        })
        .catch(err => {
          reject({error: true, errorCode: err.status, errorMessage: err.message});
        });
    });
  }

  static changePassword(_userId, _password, _newPassword) {
    var reqBody = {
      userid: _userId,
      password: _password,
      newPassword: _newPassword
    };
    return new Promise(function (resolve, reject) {
      jsonAgent
        .post(API_BASE_URL + 'authentication/changepwd')
        .send(reqBody)
        .then((res) => {
          if (!res.body.error && res.body.token) {
            const cookies = new Cookies();
            cookies.set('APITOKEN', res.body.token, {path: '/'});
            jsonAgent.set('APITOKEN', res.body.token);
          }
          resolve(res.body);
        })
        .catch(err => {
          reject({error: true, errorCode: err.status, errorMessage: err.message});
        });
    });
  }

  static logOff() {
    return new Promise(function (resolve, reject) {
      var doLogOff = () => {
        const cookies = new Cookies();
        cookies.remove('APITOKEN');
      };
      jsonAgent
        .post(API_BASE_URL + 'authentication/logoff')
        .then((res) => {
          doLogOff();
          resolve(res);
        })
        .catch((err) => {
          doLogOff();
          reject({error: true, errorCode: err.status, errorMessage: err.message});
        });
    });
  }
}