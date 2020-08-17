const initialState = {
  moldInfo: '',
  moldPartReplaceRepair: '',
};

// Action名の定義
const MOLD_MAINTENANCE_MOLDINFO_ADD = 'MOLD_MAINTENANCE_MOLDINFO_ADD';
const MOLD_MAINTENANCE_MOLDINFO_CLEAR = 'MOLD_MAINTENANCE_MOLDINFO_CLEAR';
const MOLD_MAINTENANCE_INPUT_ADD = 'MOLD_MAINTENANCE_INPUT_ADD';
const MOLD_MAINTENANCE_INPUT_CLEAR = 'MOLD_MAINTENANCE_INPUT_CLEAR';
const MOLD_MAINTENANCE_SENDISSUELIST = 'MOLD_MAINTENANCE_SENDISSUELIST';
const MOLD_PART_REPLACE_REPAIR = 'MOLD_PART_REPLACE_REPAIR';

export function moldMaintenanceReducer(state = initialState, action) {
  switch (action.type) {
    case MOLD_MAINTENANCE_MOLDINFO_ADD:
      return {
        ...state,
        defaultValObject: {},
        issueList:{},
        moldInfo: action.value
      };
    case MOLD_MAINTENANCE_MOLDINFO_CLEAR:
      return {
        ...state,
        moldInfo: {}
      };
    case MOLD_MAINTENANCE_INPUT_ADD:
      return {
        ...state,
        defaultValObject: action.value
      };
    case MOLD_PART_REPLACE_REPAIR:
      return {
        ...state,
        moldPartReplaceRepair: action.value
      };
    case MOLD_MAINTENANCE_INPUT_CLEAR:
      return {
        ...state,
        defaultValObject: {}
      };
    case MOLD_MAINTENANCE_SENDISSUELIST:
      return {
        ...state,
        issueList: action.value
      };
    default:
      return state;
  }
}

// Action Creators
export function sendMoldInfo(value) {
  // Action
  return {
    type: MOLD_MAINTENANCE_MOLDINFO_ADD,
    value
  };
}


export function sendMoldIssueList(value) {
  return {
    type: MOLD_MAINTENANCE_SENDISSUELIST,
    value
  };
}



export function clearMoldId(value) {
  return {
    type: MOLD_MAINTENANCE_MOLDINFO_CLEAR,
    value
  };
}

export function mainteInputAdd(value) {
  return {
    type: MOLD_MAINTENANCE_INPUT_ADD,
    value
  };
}
export function mainteInputClear(value) {
  return {
    type: MOLD_MAINTENANCE_INPUT_CLEAR,
    value
  };
}

export function moldPartReplaceRepairInput(value) {
  return {
    type: MOLD_PART_REPLACE_REPAIR,
    value
  };
}