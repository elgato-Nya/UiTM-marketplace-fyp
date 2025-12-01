import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid, Button, Alert } from "@mui/material";
import {
  Edit,
  Email,
  School,
  LocationCity,
  Info,
  Verified,
  Schedule,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useProfile } from "../../features/profile/hooks/useProfile";
import { AvatarUploadZone } from "../../components/common/ImageUpload";
import InlineEditField from "../../features/profile/components/InlineEditField";
import DynamicSkeleton from "../../components/ui/Skeleton/DynamicSkeleton";
import InfoCard from "../../components/common/Card/InfoCard";
import ActionCard from "../../components/common/Card/ActionCard";
import InfoList from "../../components/common/List/InfoList";
import ActionGrid from "../../components/common/Grid/ActionGrid";
import { getObjectValueByKey } from "../../utils/commonFunction";
import { CAMPUS_OPTIONS, FACULTY_OPTIONS } from "../../constants/authConstant";

function ProfilePage() {
  const { theme } = useTheme();
  const { user, roles } = useAuth();
  const location = useLocation();
  const {
    profile,
    isLoading,
    error,
    success,
    loadUserProfile,
    saveUserProfile,
  } = useProfile();

  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    // Always load profile data when component mounts or user changes
    // This ensures fresh data after login/logout
    loadUserProfile();
  }, [user?.email, loadUserProfile]); // Re-fetch when user email changes

  useEffect(() => {
    if (error) {
      setUpdateError(error.message || "Failed to update profile.");
      setTimeout(() => setUpdateError(""), 5000);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setUpdateSuccess(success?.message || "Profile updated successfully.");
      setTimeout(() => setUpdateSuccess(""), 5000);
    }
  }, [success]);

  const handleFieldUpdate = async (field, value) => {
    try {
      // Always send profile fields in the profile.* format for consistency
      const updateData = {
        profile: {
          [field]: value,
        },
      };

      const result = await saveUserProfile(updateData);

      if (result.meta.requestStatus === "fulfilled") {
        setUpdateSuccess("Profile updated successfully!");
      }
    } catch (err) {
      setUpdateError(err.message || "Failed to update profile.");
    }
  };

  const handleAvatarDelete = async () => {
    await handleFieldUpdate("avatar", "");
  };

  if (isLoading) {
    return (
      <DynamicSkeleton
        type="page"
        location={location.pathname}
        config={{
          contentType: "profile",
          showHeader: false,
          showSidebar: false,
        }}
      />
    );
  }

  // If no profile data and not loading, show error state
  if (!profile && !isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load profile data. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  // Fix data mapping - profile from useProfile contains the full user data
  const currentUser = profile || user || {};
  const currentProfile = currentUser?.profile || {};

  // Get the correct username - it should be in the profile object
  const displayUsername =
    currentProfile?.username || currentUser?.username || "User";
  const displayEmail = currentUser?.email || "";

  // Configuration for reusable components
  const roleChips = roles.map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    color: "primary",
    variant: "outlined",
  }));

  const profileActions = [
    {
      icon: <Edit />,
      label: "Edit Profile",
      onClick: () => {},
    },
  ];

  const universityInfoItems = [
    {
      id: "email",
      icon: <Email color="primary" />,
      label: "Email Address",
      value: displayEmail,
      chips: currentUser.emailVerification?.isVerified
        ? [
            {
              label: "Verified",
              color: "success",
              icon: <Verified />,
              variant: "filled",
            },
          ]
        : [],
    },
    {
      id: "campus",
      icon: <LocationCity color="primary" />,
      label: "Campus",
      value: currentProfile.campus || "Not specified",
    },
    {
      id: "faculty",
      icon: <School color="primary" />,
      label: "Faculty",
      value: currentProfile.faculty || "Not specified",
    },
  ];

  const quickActionsData = [
    {
      id: "orders",
      icon: <Schedule />,
      title: "My Orders",
      href: "/orders/purchases",
      color: "primary",
    },
    {
      id: "addresses",
      icon: <LocationCity />,
      title: "Addresses",
      href: "/profile/addresses",
      color: "primary",
    },
    ...(roles.includes("merchant")
      ? [
          {
            id: "store",
            icon: <School />,
            title: "My Store",
            href: "/merchant/store",
            color: "secondary",
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account preferences
        </Typography>
      </Box>

      {/* Alerts */}
      {updateError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setUpdateError("")}
        >
          {updateError}
        </Alert>
      )}

      {updateSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setUpdateSuccess("")}
        >
          {updateSuccess}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Avatar Section */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <InfoCard
            variant="outlined"
            title={displayUsername}
            subtitle={displayEmail}
            avatar={
              <AvatarUploadZone
                currentAvatar={currentProfile.avatar}
                username={displayUsername}
                onUploadComplete={(result) =>
                  handleFieldUpdate("avatar", result.url)
                }
                onDelete={handleAvatarDelete}
                size={120}
                editable={true}
              />
            }
            chips={roleChips}
            content={
              <Button
                component={Link}
                to="/profile/security"
                variant="outlined"
                fullWidth
                startIcon={<Edit />}
              >
                Security Settings
              </Button>
            }
            sx={{
              textAlign: "center",
              height: "fit-content",
              "& .MuiCardContent-root": {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              },
            }}
          />
        </Grid>

        {/* Profile Information */}
        <Grid item size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            {/* Basic Information */}
            <Box
              sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Basic Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <InlineEditField
                    label="Username"
                    value={displayUsername === "User" ? "" : displayUsername}
                    onSave={(val) => handleFieldUpdate("username", val)}
                    placeholder="Choose a username"
                    helperText="This is how others will find you"
                    maxLength={15}
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <InlineEditField
                    label="Phone Number"
                    value={currentProfile.phoneNumber || ""}
                    onSave={(val) => handleFieldUpdate("phoneNumber", val)}
                    placeholder="Your phone number"
                    helperText="For order business and authentication"
                    type="tel"
                  />
                </Grid>

                <Grid item size={{ xs: 12 }}>
                  <InlineEditField
                    label="Bio"
                    value={currentProfile.bio || ""}
                    onSave={(value) => handleFieldUpdate("bio", value)}
                    placeholder="Tell others about yourself..."
                    helperText="Share a bit about yourself (max 250 characters)"
                    maxLength={250}
                    multiline
                  />
                </Grid>
              </Grid>
            </Box>

            {/* University Information */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                University Information
              </Typography>

              <InfoList
                items={universityInfoItems}
                spacing="default"
                showDividers={false}
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Email, campus, and faculty information cannot be changed.
                  Contact support if you need to update these details.
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>

            <ActionGrid
              items={quickActionsData}
              spacing={2}
              breakpoints={{ xs: 12, sm: 6, md: 3 }}
              renderItem={(item) => (
                <ActionCard
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  href={item.href}
                  color={item.color}
                />
              )}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage;
