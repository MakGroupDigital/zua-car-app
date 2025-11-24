'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

/**
 * API route for Gemini (Google Generative AI).
 * Expects a JSON body: { prompt: string }
 * Returns: { answer: string }
 */
export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        if (!prompt) {
            return NextResponse.json({ error: 'Prompt missing' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        return NextResponse.json({ answer });
    } catch (e: any) {
        console.error('Gemini API error:', e);
        return NextResponse.json({ error: e.message ?? 'Unexpected error' }, { status: 500 });
    }
}
