import React from 'react';
import PropTypes from 'prop-types';
import './Switch.scss';

const Switch = props => {
  const { id } = props;
  return (
    <span className="d-flex align-center">
      <input
        type="checkbox"
        id={id}
        className="common-switch"
        {...props}
        style={{ height: 0, width: 0 }}
      />
      <label htmlFor={id} />
    </span>
  );
};

Switch.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Switch;
