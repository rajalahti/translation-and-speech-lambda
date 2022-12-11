/*  
    This component is used to generate stories for the user.
    It is used in the App.
    It uses the MUI components Typography, Button, TextField, Box
    It uses the  functions GenerateStories, getAudio, translate from Api.js
*/
import React, { useState, useEffect } from "react";
import { Typography, Button, TextField, Box } from "@mui/material";
import { generateStory, getAudioUrl, translate } from "../../Utils/Api/Api";
import {Player} from 'react-simple-player';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export const GenerateStories = () => {
  const [story, setStory] = useState([]);
  const [storyId, setStoryId] = useState("");
  const [audio, setAudio] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const resetStory = () => {
    setStory([]);
    setStoryId("");
    setAudio("");
  };

  // This function translates the prompt and generates the story
  const handleStoryGeneration = async () => {
    setLoading(true);
    resetStory();
    // If propt is empty, return
    if (prompt === "") return;
    // Translate the prompt
    let translatedPrompt = await translate(prompt, 'EN', false);
    translatedPrompt = translatedPrompt.translation;
    // Generate the story, set the story
    const storyData = await generateStory(translatedPrompt);
    console.log(storyData)
    let translatedStory = await translate(storyData.story, 'FI', true);
    console.log(translatedStory);
    //Split the story into an array of paragraphs using | as a delimiter
    setStory(translatedStory.translation);
    setStoryId(translatedStory.id);
    setLoading(false);
  };

  // This function gets the audio url for the story
  const handleAudioUrlFetch = async () => {
    // If storyId or story is empty, return
    if (storyId === "" || story === "") return;
    // Filter out empty items from the story array
    let filteredStory = story.filter((item) => item !== "");
    // Join the story array into a string
    let joinedStory = filteredStory.join(".");
    console.log(joinedStory)
    // Get the audio url
    const audioUrl = await getAudioUrl(joinedStory, storyId);
    setAudio(audioUrl);
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '80px auto' }}>
      <Box
        sx={{ mx: 3, marginBottom: 2, display: "flex", flexDirection: "row", gap: 2, justifyContent: "center", alignItems:"stretch" }}
      >
        <TextField
          id="outlined-basic"
          label="Mistä haluat kuulla tarinan?"
          placeholder="Joulupukista, joka vaihtoi poronsa alligaattoreihin ja muutti Egyptiin"
          variant="outlined"
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ flexGrow: 2}}
        />
        <Button
          variant="contained"
          onClick={handleStoryGeneration}
        >
          Luo tarina
        </Button>
      </Box>
      <Box sx={{my: 5, mx: 3, display: 'flex', justifyContent: 'start'}}>
      {audio ? <Player src={audio} autoPlay={true} grey={[22,22,22]} height={40} /> : <Button variant="contained" onClick={handleAudioUrlFetch} startIcon={<VolumeUpIcon />}>Kuuntele</Button> }
      </Box>
       <Box sx={{mt: 5, mx: 3, background: '#1E1B1B', py:5, border: '3px solid #7E6C5E', borderRadius: 4}}>
        {Array.isArray(story) && story.map((paragraph, index) => (
        <Typography key={index} variant="body" sx={{ mb: 2, color: '#CAB09C', fontSize: '1.25rem', display: 'block', textAlign: 'left', px:3, lineHeight:1.125 }}>
          { paragraph }
        </Typography>
        ))}
      </Box>
    </Box>
  );
};
