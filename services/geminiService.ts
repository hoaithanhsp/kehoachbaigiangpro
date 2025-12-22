import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LessonInput, LessonPlanResponse, SchoolLevel } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const getSchoolLevelText = (level: SchoolLevel): string => {
  switch (level) {
    case 'primary': return 'Tiểu học';
    case 'secondary': return 'Trung học cơ sở (THCS)';
    case 'high': return 'Trung học phổ thông (THPT)';
    case 'university': return 'Đại học/Cao đẳng';
    default: return 'Trung học cơ sở';
  }
};

const lessonPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        topic: { type: Type.STRING },
        weakness: { type: Type.STRING },
        proposal: { type: Type.STRING },
      },
      required: ["subject", "topic", "weakness", "proposal"],
    },
    methods: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "description", "steps"],
      },
    },
    games: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          duration: { type: Type.STRING },
          type: { type: Type.STRING },
          objective: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "duration", "type", "objective", "steps"],
      },
    },
    simulation: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        code: { type: Type.STRING },
      },
    },
    fullPlanHtml: { type: Type.STRING },
  },
  required: ["summary", "methods", "games", "fullPlanHtml"],
};

const FALLBACK_MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];

export const generateLessonPlan = async (input: LessonInput, apiKey: string, model: string): Promise<LessonPlanResponse> => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare content parts
  const parts: any[] = [];

  // Add file if exists
  if (input.fileBase64 && input.mimeType) {
    const base64Data = input.fileBase64.split(',')[1] || input.fileBase64;
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: input.mimeType
      }
    });
  }

  // Combine selected competencies with custom competency
  const allCompetencies = [...input.config.teachingFocus];
  if (input.config.customCompetency && input.config.customCompetency.trim() !== '') {
    allCompetencies.push(input.config.customCompetency);
  }

  const prompt = `
    THÔNG TIN LỚP HỌC:
    - Cấp học: ${getSchoolLevelText(input.config.schoolLevel)}
    - Lớp: ${input.config.grade || 'Không xác định'}
    - Môn học: ${input.config.subject}
    - Quy mô: ${input.config.classSize}
    - Thời lượng: ${input.config.timeConstraint} phút
    - Thiết bị: ${JSON.stringify(input.config.resources)} ${input.config.customResource ? ', ' + input.config.customResource : ''}
    - Công nghệ/Ứng dụng mong muốn: ${input.config.techApps || 'Tự đề xuất phù hợp'}
    - Tích hợp liên môn: ${input.config.integration || 'Không yêu cầu'}
    - Mục tiêu phát triển năng lực: ${allCompetencies.join(', ')}
    
    YÊU CẦU:
    1. Phân tích nội dung và đề xuất cải tiến.
    2. fullPlanHtml phải chứa danh sách các thẻ <div class="change-block type-add">...</div> hoặc <div class="change-block type-modify">...</div>.
    3. Bên trong change-block, hãy dùng <h4 class="location">...</h4>, <div class="instruction">...</div>, <div class="content">...</div>.
    4. TUYỆT ĐỐI CHÚ Ý: Các công thức Toán PHẢI dùng định dạng LaTeX (ví dụ $\\\\frac{a}{b}$), KHÔNG dùng ký tự Unicode để đảm bảo khi copy sang Word có thể convert được.
  `;

  parts.push({ text: prompt });

  // Determine model order
  const modelsToTry = [model, ...FALLBACK_MODELS.filter(m => m !== model)];

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    try {
      console.log(`Trying model: ${currentModel}`);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: lessonPlanSchema,
          temperature: 0.5,
        }
      });

      if (response.text) {
        try {
          return JSON.parse(response.text) as LessonPlanResponse;
        } catch (e) {
          console.error(`JSON Parse Error with ${currentModel}:`, e);
          const cleanText = response.text.replace(/[\u0000-\u001F]+/g, "");
          return JSON.parse(cleanText) as LessonPlanResponse;
        }
      }
      throw new Error("AI trả về phản hồi rỗng.");
    } catch (error: any) {
      console.error(`Model ${currentModel} failed:`, error);
      lastError = error;
      // Continue to next model
    }
  }

  // If we get here, all models failed
  if (lastError) {
    if (lastError.message && lastError.message.includes("429")) {
      throw new Error("429 RESOURCE_EXHAUSTED: Hệ thống đang quá tải, vui lòng thử lại sau hoặc đổi API Key.");
    }
    throw lastError;
  }

  throw new Error("Không thể tạo giáo án sau khi thử tất cả các model.");
};