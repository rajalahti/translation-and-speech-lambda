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
  "Access-Control-Allow-Origin": "*", // You can put your site's URL here or use the wildcard *
  "Access-Control-Allow-Methods": "OPTIONS,GET", // Add methods if needed
};

const translate = async (event, context) => {
  // Get the text to be translated from the event body and get a save parameter and language
  const body = JSON.parse(event.body);
  const text = body.text;
  const save = body.save;
  const language = body.language;

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

    // If the story contains | characters, split the story into an array of paragraphs
    if (translatedText.includes("|")) {
      translatedText = translatedText.split("|");
    }

    // If the save parameter is true, save the translation to DynamoDB
    if (save) {
      // Save the translation to DynamoDB
      const dynamoDb = new AWS.DynamoDB.DocumentClient();
      const params = {
        TableName: process.env.TRANSLATIONS_TABLE,
        Item: {
          id: context.awsRequestId,
          english: text,
          finnish: translatedText,
        },
      };

      await dynamoDb.put(params).promise();
    }

    // Return the translated text
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
    ContentType: "audio/mpeg"
  };

  try {
    await s3.putObject(s3Params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        error: error,
      }),
    };
  }

  // Return the url of the audio file
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      url: `https://${process.env.AUDIO_BUCKET}.s3.amazonaws.com/${id}.mp3`,
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

// function that fetches 10 random translations from DynamoDB with pagination
const stories = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  // Get the translations from DynamoDB
  const params = {
    TableName: process.env.TRANSLATIONS_TABLE,
    Limit: 10,
  };

  if (event.lastEvaluatedKey) {
    params.ExclusiveStartKey = JSON.parse(event.lastEvaluatedKey);
  }

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

// A function that uses axios to fetch a random story by calling OpenAI's API (model: davinci-3)
const generateStory = async (event) => {
  const body = JSON.parse(event.body);

  const prompt = body.prompt;

  try {
    // Get the OPENAI_API_KEY from the environment
    const openAIKey = process.env.OPENAI_API_KEY;

    // Make the request to the OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt:
          "You are a storyteller. Tell a childrens story about this subject: " +
          prompt,
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

    // Combine the story again for translation, replace put a | between paragraphs
    story = story.join(" | ");

    // Return the story
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ story: story }),
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
