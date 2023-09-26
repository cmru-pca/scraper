import * as fs from 'fs/promises';

export const delay = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const readJsonFile = async (fileName: string): Promise<any> => {
    return JSON.parse(await fs.readFile(fileName, 'utf-8'));
}

export const writeJsonFile = async (fileName: string, data: any): Promise<unknown> => {
    return fs.writeFile(fileName, JSON.stringify(data, null, 2), 'utf-8');
}
