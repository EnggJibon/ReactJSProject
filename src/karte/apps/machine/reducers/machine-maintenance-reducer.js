const initialState = {
  machineInfo: '',
};

// Action名の定義
const MACHINE_MAINTENANCE_MACHINEINFO_ADD = 'MACHINE_MAINTENANCE_MACHINEINFO_ADD';
const MACHINE_MAINTENANCE_MACHINEINFO_CLEAR = 'MACHINE_MAINTENANCE_MACHINEINFO_CLEAR';
const MACHINE_MAINTENANCE_INPUT_ADD = 'MACHINE_MAINTENANCE_INPUT_ADD';
const MACHINE_MAINTENANCE_INPUT_CLEAR = 'MACHINE_MAINTENANCE_INPUT_CLEAR';
const MACHINE_MAINTENANCE_SENDISSUELIST = 'MACHINE_MAINTENANCE_SENDISSUELIST';

export function machineMaintenanceReducer(state = initialState, action) {
  switch (action.type) {
    case MACHINE_MAINTENANCE_MACHINEINFO_ADD:
      return {
        ...state,
        defaultValObject: {},
        issueList:{},
        machineInfo: action.value
      };
    case MACHINE_MAINTENANCE_MACHINEINFO_CLEAR:
      return {
        ...state,
        machineInfo: {}
      };
    case MACHINE_MAINTENANCE_INPUT_ADD:
      return {
        ...state,
        defaultValObject: action.value
      };
    case MACHINE_MAINTENANCE_INPUT_CLEAR:
      return {
        ...state,
        defaultValObject: {}
      };
    case MACHINE_MAINTENANCE_SENDISSUELIST:
      return {
        ...state,
        issueList: action.value
      };
    default:
      return state;
  }
}

// Action Creators
export function sendMachineInfo(value) {
  // Action
  return {
    type: MACHINE_MAINTENANCE_MACHINEINFO_ADD,
    value
  };
}


export function sendMachineIssueList(value) {
  return {
    type: MACHINE_MAINTENANCE_SENDISSUELIST,
    value
  };
}



export function clearMachineId(value) {
  return {
    type: MACHINE_MAINTENANCE_MACHINEINFO_CLEAR,
    value
  };
}

export function mainteInputAddMachine(value) {
  return {
    type: MACHINE_MAINTENANCE_INPUT_ADD,
    value
  };
}
export function mainteInputClear(value) {
  return {
    type: MACHINE_MAINTENANCE_INPUT_CLEAR,
    value
  };
}
