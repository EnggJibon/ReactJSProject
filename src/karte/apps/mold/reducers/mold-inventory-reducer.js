const initialState = {
  searchCond:[],
  //continueSearch: false //続けて検索が指示されたかどうか
  autoSearch: false
};

// Action名の定義
const MOLD_INVENTORY_ADD_SEARCH_COND = 'MOLD_INVENTORY_ADD_SEARCH_COND';
const MOLD_INVENTORY_DELETE_LAST_SEARCH_COND = 'MOLD_INVENTORY_DELETE_LAST_SEARCH_COND';
const MOLD_INVENTORY_CLEAR_SEARCH_COND = 'MOLD_INVENTORY_CLEAR_SEARCH_COND';
const AUTO_SEARCH = 'AUTO_SEARCH';
//const SET_CONTINUE_SEARCH = 'SET_CONTINUE_SEARCH';

export function moldInventoryReducer(state = initialState, action) {
  switch (action.type) {
    case MOLD_INVENTORY_ADD_SEARCH_COND:
      return {...state,
        searchCond: [...state.searchCond, action.value]
      };
    case MOLD_INVENTORY_DELETE_LAST_SEARCH_COND: 
      if (state.searchCond.length <= 0) {
        return state;
      }
      else {
        var newSearchCond = state.searchCond.slice(0, state.searchCond.length - 1);
        return {...state, 
          searchCond: newSearchCond
        };
      }
    case MOLD_INVENTORY_CLEAR_SEARCH_COND: 
      if (state.searchCond.length <= 0) {
        return state;
      }
      else {
        return {...state, 
          searchCond: []
        };
      }
    case AUTO_SEARCH: 
      return {...state,
        autoSearch: action.value
      };
    // case SET_CONTINUE_SEARCH:
    //   return {...state,
    //     continueSearch: action.value
    //   };
    default:
      return state;
  }
}
  
// Action Creators
export function addSearchCondition(value) {
  // Action
  return {
    type: MOLD_INVENTORY_ADD_SEARCH_COND,
    value
  };
}

export function deleteLastSearchCondition(value) {
  return {
    type: MOLD_INVENTORY_DELETE_LAST_SEARCH_COND,
    value
  };
}

export function clearSearchCondition(value) {
  return {
    type: MOLD_INVENTORY_CLEAR_SEARCH_COND,
    value
  };
}

export function autoSearch(value) {
  return {
    type: AUTO_SEARCH,
    value
  };
}

// export function setContinueSearch(value) {
//   return {
//     type: SET_CONTINUE_SEARCH,
//     value
//   };
// }
