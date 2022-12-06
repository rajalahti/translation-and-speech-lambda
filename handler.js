const axios = require('axios');
const AWS = require('aws-sdk');

exports.translate = async (event, context) => {
  // Get the text to be translated from the event body
  const body = JSON.parse(event.body);
  const text = body.text;

  try {
    // Get the DEEPL_AUTH_KEY from the environment
    const deepLKey = process.env.DEEPL_AUTH_KEY;

    // Set the options for the request to the DeepL API
    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key ${deepLKey}`,
      }
    };

    // Make the request to the DeepL API
    const response = await axios.post('https://api-free.deepl.com/v2/translate', `text=${encodeURIComponent(text)}&target_lang=fi`, options);

    // Get the translated text from the response
    const translatedText = response.data.translations[0].text;

    // Return the translated text
    return {
      statusCode: 200,
      body: JSON.stringify({translation: translatedText}),
    };
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that indicates an error
      return {
        error: `Server responded with a ${error.response.status} error`
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        error: 'No response was received from the server'
      };
    } else {
      // Something else went wrong
      return {
        error: error.message
      };
    }
  }
};

exports.speech = async (event) => {
  const polly = new AWS.Polly();

  // Get the text from the body of the AWS API Gateway request
  const { body } = event;
  let text;
  try {
    text = JSON.parse(body).text;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid request body'
      }),
    };
  }

  // Set the parameters for the AWS Polly request
  const params = {
    OutputFormat: 'mp3',
    VoiceId: 'Suvi',
    Text: text,
    Engine: 'neural',
    TextType: 'text',
    LanguageCode: 'fi-FI'
  };

  let result;
  try {
    // Translate the text using AWS Polly
    result = await polly.synthesizeSpeech(params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error translating text'
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      audio: result.AudioStream
    }),
  };
};