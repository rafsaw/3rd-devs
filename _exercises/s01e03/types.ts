export interface Test {
    q: string;
    a: string;
}

export interface TestDataItem {
    question: string;
    answer: number;
    test?: Test;
}

export interface CalibrationData {
    apikey: string;
    description: string;
    copyright: string;
    "test-data": TestDataItem[];
}

export interface ReportPayload {
    task: string;
    apikey: string;
    answer: CalibrationData;
}