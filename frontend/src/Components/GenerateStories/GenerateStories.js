/*  
    This component is used to generate stories for the user.
    It is used in the App.
    It uses the MUI components Typography, Button, TextField, Box
    It uses the  functions GenerateStories, getAudio, translate from Api.js
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
  translate,
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
          let translatedStory = await translate(
            storyData.story,
            "FI",
            true,
            storyType,
            prompt,
            id
          );
          console.log(translatedStory);
          //Split the story into an array of paragraphs using | as a delimiter
          setStory(translatedStory.translation);
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

  // This function translates the prompt and generates the story
  const handleStoryGeneration = async () => {
    // If propt or storyType is empty, return
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
    // Translate the prompt
    setLoadingStatus("Käännetään aihetta...");
    try {
      let translationResponse = await translate(prompt, "EN", false);
      let translatedPrompt = translationResponse.translation;
      let detectedLanguage = translationResponse.detectedLanguage;
      // If the detected language is "RU", show an error"
      if (detectedLanguage === "RU") {
        handleErrorOpen("ERROR: Russian is not supported.");
        setLoading(false);
        setLoadingStatus(false);
        resetStory();
        return;
      }
      // Generate the story, set the story
      setLoadingStatus(
        "Aihe englanniksi: " + translatedPrompt + ". Luodaan tarina..."
      );
      const storyData = await generateStory(translatedPrompt, storyType, id);
      console.log(storyData);
      setLoadingStatus("Käännetään tarinaa...");
      let translatedStory = await translate(
        storyData.story,
        "FI",
        true,
        storyType,
        prompt,
        id
      );
      console.log(translatedStory);
      setCurrentStoryPrompt(prompt);
      //Split the story into an array of paragraphs using | as a delimiter
      setStory(translatedStory.translation);
      setLoadingStatus("");
      setLoading(false);
    } catch (error) {
      console.log(error);
      // If the error status is 504, start custom error handling
      if (error.response.status === 504) {
        // If the error status is 504, start custom error handling
        customErrorHandler(id);
      } else {
        console.log(error);
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

  // If audio is not empty and story is not empty, display Player component
  // If audio is empty and story is not empty, display Button component
  // If story is empty, display nothing
  const displayPlayer = () => {
    if (audioLoading) return <CircularProgress />;
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
      <Box sx={{ my: 5, mx: 3, display: "flex", justifyContent: "start" }}>
        {displayPlayer()}
      </Box>
      {loading ? (
        <React.Fragment>
          <CircularProgress />
          <Typography
            variant="body"
            sx={{ mx: 3, mt: 2, color: "#CAB09C;", display: "block" }}
          >
            {loadingStatus}
          </Typography>
        </React.Fragment>
      ) : (
        ""
      )}
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
        <StoryDisplay story={story} prompt={currentStoryPrompt} />
      ) : (
        ""
      )}
    </Box>
  );
};
