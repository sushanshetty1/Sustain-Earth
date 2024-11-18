// File: components/ui/card.js
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames"; // Optional utility

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={classNames(
        "rounded-lg shadow-lg p-4 bg-white",
        className // Allows adding custom classes
      )}
      {...props} // Pass other div attributes
    >
      {children}
    </div>
  );
};

// Prop validation
Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Default props
Card.defaultProps = {
  className: "",
};

export default Card;
