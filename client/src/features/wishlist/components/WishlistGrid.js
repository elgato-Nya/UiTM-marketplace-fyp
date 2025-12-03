import { Grid } from "@mui/material";
import WishlistItem from "./WishlistItem";

const WishlistGrid = ({
  items = [],
  onRemove,
  onMoveToCart,
  isLoading = false,
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
          <WishlistItem
            item={item}
            onRemove={onRemove}
            onMoveToCart={onMoveToCart}
            isLoading={isLoading}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default WishlistGrid;
