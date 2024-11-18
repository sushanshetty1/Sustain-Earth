// File: components/ui/button.js
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames"; // Optional utility for conditional class handling

export const Button = ({ children, onClick, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "px-4 py-2 rounded font-semibold text-white transition-all duration-300",
        className, // Allows adding custom classes
        "hover:shadow-md focus:outline-none"
      )}
      {...props} // Pass other button attributes
    >
      {children}
    </button>
  );
};

// Prop validation (optional but recommended)
Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

// Default props
Button.defaultProps = {
  onClick: () => {},
  className: "bg-blue-600 hover:bg-blue-700",
};

export default Button;
