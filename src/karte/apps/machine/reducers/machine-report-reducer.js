const initialState = {
  reportInfo: [],
};

// Action名の定義
const MACHINE_REPORT_CLEAR_REPORT_INFO = 'MACHINE_REPORT_CLEAR_REPORT_INFO';
const MACHINE_REPORT_UPDATE_REPORT_INFO = 'MACHINE_REPORT_UPDATE_REPORT_INFO';

export function machineReportReducer(state = initialState, action) {
  switch (action.type) {
    case MACHINE_REPORT_CLEAR_REPORT_INFO:
      return {
        ...state,
        reportInfo: { }
      };
    case MACHINE_REPORT_UPDATE_REPORT_INFO:
      return {
        ...state,
        reportInfo: { ...action.value}
      };
    default:
      return state;
  }
}

// Action Creators
export function updateMachineReportInfo(value) {
  // Action
  return {
    type: MACHINE_REPORT_UPDATE_REPORT_INFO,
    value
  };
}

export function clearMachineReport(value) {
  return {
    type: MACHINE_REPORT_CLEAR_REPORT_INFO,
    value
  };
}
