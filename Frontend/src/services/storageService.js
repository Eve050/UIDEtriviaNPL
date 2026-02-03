const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Guarda las preguntas generadas en el servidor backend
 * @param {Array} questions - Array de preguntas a guardar
 * @param {String} filename - Nombre del archivo (opcional)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const saveQuestionsToServer = async (questions, filename = null) => {
  try {
    const fileName = filename || `preguntas_ia_${Date.now()}.json`;
    
    // Primero intentamos guardar en el backend
    const backendAvailable = await checkBackendHealth();
    
    if (backendAvailable) {
      const payload = {
        questions: questions,
        filename: fileName
      };

      const response = await fetch(`${BACKEND_URL}/api/save-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar en el servidor");
      }

      const result = await response.json();
      return result;
    } else {
      // Si no hay backend, descargamos el archivo localmente
      console.warn("Backend no disponible, descargando archivo localmente...");
      return downloadQuestionsLocally(questions, fileName);
    }
  } catch (error) {
    console.error("Error al guardar preguntas:", error);
    // Fallback: descargar localmente
    const fileName = filename || `preguntas_ia_${Date.now()}.json`;
    return downloadQuestionsLocally(questions, fileName);
  }
};

/**
 * Descarga el archivo JSON localmente en el navegador
 */
export const downloadQuestionsLocally = (questions, filename) => {
  try {
    const jsonString = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: "Archivo descargado exitosamente",
      filename: filename,
      mode: "local"
    };
  } catch (error) {
    throw new Error("Error al descargar archivo: " + error.message);
  }
};

/**
 * Obtiene la lista de archivos guardados
 * @returns {Promise<Array>} Lista de archivos JSON guardados
 */
export const getSavedFiles = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/saved-files`);
    
    if (!response.ok) {
      throw new Error("Error al obtener lista de archivos");
    }

    const result = await response.json();
    return result.files || [];
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    return [];
  }
};

/**
 * Verifica si el backend está disponible
 * @returns {Promise<Boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      mode: 'no-cors'
    });
    return response.ok || response.type === 'opaque';
  } catch (error) {
    console.warn("Backend no disponible:", error.message);
    return false;
  }
};
