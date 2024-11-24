import { OpenAIService } from './services/OpenAIService';
import { ApiService } from './services/ApiService';
import type { CalibrationData } from './types';  

const MY_AI_DEV_API_KEY = process.env.MY_AI_DEV_API_KEY || '';
const REPORT_API_URL = 'https://centrala.ag3nts.org/report';
const JSON_URL = `https://centrala.ag3nts.org/data/${MY_AI_DEV_API_KEY}/json.txt`;

function calculateSum(question: string): number {
    const numbers = question.match(/\d+/g);
    if (numbers?.length !== 2) {    
        throw new Error(`Invalid question format: ${question}`);
    }
    
    return numbers.reduce((sum, num) => sum + parseInt(num), 0);
}

async function processTestData(data: CalibrationData, openAIService: OpenAIService): Promise<void> {
    for (const item of data["test-data"]) {
        const calculatedAnswer = calculateSum(item.question);
        if (calculatedAnswer !== item.answer) {
            item.answer = calculatedAnswer;
        }

        if (item.test) {
            const response = await openAIService.getResponse(item.test.q);
            if (response !== item.test.a) {
                item.test.a = response;
            }
        }
    }
}

async function main() {
    try {
        const apiService = new ApiService(MY_AI_DEV_API_KEY, REPORT_API_URL, JSON_URL);
        const openAIService = new OpenAIService();

        const data = await apiService.fetchCalibrationData();
        data.apikey = MY_AI_DEV_API_KEY;

        await processTestData(data, openAIService);
        await apiService.sendReport(data);
    } catch (error) {
        console.error('Application error:', error);
        process.exit(1);
    }
}

main();