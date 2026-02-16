import {
  Box,
  Typography,
  Grid,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
} from "@mui/material";

import ListingCard from "./ListingCard";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../constants/listingConstant";
import { useTheme } from "../../../hooks/useTheme";

const ListingGrid = ({
  listings = [],
  pagination = {},
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  onToggle,
  showActions = false,
  emptyMessage = "No listings found.",
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    currentPage = 1,
    totalPages = 1,
    limit = DEFAULT_PAGE_SIZE,
  } = pagination;

  // Ensure limit is one of the valid options to prevent MUI warning
  const safeLimit = PAGE_SIZE_OPTIONS.includes(limit)
    ? limit
    : DEFAULT_PAGE_SIZE;

  if (!listings || listings.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="40vh"
      >
        <Typography variant="h6" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid
        container
        spacing={isMobile ? 0.5 : 3}
        sx={{ alignItems: "stretch" }}
      >
        {listings.map((listing) => (
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={listing._id}>
            <ListingCard
              listing={listing}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          </Grid>
        ))}
      </Grid>

      {/** Pagination Controls */}
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          mt={4}
        >
          {/* Items per page */}
          <FormControl size={isMobile ? "small" : "medium"}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={safeLimit}
              label="Items per page"
              onChange={(e) => onLimitChange(e.target.value)}
              sx={{
                minWidth: isMobile ? 120 : 150,
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <MenuItem key={size} value={size}>
                  {size} items
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/** Pagination */}
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={onPageChange}
            color="primary"
            size={isMobile ? "small" : "large"}
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
            siblingCount={isMobile ? 0 : 1}
          />
        </Box>
      )}
    </Box>
  );
};

export default ListingGrid;
