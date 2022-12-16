import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function ToggleButtons({storyType, setStoryType}) {

  const handleChange = (event) => {
    setStoryType(event.target.value)
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={storyType}
      exclusive
      onChange={handleChange}
      size="medium"
    >
      <ToggleButton value="childrens">Satu</ToggleButton>
      <ToggleButton value="fantasy">Fantasia</ToggleButton>
      <ToggleButton value="adventure">Seikkailu</ToggleButton>
      <ToggleButton value="nonfiction">Tositarina</ToggleButton>
      <ToggleButton value="thriller">Jännitys</ToggleButton>
      <ToggleButton value="scary">Kauhu</ToggleButton>
    </ToggleButtonGroup>
  );
}
