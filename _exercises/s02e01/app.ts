import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIService } from './OpenAIService';
import { AssistantService } from './AssistantService';
import { LangfuseService } from './LangfuseService';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import multer from 'multer';
import cors from 'cors';
import { Readable } from 'stream';
import { ReadableStream as WebReadableStream } from 'stream/web';

import fs from 'fs/promises';
import path from 'path';

import axios from 'axios';

const app = express();
const port = 3000;
// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB in bytes
  }
});

app.use(express.json());
// app.use(cors({
//     origin: 'http://localhost:5173', // Allow requests from this origin
//     methods: ['GET', 'POST'],        // Allowed HTTP methods
//     credentials: true,               // Allow credentials if needed
// }));

const langfuseService = new LangfuseService();
const openaiService = new OpenAIService();
const assistantService = new AssistantService(openaiService, langfuseService);

// Add this function before your endpoints
async function readFilesFromDirectory(directoryPath: string) {
  try {
    const files = await fs.readdir(directoryPath);
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        const content = await fs.readFile(filePath);
        return {
          name: file,
          content,
          path: filePath
        };
      })
    );
    return fileContents;
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
}

// # Transcribe audio files
// Chat endpoint POST /api/process
app.post('/api/process', async (req, res) => {
  // const { message } = req.body;
  // const { directoryPath } = req.body;
  // const directoryPath = './src'; // Hardcoded path - change this to your desired folder path
  const directoryPath = 'C:\\Users\\rafal\\Downloads\\s02e01przesluchania'; // Windows path with escaped backslashes

  try {
    const files = await readFilesFromDirectory(directoryPath);

        // Loop through each file
        for (const file of files) {
          console.log('Processing file:', file.name);
          
          // Check if it's an audio file (add more extensions if needed)
          if (file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
            // Here you can process each audio file
            // For example, send it to OpenAI's Whisper API
            console.log('Found audio file:', file.path);
            // const fileStream = Readable.from(file.content);
            const fileBuffer = Buffer.from(file.content);

            // Pass the file buffer to the transcription service
            // RS> OPTION Use Whisper-1 (transcribe for OpenAI) or Whisper-large-v3 (transcribeGroq for Groq)
            const transcription = await openaiService.transcribe(fileBuffer);
            
          

            // Create output filename by replacing audio extension with .txt
            const txtPath = file.path.replace(/\.(mp3|wav|m4a|ogg)$/i, '.txt');
            await fs.writeFile(txtPath, transcription);
            console.log(`Saved transcription to ${txtPath}`);
            console.log(` - - - `);
          }
        }

        res.json({ 
          message: `Processed ${files.length} files`,
          files: files.map(f => f.name) 
        });
        

    // res.status(200).send("OK");
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Failed to read files' });
  }

});

async function processDataPoligon(apiKey: string, taskToken: string) {
  try {
    console.log("Processing data..." );
    console.log(`API Key: ${apiKey}`);
    console.log(`Task Token: ${taskToken}`);

    
      // Get data from dane.txt
      const response = await axios.get('https://poligon.aidevs.pl/dane.txt');
      const data = response.data.split('\n').filter((item: string) => item.trim() !== '');


      console.log(data);

      // Prepare the POST request
      const payload = {
        task: taskToken,    // Sent as string
        apikey: apiKey,     // Sent as string
        answer: data        // Array from splitting dane.txt content
      };
       
      console.log(payload);

      // Send POST request to verify endpoint
      const result = await axios.post('https://poligon.aidevs.pl/verify', payload);
      return result.data;

  } catch (error) {
      console.error('Error:', error);
      throw error;
  }
}

// # Send exercise response to the server - centrala.ag3nts.org
async function processData(apiKey: string, taskToken: string) {
  try {
    //S02E01 — Audio i interfejs głosowy
    // const exerciseResponse: string = 'Profesora Stanisława Łojasiewicza 6';  
    const exerciseResponse: string = '';  

    console.log("Processing data..." );
    console.log(`API Key: ${apiKey}`);
    console.log(`Task Token: ${taskToken}`);
    console.log(`Exercise Response: ${exerciseResponse}`);


      // Prepare the POST request
      const payload = {
        task: taskToken,    // Sent as string
        apikey: apiKey,     // Sent as string
        answer: exerciseResponse        // Sent as string
      };
       
      console.log(payload);

      // Send POST request to verify endpoint
      const result = await axios.post('https://centrala.ag3nts.org/report', payload);
      return result.data;

  } catch (error) {
      console.error('Error:', error);
      throw error;
  }
}

app.post('/api/process-data/:apiKey/:taskToken', async (req, res) => {
  try {
    console.log("API - Processing data ..." );
    const { apiKey, taskToken } = req.params;
    const result = await processData(apiKey, taskToken);
    console.log(result);
    res.json({ result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process data' });
  }
});



app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

