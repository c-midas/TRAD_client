import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../Button/Button';
import { getLabelFromValues } from '../../helpers/entityiTypeHelper';
import { entityTypeMapperObjectForPersonStep } from '../../helpers/Mappers';
import { getApplicationDetailsOnBackToCompanyStep } from '../../screens/Application/redux/ApplicationAction';

const Stepper = props => {
  const dispatch = useDispatch();
  const applicationDetail = useSelector(({ application }) => application?.editApplication ?? {});

  const entityType = useMemo(
    () => applicationDetail?.company?.entityType?.value ?? 'PROPRIETARY_LIMITED',
    [applicationDetail?.company?.entityType]
  );

  const { generateApplicationSaveAndNextButtonLoaderAction } = useSelector(
    ({ generalLoaderReducer }) => generalLoaderReducer ?? false
  );

  const {
    steps,
    stepIndex,
    children,
    className,
    nextClick,
    addStepClick,
    onChangeIndex,
    ...restProps
  } = props;
  const [activeStep, setActiveStep] = useState(0);

  const onClickBackButton = useCallback(() => {
    onChangeIndex(activeStep - 1);
    setActiveStep(prevState => prevState - 1);
    if (activeStep === 1)
      dispatch(getApplicationDetailsOnBackToCompanyStep(applicationDetail?._id, activeStep));
  }, [activeStep, setActiveStep, applicationDetail?._id]);

  const onClickNextButton = useCallback(async () => {
    try {
      const canGoNext = await nextClick();
      if (canGoNext && activeStep < steps.length - 1) {
        onChangeIndex(activeStep + 1);
        setActiveStep(prevState => prevState + 1);
      }
    } catch (e) {
      /**/
    }
  }, [steps, activeStep, setActiveStep, nextClick]);

  useEffect(() => {
    if (stepIndex !== activeStep) {
      setActiveStep(stepIndex);
    }
  }, [stepIndex, activeStep]);

  return (
    <div className={className} {...restProps}>
      <div className="stepper-container">
        {steps?.map((step, index) => (
          <div
            key={step.text}
            className={`step-container ${activeStep === index && 'active-step'} ${
              index < activeStep && 'done-step'
            }`}
          >
            <span className={`material-icons-round arrow ${index < activeStep && 'done-step'}`}>
              keyboard_arrow_right
            </span>
            <div className="step">
              <span className="material-icons-round">
                {index < activeStep ? 'check_circle' : step.icon}
              </span>
              {step.text}
            </div>
          </div>
        ))}
      </div>
      <div className="step-content">{children}</div>
      <div className="stepper-buttons-row">
        <div>
          {steps?.[activeStep]?.name === 'partners' &&
            steps?.[activeStep]?.text !== 'Sole Trader' && (
              <Button
                buttonType="secondary"
                title={getLabelFromValues(entityType, entityTypeMapperObjectForPersonStep)}
                onClick={() => {
                  addStepClick();
                }}
              />
            )}
        </div>
        <div className="d-flex">
          {activeStep > 0 && (
            <Button
              buttonType="outlined-primary"
              title={`Back to ${steps?.[activeStep - 1]?.text}`}
              onClick={onClickBackButton}
            />
          )}
          <Button
            className="ml-15"
            buttonType="primary"
            title={`Save${activeStep !== steps?.length - 1 ? ' and Next' : ''}`}
            onClick={onClickNextButton}
            isLoading={generateApplicationSaveAndNextButtonLoaderAction}
          />
        </div>
      </div>
    </div>
  );
};

Stepper.propTypes = {
  className: PropTypes.string,
  stepIndex: PropTypes.number.isRequired,
  steps: PropTypes.array.isRequired,
  nextClick: PropTypes.func,
  addStepClick: PropTypes.func,
  onChangeIndex: PropTypes.func,
  children: PropTypes.element.isRequired,
};

Stepper.defaultProps = {
  className: '',
  onChangeIndex: () => {},
  nextClick: () => {},
  addStepClick: () => {},
};

export default Stepper;
