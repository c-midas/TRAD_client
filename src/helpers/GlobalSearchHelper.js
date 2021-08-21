import { errorNotification } from '../common/Toast';
import { setViewCreditLimitActiveTabIndex } from '../screens/CreditLimits/redux/CreditLimitsAction';

const CreditLimitTabMapper = {
  application: 0,
  overdues: 1,
  claims: 2,
  tasks: 3,
  documents: 4,
  notes: 5,
};

const handleSearchWithSubModules = (path, module, hasSubModule, subModule, history) => {
  if (hasSubModule) {
    switch (module) {
      case 'creditLimit':
        setViewCreditLimitActiveTabIndex(CreditLimitTabMapper?.[subModule]);
        break;
      default:
        break;
    }
  }
  history.push(path);
};

export const handleGlobalSearchSelect = (history, module, id, hasSubModule, subModule, status) => {
  try {
    switch (module) {
      case 'task':
        history.push(`/dashboard/task/${id}`);
        break;
      case 'application':
        if (status === 'DRAFT')
          history.push(`/applications/application/generate/?applicationId=${id}`);
        else history.push(`/applications/detail/view/${id}`);
        break;
      case 'creditLimit':
        handleSearchWithSubModules(
          `/credit-limits/${id}`,
          module,
          hasSubModule,
          subModule,
          history
        );
        break;
      case 'companyProfile':
        history.push(`/company-profile`);
        break;
      case 'employee':
        history.push(`employee`);
        break;
      case 'support':
        history.push(`/support`);
        break;

      default:
        history.push('/dashboard');
    }
  } catch (e) {
    errorNotification(e);
  }
};
