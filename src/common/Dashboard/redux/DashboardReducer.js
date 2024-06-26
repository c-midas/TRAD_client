import moment from 'moment';
import { DASHBOARD_REDUX_CONSTANTS } from './DashboardReduxConstants';
import { LOGIN_REDUX_CONSTANTS } from '../../../screens/auth/login/redux/LoginReduxConstants';

const initialDashboardData = {
  dashboardDetails: {},
  dashboardTask: {
    docs: [],
    headers: [],
    total: 0,
    limit: 15,
    page: 1,
    pages: 1,
    isLoading: true,
  },
  taskDetails: {},
  dashboardNotification: {
    isLoading: true,
    notificationList: [],
  },
  pendingApplications: [],
  endorsedLimits: {},
  discretionaryLimit: {},
  approvedAmountRatio: [],
  approvedApplications: {},
};

export const dashboard = (state = initialDashboardData, action) => {
  switch (action.type) {
    case DASHBOARD_REDUX_CONSTANTS.DASHBOARD_DETAILS:
      return {
        ...state,
        dashboardDetails: action.data,
      };

    case DASHBOARD_REDUX_CONSTANTS.TASK.DASHBOARD_TASK_LIST_REQUEST:
      return {
        ...state,
        dashboardTask: {
          isLoading: true,
          ...state?.dashboardTask,
        },
      };

    case DASHBOARD_REDUX_CONSTANTS.TASK.DASHBOARD_TASK_LIST_SUCCESS:
      return {
        ...state,
        dashboardTask: {
          isLoading: false,
          ...action.data,
        },
      };
    case DASHBOARD_REDUX_CONSTANTS.TASK.DASHBOARD_TASK_DETAILS:
      return {
        ...state,
        taskDetails: action.data,
      };

    case DASHBOARD_REDUX_CONSTANTS.TASK.UPDATE_EDIT_TASK_FIELD_ACTION:
      return {
        ...state,
        taskDetails: {
          ...state?.taskDetails,
          [action?.name]: action?.value,
        },
      };

    case DASHBOARD_REDUX_CONSTANTS.NOTIFICATION.DASHBOARD_NOTIFICATION_LIST_REQUEST:
      return {
        ...state,
        dashboardNotification: {
          ...state?.dashboardNotification,
          isLoading: true,
        },
      };

    case DASHBOARD_REDUX_CONSTANTS.NOTIFICATION.DASHBOARD_NOTIFICATION_LIST_SUCCESS: {
      let notificationList = state?.dashboardNotification?.notificationList ?? [];
      let hasMoreData = false;
      const { page, pages, docs } = action?.data;
      notificationList = notificationList?.map(elem => {
        if (docs[elem?.title]) {
          const final = docs[elem?.title];
          delete docs[elem?.title];
          return { ...elem, data: [...elem?.data, ...final] };
        }
        return elem;
      });
      if (page < pages) {
        hasMoreData = true;
      }
      const newNotificationList = Object.entries(docs).map(([key, value]) => ({
        title: key,
        data: value,
      }));

      return {
        ...state,
        dashboardNotification: {
          ...state?.dashboardNotification,
          notificationList: [...new Set([...newNotificationList, ...notificationList])],
          page: action?.data?.page,
          limit: action?.data?.limit,
          pages: action?.data?.pages,
          total: action?.data?.total,
          isLoading: false,
          hasMoreData,
        },
      };
    }

    case DASHBOARD_REDUX_CONSTANTS.NOTIFICATION.DASHBOARD_NOTIFICATION_LIST_FAIL:
      return {
        ...state,
        dashboardNotification: {
          isLoading: false,
          ...state?.dashboardNotification,
        },
      };

    case DASHBOARD_REDUX_CONSTANTS.NOTIFICATION.DELETE_DASHBOARD_NOTIFICATION_ACTION: {
      const notifications = state?.dashboardNotification?.notificationList ?? [];
      const finalData = [];

      notifications?.forEach(notification => {
        const data = notification?.data?.filter(e => e?._id !== action.data);

        if (data.length > 0) {
          finalData.push({ ...notification, data });
        }
      });

      return {
        ...state,
        dashboardNotification: {
          ...state.dashboardNotification,
          notificationList: finalData,
        },
      };
    }

    case DASHBOARD_REDUX_CONSTANTS.NOTIFICATION.GET_NOTIFICATION_FROM_SOCKET: {
      let notificationList = state?.dashboardNotification?.notificationList ?? [];
      const { updatedAt, _id, description } = action?.data;
      const data = {
        [moment(updatedAt).format('YYYY-M-D')]: [{ updatedAt, _id, description }],
      };
      notificationList = notificationList?.map(elem => {
        if (data[elem.title]) {
          const final = data[elem.title];
          delete data[elem.title];
          return { ...elem, data: [...final, ...elem.data] };
        }
        return elem;
      });
      const newNotificationList = Object.entries(data).map(([key, value]) => ({
        title: key,
        data: value,
      }));

      return {
        ...state,
        dashboardNotification: {
          ...state.dashboardNotification,
          notificationList: [...new Set([...newNotificationList, ...notificationList])],
        },
      };
    }

    case DASHBOARD_REDUX_CONSTANTS.NOTIFICATION.CLEAR_NOTIFICATION_DATA:
      return {
        ...state,
        dashboardNotification: {
          notificationList: [],
        },
      };

    case DASHBOARD_REDUX_CONSTANTS.RESET_DASHBOARD_DATA: {
      return {
        ...state,
        dashboardDetails: initialDashboardData.dashboardDetails,
      };
    }

    case LOGIN_REDUX_CONSTANTS.LOGOUT_USER_ACTION:
      return null;

    default:
      return state;
  }
};
