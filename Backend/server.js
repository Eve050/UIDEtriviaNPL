import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Crear carpeta /data si no existe
const dataDir = path.join(__dirname, '..', 'Frontend', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Endpoint para guardar JSON de preguntas generadas por IA
 * POST /api/save-questions
 */
app.post('/api/save-questions', (req, res) => {
  try {
    const { questions, filename } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'El campo "questions" es obligatorio y debe ser un array'
      });
    }

    // Generar nombre de archivo si no se proporciona
    const fileName = filename || `preguntas_ia_${Date.now()}.json`;
    const filePath = path.join(dataDir, fileName);

    // Validar que el nombre de archivo sea seguro (prevenir directory traversal)
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(dataDir))) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de archivo inválido'
      });
    }

    // Guardar el archivo
    const jsonContent = JSON.stringify(questions, null, 2);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');

    res.json({
      success: true,
      message: 'Archivo guardado correctamente',
      filename: fileName,
      path: filePath
    });
  } catch (error) {
    console.error('Error al guardar el archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el archivo: ' + error.message
    });
  }
});

/**
 * Endpoint para obtener TODAS las preguntas de todos los JSON en /data
 * GET /api/all-questions
 */
app.get('/api/all-questions', (req, res) => {
  try {
    const allQuestions = [];
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

    files.forEach(file => {
      try {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        
        // Soporta tanto Array directo como { questions: [...] }
        const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        allQuestions.push(...questions);
      } catch (err) {
        console.warn(`Error leyendo ${file}:`, err.message);
      }
    });

    res.json({
      success: true,
      total: allQuestions.length,
      questions: allQuestions
    });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener preguntas: ' + error.message
    });
  }
});

/**
 * Endpoint para obtener lista de archivos JSON guardados
 * GET /api/saved-files
 */
app.get('/api/saved-files', (req, res) => {
  try {
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json') && file.startsWith('preguntas_ia_'))
      .map(file => ({
        name: file,
        createdAt: fs.statSync(path.join(dataDir, file)).birthtime
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Error al leer archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al leer los archivos: ' + error.message
    });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Archivos se guardarán en: ${dataDir}`);
});