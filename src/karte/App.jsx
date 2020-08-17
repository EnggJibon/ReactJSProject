import React from 'react';
//import { BrowserRouter } from 'react-router-dom';
//import { createBrowserHistory } from 'history';
import {
  App,
  Panel,
  View,
} from 'framework7-react';

import { Provider } from 'react-redux';
import {commonReducer, sendError} from 'karte/shared/reducers/common-reducer';
import {moldReducer} from 'karte/apps/mold/reducers/mold-reducer';
import {machineReducer} from 'karte/apps/machine/reducers/machine-reducer';
import {coreReducer} from 'karte/apps/core/reducers/core-reducer';
import {combineReducers, createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import routes from 'karte/routes/routes';
import Authorization from 'karte/shared/logics/authorization';
import ErrorBoundary from 'karte/shared/components/ErrorBoundary';
//import {  persistStore } from 'redux-persist';
//import { PersistGate } from 'redux-persist/integration/react';

//export default function (props) {
export default function Karte () {
  const rootReducer = combineReducers({
    common: commonReducer,
    core: coreReducer,
    mold: moldReducer,
    machine: machineReducer
  });

  //ストアの作成。ストアの直接参照は禁止
  const store = createStore(
    //commonReducer,
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), //For Redux Dev Tool
    applyMiddleware(logger));//, initialState);
  //セッションストレージに保存可能にする
  //const persistor = persistStore(store);
  
  //権限判定クラスにエラー送信メソッドをディスパッチ
  Authorization.dispatchSendError((err) => store.dispatch(sendError(err)));
  
  // Framework7 parameters here
  const f7params = {
    id: 'com.kmc-j.m-karte', // App bundle ID
    name: 'M-Karte', // App name
    theme: 'auto', // Automatic theme detection
    // App routes
    routes
  };

  return (
    <Provider store={store}>
      {//<PersistGate loading={null} persistor={persistor}>
      }
      <ErrorBoundary>
        <App params={f7params}>
          <Panel right cover themeDark>
            <View url="/panel-right/" />
          </Panel>
          <View id="main-view" main url="/login" pushState={true} pushStateSeparator="" ></View>
        </App>
      </ErrorBoundary>
      {//</PersistGate>
      }
    </Provider>
  );
}


