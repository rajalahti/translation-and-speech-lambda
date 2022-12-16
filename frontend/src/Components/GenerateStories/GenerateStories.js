/*  
    This component is used to generate stories for the user.
    It is used in the App.
    It uses the MUI components Typography, Button, TextField, Box
    It uses the  functions GenerateStories, getAudio, translate from Api.js
*/
import React, { useState } from "react";
import { CircularProgress, Button, TextField, Box } from "@mui/material";
import { generateStory, getAudioUrl, translate } from "../../Utils/Api/Api";
import { Player } from "react-simple-player";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { StoryDisplay } from "../StoryDisplay/StoryDisplay";
import ToggleButtons from "../InputComponents/ButtonGroup";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export const GenerateStories = () => {
  const [storyType, setStoryType] = useState("childrens");
  const [story, setStory] = useState([]);
  const [storyId, setStoryId] = useState("");
  const [audio, setAudio] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");

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
    try {
      let translatedPrompt = await translate(prompt, "EN", false);
      translatedPrompt = translatedPrompt.translation;
      // Generate the story, set the story
      const storyData = await generateStory(translatedPrompt, storyType);
      console.log(storyData);
      let translatedStory = await translate(
        storyData.story,
        "FI",
        true,
        storyType
      );
      console.log(translatedStory);
      //Split the story into an array of paragraphs using | as a delimiter
      setStory(translatedStory.translation);
      setStoryId(translatedStory.id);
      setLoading(false);
    } catch (error) {
      console.log(error);
      handleErrorOpen("Ongelma tarinan luonnissa");
      setLoading(false);
    }
  };

  // This function gets the audio url for the story
  const handleAudioUrlFetch = async () => {
    // If storyId or story is empty, return
    if (storyId === "" || story === "") return;
    // Filter out empty items from the story array
    let filteredStory = story.filter((item) => item !== "");
    // Join the story array into a string
    let joinedStory = filteredStory.join(".");
    console.log(joinedStory);
    // Get the audio url
    const audioUrl = await getAudioUrl(joinedStory, storyId);
    setAudio(audioUrl);
  };

  const handleErrorOpen = (message) => {
    setError(true);
    setErrorText(message);
  };

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError(false);
    setErrorText("");
  };


  // If audio is not empty and story is not empty, display Player component
  // If audio is empty and story is not empty, display Button component
  // If story is empty, display nothing
  const displayPlayer = () => {
    if (audio !== "" && story.length > 0) {
      return (
        <Player src={audio} autoPlay={true} grey={[22, 22, 22]} height={40} />
      );
    } else if (audio === "" && story.length > 0) {
      return (
        <Button
          variant="contained"
          onClick={handleAudioUrlFetch}
          startIcon={<VolumeUpIcon />}
        >
          Kuuntele
        </Button>
      );
    } else {
      return "";
    }
  };

  const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  

  return (
    <Box sx={{ maxWidth: 1000, margin: "50px auto" }}>
      <Box sx={{ width: "100%", mb: 4, textAlign: "left", mx: 3 }}>
        <ToggleButtons storyType={storyType} setStoryType={setStoryType} />
      </Box>

      <Box
        sx={{
          mx: 3,
          marginBottom: 2,
          display: "flex",
          flexDirection: "row",
          gap: 2,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        <TextField
          id="outlined-basic"
          label="Mistä haluat kuulla tarinan?"
          placeholder="Joulupukista, joka vaihtoi poronsa alligaattoreihin ja muutti Egyptiin"
          variant="outlined"
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ flexGrow: 2 }}
        />
        <Button variant="contained" onClick={handleStoryGeneration}>
          Luo tarina
        </Button>
      </Box>
      <Box sx={{ my: 5, mx: 3, display: "flex", justifyContent: "start" }}>
        {displayPlayer()}
      </Box>
      {loading ? <CircularProgress /> : ""}
      <Snackbar open={error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {errorText}
        </Alert>
      </Snackbar>

      {story.length > 0 ? <StoryDisplay story={story} /> : ""}
    </Box>
  );
};
