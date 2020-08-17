import { combineReducers } from 'redux';
import { machineInventoryReducer } from './machine-inventory-reducer';
import { machineReportReducer } from './machine-report-reducer';
import { machineMaintenanceReducer } from './machine-maintenance-reducer';

export const machineReducer = combineReducers(
  {
    machineInventory: machineInventoryReducer,
    machineReport: machineReportReducer,
    machineMaintenance: machineMaintenanceReducer
  }
);
