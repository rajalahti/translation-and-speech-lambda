// In this file, we are going to create a function that will make a request to the API and return the response.
//  The function will take the text to translate as a parameter.
// The app uses environment variables to store the API key.

// 1. Use fetch api to make a request to the API.
// 2. Use the text parameter as the body of the request and an optional save parameter if the translation should be saved.
// 3. Use the API key as the value of the x-api-key header.
// 4. Return the response from the API.

const endpoint = process.env.REACT_APP_API_ENDPOINT;

export const translate = async (text, language, save, storyType, prompt, storyId) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
    body: JSON.stringify({ text: text, language: language, save: save, storyType: storyType, prompt: prompt, storyId: storyId }),
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

export const generateStory = async (prompt, storyType, storyId) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
    body: JSON.stringify({ prompt: prompt, storyType: storyType, storyId: storyId }),
  };

  try {
    const response = await fetch(endpoint + "/generate-story", options);
    let data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error);
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
    throw new Error(error);
  }
};

// Get all stories from the api, use lastEvaluatedKey for pagination

// Random integer between 1 and 4 to get a random image for the story
const randomImage = (storytype) => {
  let randomInteger =  Math.floor(Math.random() * 4) + 1;
  return `images/${storytype}-story-${randomInteger}.jpg`
};

export const getStories = async (lastEvaluatedKey) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
  };

  let queryParams = lastEvaluatedKey ? "?lastEvaluatedKey=" + lastEvaluatedKey : "";

  try {
    const response = await fetch(
      endpoint + "/stories" + queryParams,
      options
    );
    const data = await response.json();
    // Add a random image to each story
    const storiesWithImages = data.translations.map((story) => {
      story.image = randomImage(story.storyType);
      return story;
    });
    console.log(storiesWithImages)
    data.translations = storiesWithImages;
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

// Get a story by id
export const getStoryById = async (id) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
  };

  try {
    const response = await fetch(endpoint + "/stories/" + id, options);
    const data =  await response.json();
    return data.story;
  } catch (error) {
    throw new Error(error);
  }
};