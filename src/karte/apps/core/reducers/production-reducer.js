const initialState = {
  cond: [],
};

// Action名の定義
const PRODUCTION_ADD_COND = 'PRODUCTION_ADD_COND';
const PRODUCTION_CLEAR_COND = 'PRODUCTION_CLEAR_COND';
const PRODUCTION_UPDATE_DETAILS = 'PRODUCTION_UPDATE_DETAILS';

export function productionReducer(state = initialState, action) {
  switch (action.type) {
    case PRODUCTION_ADD_COND:
      return {
        ...state,
        cond: { ...action.value }
      };
    case PRODUCTION_UPDATE_DETAILS:
      return {
        ...state,
        cond: { ...action.value }
      };
    case PRODUCTION_CLEAR_COND:
      return {
        ...state,
        cond: {}
      };
    default:
      return state;
  }
}

// Action Creators
export function updateProductionDetails(value) {
  // Action
  return {
    type: PRODUCTION_UPDATE_DETAILS,
    value
  };
}

// Action Creators
export function addCondition(value) {
  // Action
  return {
    type: PRODUCTION_ADD_COND,
    value
  };
}

export function clearCondition(value) {
  return {
    type: PRODUCTION_CLEAR_COND,
    value
  };
}
