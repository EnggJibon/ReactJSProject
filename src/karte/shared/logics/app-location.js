export const APP_URL = window.location;
export const APP_HOST = window.location.host;
export const APP_HOSTNAME = window.location.hostname;
export const APP_DIR_NAME = 'sp-karte';
export const APP_DIR_PATH = APP_URL.toString().indexOf(APP_DIR_NAME) >= 0 ?
  APP_URL.toString().substring(APP_URL.toString().indexOf(APP_HOST) + APP_HOST.length, APP_URL.toString().indexOf(APP_DIR_NAME)) + APP_DIR_NAME
  : '';
export const APP_HOST_DIR = APP_DIR_PATH.toString().replace(APP_DIR_NAME, '').replace(/\//g, '');
//export const API_BASE_URL = window.location.protocol + '//' + APP_HOSTNAME + 
//  (APP_HOST_DIR ? '/' + APP_HOST_DIR : '') + '/ws/karte/api/';
//APP_DIR_PATH.toString().substring(APP_DIR_PATH.toString().indexOf(APP_DIR_NAME)) + 'ws/karte/api/';
