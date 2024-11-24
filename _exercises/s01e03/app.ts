import { readFileSync } from 'fs';
import { join } from 'path';
import axios from "axios";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const my_ai_dev_apiKey = process.env.MY_AI_DEV_API_KEY || '';
const report_api_url = 'https://centrala.ag3nts.org/report';
const json_url = "https://centrala.ag3nts.org/data/" + my_ai_dev_apiKey + "/json.txt";

//report_api_url
// Interface for the test object that appears in some test-data items
interface Test {
    q: string;
    a: string;
}

// Interface for each item in the test-data array
interface TestDataItem {
    question: string;
    answer: number;
    test?: Test;  // Optional property since not all items have it
}

// Main interface for the entire JSON structure
interface CalibrationData {
    apikey: string;
    description: string;
    copyright: string;
    "test-data": TestDataItem[];
}

interface ReportPayload {
    task: string;
    apikey: string;
    answer: CalibrationData;
}


function calculateSum(question: string): number {
    // Extract numbers using regular expression
    const numbers = question.match(/\d+/g);
    if (!numbers || numbers.length !== 2) {
        throw new Error(`Invalid question format: ${question}`);
    }
    
    // Convert strings to numbers and sum them
    return parseInt(numbers[0]) + parseInt(numbers[1]);
}

//read json file from url
async function readJsonFileFromUrl<T>(url: string): Promise<T> {
    const response = await axios.get(url);
    return response.data as T;
}

function readJsonFile<T>(filename: string): T {
    const filePath = join(__dirname, filename);
    const fileContent = readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
}

async function respondToQuestion(question: string): Promise<string> {
    const openai = new OpenAI();
  
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are an assistant. Respond in English. Your response must be either a full name (first and last name) or a single word. No other formats allowed." },
      { role: "user", content: question }
    ];
  
    try {
  
      const chatCompletion = await openai.chat.completions.create({
        messages,
        model: "gpt-4o-mini",
        max_tokens: 2,
        temperature: 0,
      });    
  
      if (chatCompletion.choices[0].message?.content) {
        const label = chatCompletion.choices[0].message.content.trim();
        console.log(label);
        return label
      } else {
        console.log("Unexpected response format");
        return 'other';
      }
  
    } catch (error) {
      console.error("Error in OpenAI completion:", error);
      return 'error';
    }
  }





async function main() {
    const data = await readJsonFileFromUrl<CalibrationData>(json_url);
    data.apikey = my_ai_dev_apiKey;

    for (const item of data["test-data"]) {
        const calculatedAnswer = calculateSum(item.question);
        const isCorrect = calculatedAnswer === item.answer;

        if (!isCorrect) {
            item.answer = calculatedAnswer;
            // console.log(`❌ Wrong answer! Expected ${item.answer}, got ${calculatedAnswer}`);
        }

        if (item.test) {
            const response = await respondToQuestion(item.test.q);
            if (response !== item.test.a) {
                item.test.a = response;
                // console.log(`❌ Wrong answer! Expected ${item.test.a}, got ${response}`);
            }
        }
    }
    // Create the report payload
    const reportPayload: ReportPayload = {
        task: 'JSON',
        apikey: my_ai_dev_apiKey,
        answer: data
    };
    try {
        // Send POST request to the API
        const response = await axios.post(report_api_url, reportPayload);
        console.log('API Response:', response.data);
    } catch (error) {
        console.error('Error sending report:', error);
    }    
}

main().catch(console.error);