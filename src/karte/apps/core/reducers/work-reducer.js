const initialState = {
  workCopyInfo: {},
  nextWorkInfo: {}
};

// Action名の定義
const WORK_COPY_INFO_ADD = 'WORK_COPY_INFO_ADD';
const NEXT_WORK_INFO_ADD = 'NEXT_WORK_INFO_ADD';
const WORK_COPY_INFO_ADD_CLEAR = 'WORK_COPY_INFO_ADD_CLEAR';
const NEXT_WORK_INFO_ADD_CLEAR = 'NEXT_WORK_INFO_ADD_CLEAR';

export function workReducer(state = initialState, action) {
  switch (action.type) {
    case WORK_COPY_INFO_ADD:
      return {
        ...state,
        workCopyInfo: action.value
      };
    case NEXT_WORK_INFO_ADD:
      return {
        ...state,
        nextWorkInfo: action.value
      };
    case WORK_COPY_INFO_ADD_CLEAR:
      return {
        ...state,
        workCopyInfo: {}
      };
    case NEXT_WORK_INFO_ADD_CLEAR:
      return {
        ...state,
        nextWorkInfo: {}
      };
    default:
      return state;
  }
}

// Action Creators
export function clearWorkCopyInfo(value) {
  return {
    type: WORK_COPY_INFO_ADD_CLEAR,
    value
  };
}

export function clearNextWorkInfo(value) {
  return {
    type: NEXT_WORK_INFO_ADD_CLEAR,
    value
  };
}

export function workCopyInfoAdd(value) {
  return {
    type: WORK_COPY_INFO_ADD,
    value
  };
}

export function nextWorkInfoAdd(value) {
  return {
    type: NEXT_WORK_INFO_ADD,
    value
  };
}
