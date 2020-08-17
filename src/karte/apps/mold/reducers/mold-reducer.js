import {combineReducers} from 'redux';
import {moldInventoryReducer} from './mold-inventory-reducer';
import {moldMaintenanceReducer} from './mold-maintenance-reducer';

export const moldReducer = combineReducers(
  {
    moldInventory: moldInventoryReducer,
    moldMaintenance: moldMaintenanceReducer
  });
