import express from 'express';
import { OpenAIService } from './OpenAIService';
import type { ChatCompletionMessageParam, ChatCompletionChunk } from "openai/resources/chat/completions";
import type OpenAI from 'openai';
import fs from 'fs';

/*
Start Express server
*/
const app = express();
const port = 3000;
app.use(express.json());
app.listen(port, () => console.log(`Server running at http://localhost:${port}. Listening for POST /api/chat requests`));

const openaiService = new OpenAIService();
let previousSummarization = "";

// Function to generate summarization based on the current turn and previous summarization
async function generateSummarization(userMessage: ChatCompletionMessageParam, assistantResponse: ChatCompletionMessageParam): Promise<string> {
  const summarizationPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: `Please summarize the following conversation in a concise manner, incorporating the previous summary if available:
<previous_summary>${previousSummarization || "No previous summary"}</previous_summary>
<current_turn> User: ${userMessage.content}\nAssistant: ${assistantResponse.content} </current_turn>
`};



  const response = await openaiService.completion([
    { ...summarizationPrompt, content: (summarizationPrompt.content as string).replace("Rafal", "Rafal") },
    { role: "user", content: "Please create/update our conversation summary." }
  ], "gpt-4o-mini", false) as OpenAI.Chat.Completions.ChatCompletion;

  
  const logFileName = `thread/logs/chat-${new Date().toISOString().split('T')[0]}.log`;
  fs.appendFile(logFileName, JSON.stringify(summarizationPrompt, null, 2) + ' - - - - ' + response.choices[0].message.content + '\n', (err) => {
    if (err) console.error('Error writing to log file:', err);
  });


  return response.choices[0].message.content ?? "No conversation history";
}

// Function to create system prompt
function createSystemPrompt(summarization: string): ChatCompletionMessageParam {
  return { 
    role: "system", 
    content: `You are Alice, a helpful assistant who speaks using as few words as possible. 

    ${summarization ? `Here is a summary of the conversation so far: 
    <conversation_summary>
      ${summarization}
    </conversation_summary>` : ''} 
    
    Let's chat!` 
  };
};

// Chat endpoint POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const systemPrompt = createSystemPrompt(previousSummarization);

    const assistantResponse = await openaiService.completion([
        systemPrompt, 
        message
    ], "gpt-4o", false) as OpenAI.Chat.Completions.ChatCompletion;

    // Generate new summarization
    previousSummarization = await generateSummarization(message, assistantResponse.choices[0].message);
    
    res.json(assistantResponse);
  } catch (error) {
    console.error('Error in OpenAI completion:', JSON.stringify(error));
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Demo endpoint POST /api/demo
app.post('/api/demo', async (req, res) => {
  const demoMessages: ChatCompletionMessageParam[] = [
    { content: "Hi! I'm Rafal", role: "user" },
    { content: "How are you?", role: "user" },
    { content: "Where do you live?", role: "user" },
    // { content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin at lacus tristique, suscipit ipsum a, ultrices nulla. Vestibulum rhoncus ex a nisl facilisis rhoncus. Sed auctor urna at ligula laoreet, vel malesuada ante hendrerit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris ut leo porta, imperdiet sapien at, imperdiet leo. Nunc a metus in neque tincidunt rutrum et a lacus. Aenean tempus est vel nibh volutpat, et porta elit tristique. Ut tortor ipsum, elementum vitae lectus sit amet, elementum cursus dui. Cras vel odio eleifend, porttitor lorem at, consequat ipsum. Proin eleifend ligula tortor, iaculis sollicitudin ante faucibus vel. Pellentesque et tincidunt libero, congue consectetur quam. Aliquam quam risus, ullamcorper sed suscipit id, pharetra id lectus. Nullam quis nisl vulputate, elementum libero non, cursus felis. Nullam sagittis velit magna. Vestibulum a lectus condimentum tellus accumsan convallis vitae in elit. Duis vestibulum diam sagittis purus sodales condimentum. Fusce eu luctus sem. Aliquam at finibus velit, in varius nibh. Nunc ligula tellus, efficitur vel lacinia at, mollis non tellus. Nam imperdiet tincidunt quam scelerisque bibendum. Maecenas maximus purus metus, vel venenatis orci porta at. Vivamus pretium sit amet enim in vulputate. Donec id elit ultricies, hendrerit nisi ut, aliquet nisi. Maecenas placerat luctus mi, eu commodo nunc blandit ac. Sed malesuada convallis est sit amet iaculis. Duis quis nisl vitae tellus mattis scelerisque. Praesent lacinia aliquet magna a ultrices. Phasellus condimentum, urna nec blandit pretium, tellus odio vulputate purus, vitae tristique leo nibh eget ipsum. Praesent felis metus, dapibus id rhoncus a, interdum in tortor. Proin volutpat fermentum tempor. Vivamus pellentesque luctus est, ut gravida mauris tincidunt non. Donec sem sem, rutrum eu lacus quis, iaculis euismod elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum dignissim vitae erat a tincidunt. Duis eget hendrerit erat. Aliquam tortor erat, ultrices et cursus et, pharetra et tellus. Nunc at nisl pretium, condimentum ex vel, tempus massa. Fusce accumsan erat ut ligula imperdiet pulvinar. Quisque accumsan justo eget ipsum vestibulum consequat. Vivamus dictum feugiat dolor, sit amet pharetra massa porttitor sit amet. Phasellus pulvinar nisi at lectus sodales, eget facilisis nisl tempus. Curabitur vel suscipit turpis. Quisque sodales mi eros, a pulvinar neque fringilla eget. Aenean tincidunt ligula libero, et sollicitudin nulla consequat non. Donec urna ipsum, condimentum id viverra eget, condimentum eu dui. Maecenas mattis posuere est sit amet varius. Cras feugiat neque ac metus aliquam, vel luctus nibh fermentum. Pellentesque et eros ac elit facilisis mollis at sit amet leo. Sed ac pharetra nulla, ac dictum velit.", role: "user" },
    // { content: "I wonder how much you will save from this text in system prompt :) ?", role: "user" },
    { content: "Which GPT are you?", role: "user" },
    { content: "OpenAI or Google or maybe something else?", role: "user" },
    { content: "Which version of GPT are you?", role: "user" },
    { content: "Do you know my name?", role: "user" }
  ];


  let assistantResponse: OpenAI.Chat.Completions.ChatCompletion | null = null;

  for (const message of demoMessages) {
    console.log('--- NEXT TURN ---');
    console.log('Rafal:', message.content);

    try {
      const systemPrompt = createSystemPrompt(previousSummarization);

      assistantResponse = await openaiService.completion([
          systemPrompt, 
          message
      ], "gpt-4o", false) as OpenAI.Chat.Completions.ChatCompletion;

      console.log('Alice:', assistantResponse.choices[0].message.content);

      // Generate new summarization
      previousSummarization = await generateSummarization(message, assistantResponse.choices[0].message);
    } catch (error) {
      console.error('Error in OpenAI completion:', JSON.stringify(error));
      res.status(500).json({ error: 'An error occurred while processing your request' });
      return;
    }
  }

  res.json(assistantResponse);
});