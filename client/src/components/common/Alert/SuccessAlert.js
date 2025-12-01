import Alert from "./Alert";

/**
 * Success Alert Component
 *
 * Specialized alert for displaying success messages
 * Auto-dismisses by default after 5 seconds
 */
const SuccessAlert = ({
  message = "Operation completed successfully!",
  autoDismiss = 5000,
  ...props
}) => {
  return (
    <Alert
      severity="success"
      message={message}
      autoDismiss={autoDismiss}
      {...props}
    />
  );
};

export default SuccessAlert;
