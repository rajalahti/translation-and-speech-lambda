// In this file, we are going to create a function that will make a request to the API and return the response.
//  The function will take the text to translate as a parameter.
// The app uses environment variables to store the API key.

// 1. Use fetch api to make a request to the API.
// 2. Use the text parameter as the body of the request and an optional save parameter if the translation should be saved.
// 3. Use the API key as the value of the x-api-key header.
// 4. Return the response from the API.

const endpoint = process.env.REACT_APP_API_ENDPOINT;

export const translate = async (text, language, save) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
    body: JSON.stringify({ text: text, language: language, save: save }),
  };
  try {
    const response = await fetch(endpoint + "/translate", options);
    let data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Generate a story from the API

export const generateStory = async (prompt) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
    body: JSON.stringify({ prompt: prompt }),
  };

  try {
    const response = await fetch(endpoint + "/generate-story", options);
    let data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// Call the /speech api to get a url to the mp3 file, provide the text and id of the story
export const getAudioUrl = async (text, id) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
    body: JSON.stringify({ text: text, id: id }),
  };
  try {
    const response = await fetch(endpoint + "/speech", options);
    let data = await response.json();
    return data.url;
  } catch (error) {
    console.error(error);
  }
};

// Get all stories from the api, use lastEvaluatedKey for pagination

export const getStories = async (lastEvaluatedKey) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
  };

  try {
    const response = await fetch(
      endpoint + "/stories?lastEvaluatedKey=" + lastEvaluatedKey,
      options
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};
