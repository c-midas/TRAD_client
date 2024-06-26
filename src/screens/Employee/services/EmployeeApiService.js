import ApiService from '../../../services/api-service/ApiService';
import { EMPLOYEE_URLS } from '../../../constants/UrlConstants';

const EmployeeApiService = {
  getAllEmployeeList: params => ApiService.getData(EMPLOYEE_URLS.EMPLOYEE_LIST_URL, { params }),
  getEmployeeColumnList: params =>
    ApiService.getData(EMPLOYEE_URLS.EMPLOYEE_COLUMN_LIST, { params }),
  updateEmployeeUpdateColumnList: data =>
    ApiService.putData(EMPLOYEE_URLS.EMPLOYEE_COLUMN_LIST, data),
};

export default EmployeeApiService;
