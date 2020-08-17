//import { createStore, applyMiddleware } from 'redux';
//import logger from 'redux-logger';
//import { persistReducer, persistStore } from 'redux-persist';
//import { persistReducer } from 'redux-persist';
//import sessionStorage from 'redux-persist/es/storage/session';

// const persistConfig = {
//   key: 'karte',
//   storage: sessionStorage
// };

const initialState = {
  //エラー情報。セッションエラーをUnauthorizedErrorPageに通知するため
  error: {
    error: false,
    errorCode: '',
    errorMessage: '',
  },
  //ログインユーザー情報。ページ再読み込みにより消えてしまったときはwhoAmIで取得しなおす
  loginUser: {
    // isLogin: false,
    userId: '',
    token: '',
    // langId: '',
    // department: ''
  },
  DummyState: 'Still Alive?'
};

// Action名の定義
const ERROR = 'ERROR';
const LOGIN_USER = 'LOGIN_USER';


export function commonReducer(state = initialState, action) {
//function commonReducer(state = initialState, action) {
  switch (action.type) {
    case ERROR:
      return {...state,
        error: {...state.error, ...action.value}
      };
    case LOGIN_USER:
      return {...state,
        loginUser: {...state.loginUser, ...action.value}
      };
    default:
      return state;
  }
}

// 永続化設定されたReducerとして定義
//export const commonReducer = persistReducer(persistConfig, _commonReducer);

// Action Creators
export function sendError(value) {
  // Action
  return {
    type: ERROR,
    value
  };
}

export function sendLoginUser(value) {
  // Action
  return {
    type: LOGIN_USER,
    value
  };
}

// const store = createStore(
//   commonReducer,
//   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), //For Redux Dev Tool
//   applyMiddleware(logger));//, initialState);
// export default store;