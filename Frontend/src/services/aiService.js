// src/services/aiService.js

const OPENAI_API_KEY = "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"; 

export const generateQuizData = async () => {
  // Definimos una lista de temas para que la IA elija aleatoriamente o mezcle
  const temas = [
    "Programación",
    "Desarrollo de Software",
    "Bases de Datos",
    "Redes de Computadoras",
    "Seguridad Informática",
    "Sistemas Operativos",
    "Computación en la Nube",
    "Ingeniería de Software",
    "Inteligencia Artificial",
    "Ciencia de Datos"
  ];
  
  const prompt = `Genera un JSON con 10 preguntas de trivia académica sobre las carreras de la universidad UIDE Sede Loja:
  1. TEMAS: Las preguntas deben ser conceptos básicos de: ${temas.join(", ")}. No repitas el mismo tema más de dos veces.
  2. DIFICULTAD: Deben ir de nivel introductorio (1er semestre)
  3. PREMIOS: [100, 500, 1000, 5000, 10000, 20000, 50000, 100000, 500000, 1000000].
  4. FORMATO: Devuelve SOLO el objeto JSON con esta estructura:
  {
    "questions": [
      {
        "question": "¿Pregunta sobre [Tema]?",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "prize": 100,
        "category": "Nombre de la carrera"
      }
    ]
  }`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un generador de trivias multitemáticas. No repitas preguntas de sesiones anteriores." },
          { role: "user", content: prompt + `\nSemilla aleatoria: ${Math.random()}` }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" }
      })
    });

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error al obtener preguntas:", error);
    return null;
  }
};
