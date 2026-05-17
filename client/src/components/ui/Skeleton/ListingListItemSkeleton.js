import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

const ListingListItemSkeleton = () => {
  return (
    <Card
      sx={{
        display: "flex",
        minHeight: 132,
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{
          width: { xs: 110, sm: 124 },
          aspectRatio: "4 / 3",
          flexShrink: 0,
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            p: 1.5,
            "&:last-child": { pb: 1.5 },
            overflow: "hidden",
          }}
        >
          <Skeleton
            variant="rounded"
            width={68}
            height={18}
            sx={{ borderRadius: 999, mb: 0.5 }}
          />

          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.4 }} />
          <Skeleton variant="text" width="62%" height={18} sx={{ mb: 0.5 }} />

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ mb: 0.75, minWidth: 0 }}
          >
            <Skeleton variant="circular" width={18} height={18} />
            <Skeleton variant="text" width="44%" height={18} />
            <Skeleton
              variant="rounded"
              width={58}
              height={18}
              sx={{ borderRadius: 999 }}
            />
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: "auto", pt: 0.25 }}
          >
            <Skeleton variant="text" width="36%" height={24} />
            <Stack direction="row" spacing={0.5}>
              <Skeleton variant="circular" width={30} height={30} />
              <Skeleton variant="circular" width={30} height={30} />
            </Stack>
          </Stack>

          <Skeleton variant="text" width="30%" height={18} sx={{ mt: 0.25 }} />
        </CardContent>
      </Box>
    </Card>
  );
};

export default ListingListItemSkeleton;

