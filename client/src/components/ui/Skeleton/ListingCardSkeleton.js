import { Box, Card, CardContent, Skeleton, useMediaQuery } from "@mui/material";

import { useTheme } from "../../../hooks/useTheme";

const ListingCardSkeleton = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Skeleton variant="rectangular" sx={{ width: "100%", aspectRatio: "4 / 3" }} />

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 0.75 : 1,
          pb: 1.25,
          pt: isMobile ? 1.75 : 2,
          px: isMobile ? 1.5 : 2,
          minHeight: 0,
        }}
      >
        <Skeleton variant="text" height={28} width="86%" />
        <Skeleton variant="text" height={18} width="100%" />
        <Skeleton variant="text" height={18} width="78%" />
        <Skeleton variant="text" height={18} width="56%" />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexWrap: "wrap",
            minHeight: 24,
          }}
        >
          <Skeleton variant="circular" width={14} height={14} />
          <Skeleton variant="text" width={isMobile ? "44%" : "48%"} height={18} />
          <Skeleton
            variant="rounded"
            width={68}
            height={20}
            sx={{ borderRadius: 999 }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mt: "auto",
            pt: 0.5,
            gap: 1,
          }}
        >
          <Skeleton variant="text" width="42%" height={28} />
          <Skeleton variant="text" width="30%" height={18} />
        </Box>
      </CardContent>

      <Box
        sx={{
          px: isMobile ? 1.5 : 2,
          pb: isMobile ? 1.5 : 2,
          pt: isMobile ? 1 : 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          minHeight: isMobile ? 42 : 52,
        }}
      >
        <Skeleton
          variant="rounded"
          width="100%"
          height={isMobile ? 34 : 36}
          sx={{ borderRadius: 1.25 }}
        />
        <Skeleton variant="circular" width={isMobile ? 34 : 36} height={isMobile ? 34 : 36} />
      </Box>
    </Card>
  );
};

export default ListingCardSkeleton;
