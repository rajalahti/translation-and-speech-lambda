import { createTheme } from "@mui/material/styles";

// Material-ui theme definitions
export const Theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#33a153",
      main: "#CAB09C",
      dark: "#CAB09C",
      contrastText: "#fff",
    },
    secondary: {
      light: "#33a153",
      main: "#008A28",
      dark: "#00601c",
      contrastText: "#000",
    },
  },
  typography: {
    h1: {
      fontFamily: "Dancing Script",
      fontSize: 143,
      fontWeight: 400,
      color: "#CAB09C",
      '@media (max-width:900px)': {
        fontSize: 80,
      },
      '@media (max-width:600px)': {
        fontSize: 60,
      },
    },
  },
});

