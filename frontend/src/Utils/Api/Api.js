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

// Generate an image with storytype and id. Use id to generate a hash between 1-8
const randomImage = (storytype, id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  let randomInteger = Math.abs(hash % 8) + 1;
  return `images/${storytype}-story-${randomInteger}.png`
};

// Get all stories from the api, use lastEvaluatedKey for pagination
export const getStories = async (lastEvaluatedKey, storyType) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
  };

  // Add query parameters to the endpoint
  let lastEvaluatedKeyParam = lastEvaluatedKey ? `lastEvaluatedKey=${lastEvaluatedKey}` : "";
  let storyTypeParam = storyType ? `storyType=${storyType}` : "";

  let queryParams = "";
  if (lastEvaluatedKeyParam && storyTypeParam) {
    queryParams = `?${lastEvaluatedKeyParam}&${storyTypeParam}`;
  } else if (lastEvaluatedKeyParam) {
    queryParams = `?${lastEvaluatedKeyParam}`;
  } else if (storyTypeParam) {
    queryParams = `?${storyTypeParam}`;
  }

  try {
    const response = await fetch(
      endpoint + "/stories" + queryParams,
      options
    );
    const data = await response.json();
    // Add a random image to each story
    const storiesWithImages = data.translations.map((story) => {
      story.image = randomImage(story.storyType, story.id);
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

// POST check recaptcha
export const checkRecaptcha = async (token) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_API_KEY,
    },
    body: JSON.stringify({ token: token }),
  };

  try {
    const response = await fetch(endpoint + "/recaptcha", options);
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    throw new Error(error);
  }
}