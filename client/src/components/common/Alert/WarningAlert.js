import Alert from "./Alert";

/**
 * Warning Alert Component
 *
 * Specialized alert for displaying warning messages
 */
const WarningAlert = ({ message = "Warning", ...props }) => {
  return <Alert severity="warning" message={message} {...props} />;
};

export default WarningAlert;
