import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Visibility,
  Block,
  CheckCircle,
  Edit,
  VerifiedUser,
  LockReset,
} from "@mui/icons-material";

/**
 * UserActionMenu Component
 *
 * PURPOSE: Dropdown menu for individual user actions
 * FEATURES:
 * - View user details
 * - Suspend/Activate user
 * - Update user roles
 * - Verify email manually
 * - Reset password
 * - Conditional rendering based on user status
 *
 * PROPS:
 * - anchorEl: Menu anchor element
 * - open: Boolean menu open state
 * - user: Current user object
 * - onClose: Menu close handler
 * - onViewDetails: View details handler
 * - onSuspend: Suspend handler
 * - onActivate: Activate handler
 * - onUpdateRoles: Update roles handler
 * - onVerifyEmail: Verify email handler
 * - onResetPassword: Reset password handler
 *
 * ACCESSIBILITY:
 * - Proper ARIA labels
 * - Semantic menu structure
 * - Keyboard navigation
 * - Icon indicators
 */
const UserActionMenu = ({
  anchorEl,
  open,
  user,
  onClose,
  onViewDetails,
  onSuspend,
  onActivate,
  onUpdateRoles,
  onVerifyEmail,
  onResetPassword,
}) => {
  if (!user) return null;

  const isSuspended = user.isSuspended;
  const isEmailVerified = user.emailVerification?.isVerified;
  const isAdmin = user.roles?.includes("admin");

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        elevation: 2,
        sx: {
          minWidth: 200,
          mt: 1,
        },
      }}
    >
      {/* View Details */}
      <MenuItem onClick={onViewDetails}>
        <ListItemIcon>
          <Visibility fontSize="small" />
        </ListItemIcon>
        <ListItemText>View Details</ListItemText>
      </MenuItem>

      <Divider />

      {/* Suspend/Activate - Don't show for admins */}
      {!isAdmin && (
        <>
          {isSuspended ? (
            <MenuItem onClick={onActivate}>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Activate User</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={onSuspend}>
              <ListItemIcon>
                <Block fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Suspend User</ListItemText>
            </MenuItem>
          )}
        </>
      )}

      {/* Update Roles */}
      <MenuItem onClick={onUpdateRoles}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Update Roles</ListItemText>
      </MenuItem>

      <Divider />

      {/* Verify Email - Only show if not verified */}
      {!isEmailVerified && (
        <MenuItem onClick={onVerifyEmail}>
          <ListItemIcon>
            <VerifiedUser fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Verify Email</ListItemText>
        </MenuItem>
      )}

      {/* Reset Password */}
      <MenuItem onClick={onResetPassword}>
        <ListItemIcon>
          <LockReset fontSize="small" />
        </ListItemIcon>
        <ListItemText>Reset Password</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default UserActionMenu;
