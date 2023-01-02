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
        backgroundPosition: {xs: 'center', sm: 'bottom', lg: 'center'},
        height: {xs: '240px', sm: '500px'}
      }}
    >
      <Typography
        variant="h1"
        sx={{ position: "absolute", right: "15%", top: {xs: '0%', sm: '3%', md: '0%' } }}
      >
        Satukone
      </Typography>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "rgba(30, 30, 30, 0.86)",
          textAlign: "center",
          paddingTop: {xs: theme.spacing(2), sm: theme.spacing(5)},
          paddingBottom: {xs: theme.spacing(2), sm: theme.spacing(5)},
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          sx={{ fontSize: {xs: 24, md: 32}, fontWeight: 700 }}
        >
          Luo tarina
        </Link>
        <Link
          component={RouterLink}
          to="/selaa-tarinoita"
          underline="hover"
          sx={{ fontSize: {xs: 24, md: 32}, fontWeight: 700 }}
        >
          Selaa tarinoita
        </Link>
      </Box>
    </Box>
  );
};
