import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../../../assets/images/logo.svg';

function AuthScreenContainer(props) {
  const { children } = props;
  return (
    <div className="main-bg">
      <div className="form-container">
        <div>
          <img alt="TCR" src={logo} className="logo" />
          <div className="header">
            <div>Welcome To</div>
            <div>Trade Credit Risk</div>
          </div>
          {children}
          <div className="fixed-right-strips">
            <div className="blue-strip" />
            <div className="orange-strip" />
            <div className="green-strip" />
          </div>
          <img alt="TCR" className="gray-logo" src={logo} />
        </div>
      </div>
    </div>
  );
}

AuthScreenContainer.propTypes = {
  children: PropTypes.element.isRequired,
};

export default AuthScreenContainer;
