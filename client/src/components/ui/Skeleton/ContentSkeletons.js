import { Box, Skeleton, Paper, Container, Grid } from "@mui/material";

/**
 * Content-level skeleton components for forms, lists, and grids
 */

/**
 * Form skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const FormSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="sm" sx={{ py: 4 }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: config.centered ? "center" : "flex-start",
        minHeight: config.centered ? "80vh" : "auto",
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Skeleton
          variant="text"
          width="60%"
          height={32}
          sx={{ mb: 3, mx: "auto", ...skeletonProps.sx }}
          {...skeletonProps}
        />

        {[...Array(4)].map((_, i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Skeleton
              variant="text"
              width="30%"
              height={20}
              sx={{ mb: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={56}
              sx={{ borderRadius: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
          </Box>
        ))}

        <Skeleton
          variant="rectangular"
          width="100%"
          height={48}
          sx={{ mt: 3, borderRadius: 1, ...skeletonProps.sx }}
          {...skeletonProps}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Skeleton variant="text" width="40%" height={16} {...skeletonProps} />
          <Skeleton variant="text" width="30%" height={16} {...skeletonProps} />
        </Box>
      </Paper>
    </Box>
  </Container>
);

/**
 * List skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const ListSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="md" sx={{ py: 2 }}>
    {[...Array(config.items)].map((_, i) => (
      <Paper
        key={i}
        sx={{ p: 3, mb: 2, display: "flex", gap: 3, alignItems: "center" }}
      >
        <Skeleton
          variant="circular"
          width={56}
          height={56}
          {...skeletonProps}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton
            variant="text"
            width="70%"
            height={24}
            sx={{ mb: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="text"
            width="50%"
            height={20}
            sx={{ mb: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton variant="text" width="30%" height={16} {...skeletonProps} />
        </Box>
        <Skeleton
          variant="rectangular"
          width={80}
          height={32}
          sx={{ borderRadius: 1, ...skeletonProps.sx }}
          {...skeletonProps}
        />
      </Paper>
    ))}
  </Container>
);

/**
 * Grid skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const GridSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="lg" sx={{ py: 3 }}>
    <Grid container spacing={3}>
      {[...Array(config.items * 2)].map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ mb: 2, borderRadius: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={24}
              sx={{ mb: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Skeleton
              variant="text"
              width="60%"
              height={20}
              sx={{ mb: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                {...skeletonProps}
              />
              <Skeleton
                variant="rectangular"
                width={60}
                height={28}
                sx={{ borderRadius: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Container>
);

/**
 * Cart skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const CartSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Grid container spacing={3}>
      {/* Cart Items Skeleton */}
      <Grid size={{ xs: 12, md: 8 }}>
        {[...Array(3)].map((_, i) => (
          <Paper key={i} sx={{ p: 2, mb: 2, display: "flex", gap: 2 }}>
            <Skeleton
              variant="rectangular"
              width={100}
              height={100}
              sx={{ borderRadius: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="text"
                width="60%"
                height={30}
                sx={{ mb: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ mb: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
              <Skeleton
                variant="text"
                width="30%"
                height={20}
                {...skeletonProps}
              />
            </Box>
          </Paper>
        ))}
      </Grid>

      {/* Summary Skeleton */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Skeleton
            variant="text"
            width="50%"
            height={30}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            sx={{ mb: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={48}
            sx={{ borderRadius: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
        </Paper>
      </Grid>
    </Grid>
  </Container>
);

/**
 * Wishlist skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const WishlistSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Grid container spacing={3}>
      {[...Array(config.items || 6)].map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
          <Paper sx={{ p: 2 }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ mb: 2, borderRadius: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={30}
              sx={{ mb: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={20}
              sx={{ mb: 2, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={36}
              sx={{ borderRadius: 1, ...skeletonProps.sx }}
              {...skeletonProps}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Container>
);

/**
 * Checkout skeleton component
 * @param {Object} config - Configuration object
 * @param {Object} skeletonProps - Common skeleton properties
 */
export const CheckoutSkeleton = ({ config, skeletonProps }) => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Grid container spacing={3}>
      {/* Main content */}
      <Grid size={{ xs: 12, md: 8 }}>
        {/* Session timer skeleton */}
        <Skeleton
          variant="rectangular"
          height={60}
          sx={{ mb: 3, borderRadius: 1, ...skeletonProps.sx }}
          {...skeletonProps}
        />

        {/* Address section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton
            variant="text"
            width="30%"
            height={30}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="rectangular"
            height={150}
            sx={{ borderRadius: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
        </Paper>

        {/* Delivery method */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton
            variant="text"
            width="30%"
            height={30}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
        </Paper>

        {/* Order items */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton
            variant="text"
            width="30%"
            height={30}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          {[1, 2].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
            </Box>
          ))}
        </Paper>

        {/* Payment section */}
        <Paper sx={{ p: 3 }}>
          <Skeleton
            variant="text"
            width="30%"
            height={30}
            sx={{ mb: 2, ...skeletonProps.sx }}
            {...skeletonProps}
          />
          <Skeleton
            variant="rectangular"
            height={150}
            sx={{ borderRadius: 1, ...skeletonProps.sx }}
            {...skeletonProps}
          />
        </Paper>
      </Grid>

      {/* Sidebar summary (desktop only) */}
      <Grid
        item
        size={{ xs: 12, md: 4 }}
        sx={{ display: { xs: "none", md: "block" } }}
      >
        <Box sx={{ position: "sticky", top: 20 }}>
          <Paper sx={{ p: 3 }}>
            <Skeleton
              variant="text"
              width="50%"
              height={30}
              sx={{ mb: 2, ...skeletonProps.sx }}
              {...skeletonProps}
            />
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="text"
                width="100%"
                height={20}
                sx={{ mb: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
            ))}
            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
              <Skeleton
                variant="text"
                width="100%"
                height={30}
                sx={{ mb: 2, ...skeletonProps.sx }}
                {...skeletonProps}
              />
              <Skeleton
                variant="rectangular"
                height={48}
                sx={{ borderRadius: 1, ...skeletonProps.sx }}
                {...skeletonProps}
              />
            </Box>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  </Container>
);
