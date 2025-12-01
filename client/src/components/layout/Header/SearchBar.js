import React, { useState } from "react";
import { Box, InputBase, IconButton, Paper, alpha } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

function SearchBar({ onSearch, placeholder = "Search..." }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 600,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        "&:hover": {
          backgroundColor: theme.palette.background.default,
          borderColor: theme.palette.primary.main,
        },
        "&:focus-within": {
          backgroundColor: theme.palette.background.default,
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <IconButton
        type="submit"
        sx={{
          p: "10px",
        }}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          "& .MuiInputBase-input": {
            "&::placeholder": {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
          },
        }}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputProps={{ "aria-label": "search products" }}
      >
        {query && (
          <IconButton
            onClick={handleClear}
            sx={{ p: "10px" }}
            aria-label="clear search"
          >
            <ClearIcon />
          </IconButton>
        )}
      </InputBase>
    </Paper>
  );
}

export default SearchBar;
