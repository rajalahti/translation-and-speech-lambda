import React from "react";
import { Box, Typography, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import fantasy from "./fantasy.jpg";

export const Header = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundImage: `url(${fantasy})`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "85vh",
      }}
    >
      <Typography
        variant="h1"
        sx={{ position: "absolute", right: "15%", top: "3%" }}
      >
        Satukone
      </Typography>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "rgba(30, 30, 30, 0.86)",
          textAlign: "center",
          paddingTop: theme.spacing(5),
          paddingBottom: theme.spacing(5),
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <Link
          component={RouterLink}
          to="/rakenna-tarina"
          underline="hover"
          sx={{ fontSize: 32, fontWeight: 700 }}
        >
          Rakenna tarina
        </Link>
        <Link
          component={RouterLink}
          to="/vapaa-aihe"
          underline="hover"
          sx={{ fontSize: 32, fontWeight: 700 }}
        >
          Vapaa aihe
        </Link>
        <Link
          component={RouterLink}
          to="/selaa-tarinoita"
          underline="hover"
          sx={{ fontSize: 32, fontWeight: 700 }}
        >
          Selaa tarinoita
        </Link>
      </Box>
    </Box>
  );
};
