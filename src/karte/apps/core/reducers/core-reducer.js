import { combineReducers } from 'redux';
import { productionReducer } from './production-reducer';
import { workReducer } from './work-reducer';

export const coreReducer = combineReducers(
  {
    production: productionReducer,
    work: workReducer,
  });
