import React from "react";
import {
  Box,
  Typography,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  useMediaQuery,
  Stepper,
} from "@mui/material";
import {
  CheckCircle,
  HourglassEmpty,
  LocalShipping,
  Cancel as CancelIcon,
  AssignmentReturn,
} from "@mui/icons-material";

import { useTheme } from "../../../hooks/useTheme";
import { ORDER_STATUS, STATUS_CONFIG } from "../../../constants/orderConstant";
import { formatOrderDate } from "../utils/orderHelper";

const OrderTimeline = ({
  statusHistory = [],
  currentStatus,
  orientation = "vertical",
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Determine orientation based on screen size
  const timelineOrientation = isMobile ? "vertical" : orientation;

  // get icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
        return <CheckCircle />;
      case ORDER_STATUS.CANCELLED:
        return <CancelIcon />;
      case ORDER_STATUS.REFUNDED:
        return <AssignmentReturn />;
      case ORDER_STATUS.SHIPPED:
        return <LocalShipping />;
      default:
        return <HourglassEmpty />;
    }
  };

  const getActiveStep = () => {
    return statusHistory.findIndex((item) => item.status === currentStatus);
  };

  const getStepColor = (status) => {
    return STATUS_CONFIG[status]?.color || "default";
  };

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: "center",
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
        }}
        role="status"
        aria-label="No status history available"
      >
        <Typography variant="body2" color="text.secondary">
          No status history available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      component="section"
      sx={{ width: "100%" }}
      role="region"
      aria-label="Order status timeline"
    >
      <Stepper
        activeStep={getActiveStep()}
        orientation={timelineOrientation}
        sx={{
          "& .MuiSteplabel-root": {
            cursor: "default",
          },
        }}
      >
        {statusHistory.map((item, index) => {
          const config = STATUS_CONFIG[item.status];
          const isActive = item.status === currentStatus;

          return (
            <Step
              key={`${item.status}-${index}`}
              completed={index < getActiveStep()}
            >
              <StepLabel
                slots={{
                  stepIcon: () => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isActive
                          ? `${getStepColor(item.status)}.main`
                          : index < getActiveStep()
                            ? `${getStepColor(item.status)}.light`
                            : "grey.400",
                        color:
                          isActive || index < getActiveStep()
                            ? "white"
                            : "text.secondary",
                        transition: "all 0.3s ease",
                      }}
                      role="img"
                      aria-label={`${config?.label || item.status} status icon`}
                    >
                      {getStatusIcon(item.status)}
                    </Box>
                  ),
                }}
              >
                <Box sx={{ ml: 1 }}>
                  {/** Status Label */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: isActive ? "bold" : "normal",
                      color: isActive ? "text.primary" : "text.secondary",
                    }}
                  >
                    {config?.label || item.status}
                  </Typography>

                  {/** Timestamp */}
                  <Typography variant="caption" color="text.secondary">
                    {formatOrderDate(item.updatedAt)}
                  </Typography>

                  {/** Status Badge for active step */}
                  {isActive && (
                    <Chip
                      label="Current"
                      size="small"
                      color={getStepColor(item.status)}
                      sx={{ mt: 0.5, height: 20, fontSize: "0.75rem" }}
                      aria-label="Current status"
                    />
                  )}
                </Box>
              </StepLabel>

              {/** Step Content (Notes/Reason) */}
              {timelineOrientation === "vertical" &&
                (item.note || item.reason) && (
                  <StepContent>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                        borderLeft: 3,
                        borderColor: `${getStepColor(item.status)}.main`,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {item.note || item.reason}
                      </Typography>

                      {/* Show who updated */}
                      {item.updatedBy && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Updated by:{" "}
                          {typeof item.updatedBy === "string"
                            ? item.updatedBy
                            : item.updatedBy.name ||
                              item.updatedBy.username ||
                              item.updatedBy.email ||
                              "System"}
                        </Typography>
                      )}
                    </Paper>
                  </StepContent>
                )}
            </Step>
          );
        })}
      </Stepper>

      {/** Legend for horizontal/desktop view */}
      {timelineOrientation === "horizontal" && (
        <Box
          sx={{
            mt: 3,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "success.main",
              }}
            />
            <Typography variant="caption">Completed</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
            <Typography variant="caption">Current</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "grey.300",
              }}
            />
            <Typography variant="caption">Pending</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OrderTimeline;
