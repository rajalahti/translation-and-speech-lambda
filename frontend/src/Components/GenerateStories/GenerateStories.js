/*  
    This component is used to generate stories for the user.
    It is used in the App.
    It uses the MUI components Typography, Button, TextField, Box
    It uses the functions generateStory, getAudio from Api.js
*/
import React, { useState, useRef } from "react";
import {
  CircularProgress,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import {
  generateStory,
  getAudioUrl,
  getStoryById,
  checkRecaptcha
} from "../../Utils/Api/Api";
import { Player } from "react-simple-player";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { StoryDisplay } from "../StoryDisplay/StoryDisplay";
import ToggleButtons from "../InputComponents/ButtonGroup";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import ReCAPTCHA from "react-google-recaptcha";

// UUID generator for stories
const getUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const GenerateStories = () => {
  const [storyType, setStoryType] = useState("childrens");
  const [story, setStory] = useState([]);
  const [storyId, setStoryId] = useState("");
  const [audio, setAudio] = useState("");
  const [prompt, setPrompt] = useState("");
  const [currentStoryPrompt, setCurrentStoryPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const resetStory = () => {
    setStory([]);
    setStoryId("");
    setAudio("");
    setLoadingStatus("");
    reCaptchaRef.current.reset();
  };

  const reCaptchaRef = useRef();

  /*
    Custom error handler for 504 errors from API gateway:
    Starts a timer and after every 10 seconds makes a call to /stories/{storyId}
    to see if the story has been generated. After three tries, the error is shown to the user.
  */
  const customErrorHandler = async (id) => {
    let counter = 0;
    let interval = setInterval(async () => {
      counter++;
      let storyData = "";
      while (storyData === "" || counter > 3) {
        storyData = await getStoryById(id);
        if (storyData !== "") {
          clearInterval(interval);
          //Split the story into an array of paragraphs using | as a delimiter
          const storyArray = storyData.story.split("|");
          setStory(storyArray);
          setLoading(false);
          return;
        } else {
          if (counter > 3) {
            clearInterval(interval);
            handleErrorOpen("Virhe: Palvelu ei vastaa");
            setLoading(false);
            return;
          }
        }
        counter++;
      }
    }, 10000);
  };

  // This function generates the story
  const handleStoryGeneration = async () => {
    // If prompt or storyType is empty, return
    if (prompt === "") return;
    if (storyType === "") return;

    setLoading(true);
    resetStory();
    // Get the recaptcha token
    let token = await reCaptchaRef.current.executeAsync();
    // Check the recaptcha token
    let recaptchaResponse = await checkRecaptcha(token);
    if (recaptchaResponse.success === false) {
      handleErrorOpen("Virhe: ReCAPTCHA ei onnistunut");
      setLoading(false);
      return;
    }
    
    // Generate a UUID for the story
    let id = getUUID();
    setStoryId(id);
    
    // Generate the story directly in Finnish
    setLoadingStatus("Luodaan tarina...");
    try {
      // Include instruction to generate in Finnish in the prompt
      const finnishPrompt = `Kirjoita tarina suomeksi aiheesta: ${prompt}`;
      const storyData = await generateStory(finnishPrompt, storyType, id);
      console.log(storyData);
      
      setCurrentStoryPrompt(prompt);
      
      //Split the story into an array of paragraphs using | as a delimiter
      const storyArray = storyData.story.split("|");
      setStory(storyArray);
      setLoadingStatus("");
      setLoading(false);
    } catch (error) {
      console.log(error);
      // If the error status is 504, start custom error handling
      if (error.response && error.response.status === 504) {
        // If the error status is 504, start custom error handling
        customErrorHandler(id);
      } else {
        handleErrorOpen("Virhe: Tarinan luominen epäonnistui");
        setLoading(false);
      }
    }
  };

  // This function gets the audio url for the story
  const handleAudioUrlFetch = async () => {
    setAudioLoading(true);
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
    setAudioLoading(false);
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

  const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <Box sx={{ maxWidth: 1000, margin: "50px auto" }}>
      <Box sx={{ mb: 4, textAlign: "left", mx: 3 }}>
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
        <ReCAPTCHA
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          size="invisible"
          ref={reCaptchaRef}
        />
        <Button
          variant="contained"
          onClick={handleStoryGeneration}
          disabled={loading || !prompt}
        >
          Luo tarina
        </Button>
      </Box>
      
      {/* Loading indicator and audio controls row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mx: 3, 
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        {/* Loading status */}
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={30} />
            <Typography
              variant="body2"
              sx={{ color: "#9A7F66" }}
            >
              {loadingStatus}
            </Typography>
          </Box>
        ) : (
          <Box />
        )}
        
        {/* Audio player or button */}
        {audioLoading ? (
          <CircularProgress size={30} sx={{ color: '#7c4c16' }} />
        ) : audio ? (
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: '4px', 
            padding: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: { xs: '100%', sm: 'auto' },
            ml: 'auto'
          }}>
            <Player src={audio} autoPlay={true} grey={[22, 22, 22]} height={40} />
          </Box>
        ) : story.length > 0 ? (
          <Button
            variant="contained"
            onClick={handleAudioUrlFetch}
            startIcon={<VolumeUpIcon />}
            sx={{ 
              backgroundColor: '#7c4c16',
              '&:hover': {
                backgroundColor: '#5e3a10',
              },
              minWidth: { xs: '100%', sm: 'auto' },
              ml: 'auto'
            }}
          >
            Kuuntele
          </Button>
        ) : null}
      </Box>

      <Snackbar open={error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorText}
        </Alert>
      </Snackbar>

      {story.length > 0 ? (
        <StoryDisplay 
          story={story} 
          prompt={currentStoryPrompt}
        />
      ) : (
        ""
      )}
    </Box>
  );
}
