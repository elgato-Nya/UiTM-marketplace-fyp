import React from "react";
import { Box, Skeleton, Paper, Container, Grid } from "@mui/material";

/**
 * Page-level skeleton components for complex layouts
 */

/**
 * Dashboard skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const DashboardSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="xl" sx={{ py: 3 }}>
    {/* Stats cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[...Array(4)].map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Skeleton
                variant="rectangular"
                width={40}
                height={40}
                sx={{ borderRadius: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={16}
                  sx={{ mb: 1, ...skeletonProps.sx }}
                  {...skeletonProps}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  {...skeletonProps}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>

    {/* Charts and tables */}
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Skeleton
            variant="text"
            width="30%"
            height={24}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height="80%"
            sx={{ borderRadius: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Skeleton
            variant="text"
            width="40%"
            height={24}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Skeleton
                variant="text"
                width="60%"
                height={20}
                {...skeletonProps}
              />
              <Skeleton
                variant="text"
                width="20%"
                height={20}
                {...skeletonProps}
              />
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  </Container>
);

/**
 * Home page skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const HomeSkeleton = ({ config, skeletonProps }) => (
  <Box>
    {/* Hero section */}
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Skeleton
          variant="text"
          width="50%"
          height={48}
          sx={{ mx: "auto", mb: 2, ...skeletonProps.sx }}
          {...skeletonProps}
        />
        <Skeleton
          variant="text"
          width="70%"
          height={24}
          sx={{ mx: "auto", mb: 3, ...skeletonProps.sx }}
          {...skeletonProps}
        />
        <Skeleton
          variant="rectangular"
          width={200}
          height={48}
          sx={{ mx: "auto", borderRadius: 1, ...skeletonProps.sx }}
          {...skeletonProps}
        />
      </Box>
    </Container>

    {/* Featured section */}
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton
        variant="text"
        width="30%"
        height={32}
        sx={{ mb: 3, ...skeletonProps.sx }}
        {...skeletonProps}
      />
      <Grid container spacing={3}>
        {[...Array(6)].map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Paper sx={{ p: 2 }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={180}
                sx={{ mb: 2, borderRadius: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
              <Skeleton
                variant="text"
                width="80%"
                height={20}
                sx={{ mb: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
              <Skeleton
                variant="text"
                width="60%"
                height={16}
                {...skeletonProps}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

/**
 * Default page skeleton component for generic layouts
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const DefaultPageSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Skeleton
      variant="text"
      width="40%"
      height={32}
      sx={{ mb: 3, ...skeletonProps.sx }}
      {...skeletonProps}
    />
    <Skeleton
      variant="rectangular"
      width="100%"
      height={200}
      sx={{ mb: 3, borderRadius: 1, ...skeletonProps.sx }}
      {...skeletonProps}
    />
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      <Skeleton
        variant="rectangular"
        width="48%"
        height={120}
        sx={{ borderRadius: 1, ...skeletonProps.sx }}
        {...skeletonProps}
      />
      <Skeleton
        variant="rectangular"
        width="48%"
        height={120}
        sx={{ borderRadius: 1, ...skeletonProps.sx }}
        {...skeletonProps}
      />
    </Box>
    {[...Array(3)].map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={`${90 - i * 10}%`}
        height={20}
        sx={{ mb: 1, ...skeletonProps.sx }}
        {...skeletonProps}
      />
    ))}
  </Container>
);

/**
 * Profile skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const ProfileSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="xl" sx={{ py: 3 }}>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
      <Skeleton
        variant="text"
        width={200}
        height={40}
        sx={{ mb: 1, ...skeletonProps.sx }}
        {...skeletonProps}
      />
      <Skeleton variant="text" width={400} height={24} {...skeletonProps} />
    </Box>

    <Grid container spacing={3}>
      {/* Left Column - Avatar Section */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Avatar */}
          <Skeleton
            variant="circular"
            width={120}
            height={120}
            sx={{ mx: "auto", mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />

          {/* Username */}
          <Skeleton
            variant="text"
            width={150}
            height={32}
            sx={{ mx: "auto", mb: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />

          {/* Role chips */}
          <Box
            sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 2 }}
          >
            {[...Array(2)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={80}
                height={24}
                sx={{ borderRadius: 3, ...skeletonProps.sx }}
                {...skeletonProps}
              />
            ))}
          </Box>

          {/* Button */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={36}
            sx={{ borderRadius: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
        </Paper>
      </Grid>

      {/* Right Column - Profile Information */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          sx={{
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* Basic Information Section */}
          <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
            <Skeleton
              variant="text"
              width={200}
              height={32}
              sx={{ mb: 3, ...skeletonProps.sx }}
              {...skeletonProps}
            />

            <Grid container spacing={2}>
              {/* Form fields */}
              {[...Array(3)].map((_, i) => (
                <Grid size={{ xs: 12, sm: i === 2 ? 12 : 6 }} key={i}>
                  <Box sx={{ mb: 2 }}>
                    <Skeleton
                      variant="text"
                      width={100}
                      height={16}
                      sx={{ mb: 1, ...skeletonProps.sx }}
                      {...skeletonProps}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={i === 2 ? 80 : 40}
                      sx={{ borderRadius: 1, ...skeletonProps.sx }}
                      {...skeletonProps}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* University Information Section */}
          <Box sx={{ p: 3 }}>
            <Skeleton
              variant="text"
              width={250}
              height={32}
              sx={{ mb: 3, ...skeletonProps.sx }}
              {...skeletonProps}
            />

            {/* List items */}
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", mb: 2 }}
              >
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ mr: 2, ...skeletonProps.sx }}
                  {...skeletonProps}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton
                    variant="text"
                    width={120}
                    height={16}
                    sx={{ mb: 0.5, ...skeletonProps.sx }}
                    {...skeletonProps}
                  />
                  <Skeleton
                    variant="text"
                    width={200}
                    height={14}
                    {...skeletonProps}
                  />
                </Box>
              </Box>
            ))}

            {/* Info alert */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={60}
              sx={{ mt: 2, borderRadius: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
          </Box>
        </Paper>
      </Grid>

      {/* Quick Actions Section */}
      <Grid size={{ xs: 12 }}>
        <Paper
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Skeleton
            variant="text"
            width={150}
            height={32}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />

          <Grid container spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={32}
                    height={32}
                    sx={{ mx: "auto", mb: 1, ...skeletonProps.sx }}
                    {...skeletonProps}
                  />
                  <Skeleton
                    variant="text"
                    width={80}
                    height={16}
                    sx={{ mx: "auto", ...skeletonProps.sx }}
                    {...skeletonProps}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </Container>
);
