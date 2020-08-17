import request from 'superagent';
import {APP_HOSTNAME, APP_HOST_DIR} from 'karte/shared/logics/app-location';
import Cookies from 'universal-cookie';

export const API_BASE_URL = window.location.protocol + '//' + APP_HOSTNAME + 
  (APP_HOST_DIR ? '/' + APP_HOST_DIR : '') + '/ws/karte/api/';
export const PHP_BASE_URL = window.location.protocol + '//' + APP_HOSTNAME + 
(APP_HOST_DIR ? '/' + APP_HOST_DIR : '') + '/karte/php/';

//キャッシュ防止のためgetメソッドのオーバーライド
const _jsonAgent = request.agent();
var oldGet = _jsonAgent.get;
_jsonAgent.get = function() {
  var result = oldGet.apply(this, arguments);
  return result.query({_: Date.now()}); //常にクエリパラメーターに現在時刻を加える
};

//すでにログイン済みならAPI AgentにTOKENをセット(リフレッシュすると消えてしまうため)
const cookies = new Cookies();
const token = cookies.get('APITOKEN');
if (token) {
  _jsonAgent.set('APITOKEN', token);
}

/**
 * JsonをpostするためのAgent。getに対するキャッシュ除けパラメータ、APITOKEN、ContentType:jsonの付与を行っています。
 */
export const jsonAgent = _jsonAgent.set('Content-Type', 'application/json; charset=UTF-8');

/**
 * ファイルアップロード等、Json以外のものをpostするためのAgent。APITOKENの付与のみを施しています。
 */
export function createPlaneAgent() {
  const pa = request.agent();
  const cookies = new Cookies();
  const token = cookies.get('APITOKEN');
  if (token) {
    pa.set('APITOKEN', token);
  }
  return pa;
}
