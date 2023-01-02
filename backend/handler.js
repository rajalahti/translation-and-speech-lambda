const axios = require("axios");
const AWS = require("aws-sdk");

// exports handler that directs the request to the correct function based on the path
exports.selectFunction = async (event, context) => {
  const { path } = event;

  // use the path variable to direct the request to the correct function
  if (path === "/translate") {
    return await translate(event, context);
  } else if (path === "/speech") {
    return await speech(event, context);
  } else if (path === "/random-story") {
    return await randomStory(event, context);
  } else if (path === "/stories") {
    return await stories(event, context);
  } else if (path.startsWith("/stories")) {
    const storyId = path.split("/")[2];
    return await story(event, storyId);
  } else if (path === "/generate-story") {
    return await generateStory(event, context);
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Not found",
      }),
    };
  }
};

// General headers for cors and content type
const headers = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": process.env.SITE_URL, // You can put your site's URL here or use the wildcard *
  "Access-Control-Allow-Methods": "OPTIONS,GET", // Add methods if needed
};

const translate = async (event, context) => {
  // Get the text to be translated from the event body and get a save parameter and language
  const body = JSON.parse(event.body);
  const text = body.text;
  const save = body.save;
  const prompt = body.prompt;
  const storyType = body.storyType;
  const language = body.language;
  const storyId = body.storyId;

  try {
    // Get the DEEPL_AUTH_KEY from the environment
    const deepLKey = process.env.DEEPL_AUTH_KEY;

    // Set the options for the request to the DeepL API
    const options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${deepLKey}`,
      },
    };

    // Make the request to the DeepL API
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      `text=${encodeURIComponent(text)}&target_lang=${language}`,
      options
    );

    // Get the translated text from the response
    let translatedText = response.data.translations[0].text;

    // If the english story in text contains | characters, split the story into an array of paragraphs
    let storyEn = text;
    if (text.includes("|")) {
      storyEn = text.split("|");
    }

    // If the translated story contains | characters, split the story into an array of paragraphs
    if (translatedText.includes("|")) {
      translatedText = translatedText.split("|");
    }

    // If the save parameter is true, save the translation to DynamoDB
    if (save) {
      // Check if the story has been saved before
      const dynamoDb = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: process.env.TRANSLATIONS_TABLE,
        Key: {
          id: storyId,
        },
      };
      const result = await dynamoDb.get(params).promise();

      // If the story has been saved before, udate the story by adding the storyFi (=translatedText) and promptFi (=prompt) properties to the existing story
      if (result.Item) {
        const params = {
          TableName: process.env.TRANSLATIONS_TABLE,
          Key: {
            id: storyId,
          },
          UpdateExpression: "set storyFi = :storyFi, promptFi = :promptFi",
          ExpressionAttributeValues: {
            ":storyFi": translatedText,
            ":promptFi": prompt,
          },
        };
        await dynamoDb.update(params).promise();
      } else {
        // If the story has not been saved before, save the story to DynamoDB
        const params = {
          TableName: process.env.TRANSLATIONS_TABLE,
          Item: {
            id: storyId,
            promptFi: prompt,
            storyType: storyType,
            storyEn: storyEn,
            storyFi: translatedText,
          },
        };
        await dynamoDb.put(params).promise();
      }
    }

    // Return the translated text and the id of the translation
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ translation: translatedText }),
    };
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that indicates an error
      return {
        headers: headers,
        error: `Server responded with a ${error.response.status} error`,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        headers: headers,
        error: "No response was received from the server",
      };
    } else {
      // Something else went wrong
      return {
        headers: headers,
        error: error.message,
      };
    }
  }
};

const speech = async (event) => {
  const polly = new AWS.Polly();

  // Parse the event body
  const body = JSON.parse(event.body);
  let text, id;
  try {
    text = body.text;
    id = body.id;
  } catch (error) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({
        error: "Invalid request body",
      }),
    };
  }

  // Set the parameters for the AWS Polly request
  const params = {
    OutputFormat: "mp3",
    VoiceId: "Suvi",
    Text: text,
    Engine: "neural",
    TextType: "text",
    LanguageCode: "fi-FI",
  };

  let result;
  try {
    // Synthetize the text to speech using AWS Polly
    result = await polly.synthesizeSpeech(params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: "Error translating text",
      }),
    };
  }

  // Save the audio to S3 as an mp3 file with the id as the name
  const s3 = new AWS.S3();
  const s3Params = {
    Bucket: process.env.AUDIO_BUCKET,
    Key: `${id}.mp3`,
    Body: result.AudioStream,
    ContentType: "audio/mpeg",
  };

  try {
    await s3.putObject(s3Params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: "Error saving audio to S3",
      }),
    };
  }

  const url = `https://${process.env.AUDIO_BUCKET}.s3.amazonaws.com/${id}.mp3`;

  // Check if the story has been saved to DynamoDB
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const getParams = {
    TableName: process.env.TRANSLATIONS_TABLE,
    Key: {
      id: id,
    },
  };

  let savedStory;
  try {
    savedStory = await dynamoDb.get(getParams).promise();
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: "Error getting the story from DynamoDB",
      }),
    };
  }

  // If the story has been saved to DynamoDB, add the url of the audio file to the story
  if (savedStory.Item) {
    // Update the story in DynamoDB

    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const updateParams = {
      TableName: process.env.TRANSLATIONS_TABLE,
      Key: {
        id: id,
      },
      UpdateExpression: "set audio = :audio",
      ExpressionAttributeValues: {
        ":audio": url,
      },
    };

    try {
      await dynamoDb.update(updateParams).promise();
    } catch (error) {
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({
          error: "Error adding the audio url to the story in DynamoDB",
        }),
      };
    }
  }

  // Return the url of the audio file
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      url: url,
    }),
  };
};

// function that fetches a totally random translation from DynamoDB
const randomStory = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  // Get the translations from DynamoDB
  const params = {
    TableName: process.env.TRANSLATIONS_TABLE,
  };

  let result;
  try {
    result = await dynamoDb.scan(params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: "Error fetching translations",
      }),
    };
  }

  // Get a random story from the array
  const randomIndex = Math.floor(Math.random() * result.Items.length);
  const story = result.Items[randomIndex];

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      story,
    }),
  };
};

// function that fetches 10 random translations from DynamoDB with pagination and filters with storyType
const stories = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  // Get storyType from the query string parameters
  let storyType;
  if (event.queryStringParameters && event.queryStringParameters.storyType) {
    storyType = event.queryStringParameters.storyType;
  }

 // Create params for the DynamoDB scan
  const params = {
    TableName: process.env.TRANSLATIONS_TABLE,
    Limit: 10,
  };

  // If storyType is set, add it to the params
  if (storyType) {
    params.FilterExpression = "storyType = :storyType";
    params.ExpressionAttributeValues = {
      ":storyType": storyType,
    };
  }

  // if the events query string parameters contain a lastEvaluatedKey, add it to the params
  if (
    event.queryStringParameters &&
    event.queryStringParameters.lastEvaluatedKey
  ) {
    params.ExclusiveStartKey = {
      id: event.queryStringParameters.lastEvaluatedKey,
    };
  }

  let result;
  try {
    result = await dynamoDb.scan(params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        params: params,
        error: "Error fetching translations",
      }),
    };
  }

  // Get a random translation from the array
  const translations = result.Items;

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      translations,
      lastEvaluatedKey: JSON.stringify(result.LastEvaluatedKey),
    }),
  };
};

// function that fetchet a story by id from DynamoDB
const story = async (event, storyId) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  // Get the story from DynamoDB with id
  const params = {
    TableName: process.env.TRANSLATIONS_TABLE,
    Key: {
      id: storyId,
    },
  };

  let result;
  try {
    result = await dynamoDb.get(params).promise();

    // return the story
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        story: result.Item,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: "Error fetching story",
      }),
    };
  }
};

// A function that uses axios to fetch a random story by calling OpenAI's API (model: davinci-3)
const generateStory = async (event) => {
  const body = JSON.parse(event.body);

  const prompt = body.prompt;
  const storyType = body.storyType;
  const storyId = body.storyId;

  try {
    // Get the OPENAI_API_KEY from the environment
    const openAIKey = process.env.OPENAI_API_KEY;

    // Make the request to the OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: `You are a storyteller. Tell a ${storyType} story about this subject: ${prompt}`,
        temperature: 0.9,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${openAIKey}`,
        },
      }
    );

    // Get the response from the OpenAI API
    let story = response.data.choices[0].text;

    // Split the story into an array of paragraphs by usin the \n\n characters
    story = story.split("\n\n");
    story = story.filter((item) => item !== "");

    // Save the story to DynamoDB
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: process.env.TRANSLATIONS_TABLE,
      Item: {
        id: storyId,
        storyType: storyType,
        promptEn: prompt,
        storyEn: story,
      },
    };

    try {
      await dynamoDb.put(params).promise();
    } catch (error) {
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({
          error: "Error saving the story to DynamoDB",
        }),
      };
    }

    // Combine the story again for translation, replace put a | between paragraphs
    story = story.join(" | ");

    // Return the story
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ story: story, prompt: prompt }),
    };
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that indicates an error
      return {
        statusCode: error.response.status,
        headers: headers,
        body: JSON.stringify({
          error: `Server responded with a ${error.response.status} error`,
        }),
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({
          error: "No response was recieved from server",
        }),
      };
    } else {
      // Something else went wrong
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({
          error: error.message,
        }),
      };
    }
  }
};
