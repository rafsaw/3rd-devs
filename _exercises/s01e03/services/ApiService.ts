import axios from "axios";
import type { CalibrationData, ReportPayload } from "../types";

export class ApiService {
    constructor(
        private apiKey: string,
        private reportApiUrl: string,
        private jsonUrl: string
    ) {}

    async fetchCalibrationData(): Promise<CalibrationData> {
        try {
            const response = await axios.get(this.jsonUrl);
            return response.data as CalibrationData;
        } catch (error) {
            throw new Error(`Failed to fetch calibration data: ${error}`);
        }
    }

    async sendReport(data: CalibrationData): Promise<void> {
        const payload: ReportPayload = {
            task: 'JSON',
            apikey: this.apiKey,
            answer: data
        };

        try {
            const response = await axios.post(this.reportApiUrl, payload);
            console.log('API Response:', response.data);
        } catch (error) {
            throw new Error(`Failed to send report: ${error}`);
        }
    }
}