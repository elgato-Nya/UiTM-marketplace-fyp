import Alert from "./Alert";

/**
 * Info Alert Component
 *
 * Specialized alert for displaying informational messages
 */
const InfoAlert = ({ message = "Information", ...props }) => {
  return <Alert severity="info" message={message} {...props} />;
};

export default InfoAlert;
