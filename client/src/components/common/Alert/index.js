/**
 * Alert Components Export
 *
 * Provides reusable alert components with common patterns:
 * - Alert: Base component with customization
 * - ErrorAlert: For error messages
 * - SuccessAlert: For success messages (auto-dismisses)
 * - InfoAlert: For informational messages
 * - WarningAlert: For warning messages
 *
 * Usage Examples:
 *
 * // Basic alert
 * <Alert severity="info" message="Hello world" />
 *
 * // Error alert with error object
 * <ErrorAlert error={error} show={!!error} />
 *
 * // Success alert with auto-dismiss
 * <SuccessAlert message="Listing created!" show={success} />
 *
 * // Info alert with custom content
 * <InfoAlert>
 *   <Typography>Custom content here</Typography>
 * </InfoAlert>
 *
 * // Alert with title
 * <Alert severity="warning" title="Warning" message="Be careful!" />
 */

export { default as Alert } from "./Alert";
export { default as ErrorAlert } from "./ErrorAlert";
export { default as SuccessAlert } from "./SuccessAlert";
export { default as InfoAlert } from "./InfoAlert";
export { default as WarningAlert } from "./WarningAlert";
