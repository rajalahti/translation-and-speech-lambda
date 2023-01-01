import * as React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import useMediaQuery from "@mui/material/useMediaQuery";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function ToggleButtons({ storyType, setStoryType, variant, setLastEvaluetedKey }) {
  
  const handleChange = (event) => {
    setStoryType(event.target.value);
    if (variant === 'filter') {
      setLastEvaluetedKey(null);
    }
  };

  const matches = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  return matches ? (
    <ToggleButtonGroup
      color="primary"
      value={storyType}
      exclusive
      onChange={handleChange}
      size="medium"
    >
      {variant === 'filter' && <ToggleButton value="all">Kaikki</ToggleButton>}
      <ToggleButton value="childrens">Satu</ToggleButton>
      <ToggleButton value="fantasy">Fantasia</ToggleButton>
      <ToggleButton value="adventure">Seikkailu</ToggleButton>
      <ToggleButton value="nonfiction">Tositarina</ToggleButton>
      <ToggleButton value="thriller">Jännitys</ToggleButton>
      <ToggleButton value="horror">Kauhu</ToggleButton>
    </ToggleButtonGroup>
  ) : (
    <FormControl sx={{width: 130}} >
      <InputLabel id="demo-simple-select-label">Tarinan genre</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={storyType}
        label="Tarinan tyyppi"
        onChange={handleChange}
      >
        {variant === 'filter' && <MenuItem value="all">Kaikki</MenuItem>}
        <MenuItem value="childrens">Satu</MenuItem>
        <MenuItem value="fantasy">Fantasia</MenuItem>
        <MenuItem value="adventure">Seikkailu</MenuItem>
        <MenuItem value="nonfiction">Tositarina</MenuItem>
        <MenuItem value="thriller">Jännitys</MenuItem>
        <MenuItem value="horror">Kauhu</MenuItem>
      </Select>
    </FormControl>
  );
}
