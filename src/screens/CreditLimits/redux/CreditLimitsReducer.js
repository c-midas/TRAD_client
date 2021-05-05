import { LOGIN_REDUX_CONSTANTS } from '../../auth/login/redux/LoginReduxConstants';
import {
  CREDIT_LIMITS_COLUMN_LIST_REDUX_CONSTANTS, CREDIT_LIMITS_FILTER_LIST_REDUX_CONSTANTS,
  CREDIT_LIMITS_REDUX_CONSTANTS,
} from './CreditLimitsReduxConstants';
import {object} from "prop-types";

const initialCreditLimitsListState = {
  creditLimitList: { docs: [], total: 0, limit: 15, page: 1, pages: 1, isLoading: true },
  creditLimitsColumnList: {},
  creditLimitsDefaultColumnList: {},
  creditLimitsFilterList: {
    dropdownData: {
      entityType: []
    }
  }
};

export const creditLimits = (state = initialCreditLimitsListState, action) => {
  switch (action.type) {
    case CREDIT_LIMITS_REDUX_CONSTANTS.CREDIT_LIMITS_LIST_USER_ACTION:
      return {
        ...state,
        creditLimitList: {
          isLoading: false,
          ...action.data
        },
      };

    case CREDIT_LIMITS_COLUMN_LIST_REDUX_CONSTANTS.CREDIT_LIMITS_COLUMN_LIST_ACTION:
      return {
        ...state,
        creditLimitsColumnList: action.data
      }

    case CREDIT_LIMITS_COLUMN_LIST_REDUX_CONSTANTS.CREDIT_LIMITS_DEFAULT_COLUMN_LIST_ACTION:
      return {
        ...state,
        creditLimitsDefaultColumnList: action.data
      }

    case CREDIT_LIMITS_COLUMN_LIST_REDUX_CONSTANTS.UPDATE_CREDIT_LIMITS_COLUMN_LIST_ACTION:
     const temp = {
       ...state?.creditLimitsColumnList
     };
     const {type, name, value} = action?.data;
     temp[`${type}`] = temp[`${type}`].map(e =>
     e.name === name ? {...e, isChecked: value} : e);
     return {
       ...state,
       creditLimitsColumnList: temp
     }

    case CREDIT_LIMITS_FILTER_LIST_REDUX_CONSTANTS.CREDIT_LIMITS_FILTER_LIST_ACTION:
      const dropdownData = {...state?.creditLimitsFilterList?.dropdownData};
      Object.entries(action?.data)?.forEach(([key, value]) => {
        dropdownData[key] = value?.map(entity => ({
          label: entity?.name ?? entity.label,
          name: dropdownData[key] === 'entityType' && 'entityType',
          value: entity?._id ?? entity.value,
        }));
      });

      return {
        ...state,
        creditLimitsFilterList: {
          ...state.creditLimitsFilterList,
          dropdownData
        }
      }

    case LOGIN_REDUX_CONSTANTS.LOGOUT_USER_ACTION:
      return null;

    default:
      return state;
  }
};


