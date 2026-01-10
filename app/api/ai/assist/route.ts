import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
// Note: In a real app, ensure GEMINI_API_KEY is in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { title, category, role } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            // Fallback mock response if no key is present (for demo purposes)
            return NextResponse.json({
                suggestion: `[AI MOCK] As a ${role} in the ${category} category, specifically for "${title}", I demonstrated exceptional dedication by... (Add API Key to Enable Real AI)`
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        const prompt = `
      As a professional career coach, write a concise, high-impact 2-sentence description for a student achievement.
      Context:
      - Title: ${title}
      - Category: ${category}
      - Student Role: ${role || "Participant"}
      
      The description should highlight leadership, impact, and skills suitable for a CV or LinkedIn.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const suggestion = response.text();

        return NextResponse.json({ suggestion });
    } catch (error) {
        console.error("AI Error:", error);
        // Fallback for demo/network issues
        return NextResponse.json({
            suggestion: `[AI MOCK] Describes the achievement clearly, highlighting leadership and impact. (System Note: AI service unreachable)`
        });
    }
}
