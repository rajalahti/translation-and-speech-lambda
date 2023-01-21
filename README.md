# AI Story Generator

This is a simple story generator app. It uses GTP3 to generate stories, DeepL to translate them to Finnish and AWS Polly for text-to-speech functionality. 

You can check out the live version at https://satukone.rajalahti.me

## Tha backend
1. The backend lambda function uses DeepL Translation API to translate text into Finnish and saves it to DynamoDB table.
2. It can also generate stories using OpenAI API.
3. It uses AWS Polly to convert it into Finnish speech.
4. It can return a random story or 10 stories from DynamoDB table with pagination and filter them by story type.

- The functions can be deployed with Serverless framework to AWS by running **sls deploy**.
- The function uses an API key for DeepL translator API (free version) from AWS SSM Parameter Store.

You can add these parameters by running the following AWS CLI command:

- *aws ssm put-parameter --name DEEPL_AUTH_KEY --type String --value {DEEPL API-KEY-HERE}*
- *aws ssm put-parameter --name OPENAI_API_KEY --type String --value {OPENAI API-KEY-HERE}*

## Endpoints

 ### /translate

  - Accepts a POST request
  - Expects to recieve a body { "text": "This text will be translated into Finnish" }
  - Saves the translation to DynamoDB table
  - Return a translated text in Finnish
  
### /speech

  - Accepts a POST request
  - Expects to recieve a body { "text": "Tämä teksti on käännetty Suomeksi" }
  - Saves a text-to-speech audio mp3-tile to S3 and adds the url to the file to DynamoDB

### /stories

  - Accepts a GET request
  - Returns 10 random stories from DynamoDB table
  - Return a lastEvaluatedKey which can be used to get the next 10 stories
  - Accepts a storyType parameter for filtering
  
  ### /stories/:id

  - Accepts a GET request
  - Return the story with the matching id

### /generate-story

  - Accepts a POST request
  - Expects to recieve a body { "prompt": "Tell me a story about a boy who cried wolf." }
  - Generates a story using GTP3


## Frontend

The frontend has a story generator component where the user can choose a story type and enter a prompt. 

It also has a list of all previous generated stories.

## How to install and run

### Pre-requisites:
- Register an AWS-account
- Set UP AWS CLI V2 (https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Setup Serverless (https://www.serverless.com/framework/docs/getting-started)
- Create an account for DeepL Translator API Free version (https://www.deepl.com/pro-api?cta=header-pro-api/)
- Create an account for Open AI API (https://openai.com/api/)
- Install NodeJS (https://nodejs.org/en/)

### Deploy backend
- Add your DeepL API key to AWS SSM by running the terminal command: "aws ssm put-parameter --name DEEPL_AUTH_KEY --type String --value {DEEPL API-KEY-HERE}"
- Add your OpenAI API key to AWS SSM by running the terminal command: "aws ssm put-parameter --name OPENAI_API_KEY --type String --value {OPENAI API-KEY-HERE}"
- Change the name of the AUDIO_BUCKET (must be unique) the refenence to BucketName and SITE_URL in serverless.yml
- In backend folder run the terminal command "sls deploy" to deploy the backend lambdas
- In AWS management console make the S3 bucket and all the items public by default (mp3 files created by AWS Polly will be placed here and need to be publicly accessible)
- When the deploy finishes you will get the API key and API endpoint for the deployed API

### Run the frontend
- Open frontend folder in terminal
- npm install
- Create .env -file for environtment variables
- Add variables for REACT_APP_API_ENDPOINT and REACT_APP_API_KEY (which you got after deploying the backend with serverless)
- Run the frontend app locally by running terminal command "npm start"
- NOTE: API requests will be blocked by CORS when the request are not coming from your SITE_URL that you set before. You can bypass this by using this Chrome extension (https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en)

### Deploying the frontend
- Many options exists but one good option would be to use an S3 bucket and Cloudfront on AWS
- Follow this guide to deploy: https://youtu.be/CQ8vzm1kYkM?t=322
