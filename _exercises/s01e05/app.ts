import express from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import { CENSOR_SYSTEM_PROMPT } from './constants';

interface ReportPayload {
    task: string;
    apikey: string;
    answer: string;
}

const app = express();
const port = 3000;

// Constants moved to a separate configuration object
const CONFIG = {
    API_KEY: process.env.MY_AI_DEV_API_KEY || '',
    URLS: {
        CENZURA: `https://centrala.ag3nts.org/data/${process.env.MY_AI_DEV_API_KEY || ''}/cenzura.txt`,
        REPORT: 'https://centrala.ag3nts.org/report',
        LLAMA: 'https://llama3.rafsaw.workers.dev/'
    },
    TIMEOUT: 30000
} as const;

// Service class to handle API operations
class CensorService {
    private static async fetchData(url: string): Promise<string> {
        try {
            const response = await axios.get(url, {
                headers: { 'Accept': 'text/plain' }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    private static async censorData(input: string): Promise<string> {
        try {
            console.log("Starting censoring process...");
            const response = await axios.post(
                CONFIG.URLS.LLAMA, 
                {
                    prompt: input,
                    system: this.getCensorSystemPrompt()
                },
                { timeout: CONFIG.TIMEOUT }
            );
            
            console.log("Censoring completed");
            return response.data.response.response;
        } catch (error) {
            if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
                console.error(`Request timed out after ${CONFIG.TIMEOUT/1000} seconds`);
            }
            console.error('Error censoring data:', error);
            throw error;
        }
    }

    private static async sendReport(data: string): Promise<void> {
        const payload: ReportPayload = {
            task: 'CENZURA',   
            apikey: CONFIG.API_KEY,
            answer: data
        };

        try {
            const response = await axios.post(CONFIG.URLS.REPORT, payload);
            console.log('API Response:', response.data);
        } catch (error) {
            throw new Error(`Failed to send report: ${error}`);
        }
    }

    private static getCensorSystemPrompt(): string {
        // console.log("CENSOR_SYSTEM_PROMPT: ", CENSOR_SYSTEM_PROMPT);
        return CENSOR_SYSTEM_PROMPT;
    }

    public static async process(): Promise<void> {
        try {
            const data = await this.fetchData(CONFIG.URLS.CENZURA);
            console.log("Input data: ", data);
            
            const censoredData = await this.censorData(data);
            console.log("Censored Data: ", censoredData);
            
            await this.sendReport(censoredData);
        } catch (error) {
            console.error('An error occurred:', error);
            throw error; // Re-throw to handle it in the calling code if needed
        }
    }
}

// Main execution
CensorService.process().catch(error => {
    console.error('Application failed:', error);
    process.exit(1);
});