import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import { Search, FilterList } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";

function SearchBar() {
  const { theme, isAccessible } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Paper
        elevation={isAccessible ? 0 : 3}
        sx={{
          p: 2,
          bgcolor: theme.palette.background.paper,
          border: isAccessible
            ? `2px solid ${theme.palette.primary.main}`
            : "none",
        }}
      >
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            placeholder="Search for products, services, or merchants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => navigate("/browse")}
                      title="Advanced Filters"
                      sx={{
                        color: theme.palette.primary.main,
                        "&:hover": {
                          bgcolor: `${theme.palette.primary.main}15`,
                        },
                      }}
                    >
                      <FilterList />
                    </IconButton>
                    <IconButton
                      type="submit"
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        ml: 1,
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: theme.palette.background.default,
              },
            }}
          />
        </form>
      </Paper>
    </Container>
  );
}

export default SearchBar;
