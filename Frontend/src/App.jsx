import React, { useState, useEffect } from "react";
// Importación de los 7 archivos JSON (Base de Datos Local)
import d1 from "./data/Data_1.json"; 
import d2 from "./data/Data_2.json"; 
import d3 from "./data/Data_3.json"; 
import d4 from "./data/Data_4.json"; 
import d5 from "./data/Data_5.json"; 
import d6 from "./data/Data_6.json"; 
import d7 from "./data/Data_7.json"; 
import d8 from "./data/Data_8.json"; 

// Importación de Componentes
import MainMenu from "./components/MainMenu.jsx";
import SetupPlayer from "./components/SetupPlayer.jsx";
import Game from "./components/Game.jsx";
import Scoreboard from "./components/Scoreboard.jsx";
import Settings from "./components/Settings.jsx";

// Importación del servicio de IA
import { generateQuizData } from "./services/aiService";

function App() {
  // Estados de navegación y configuración
  const [view, setView] = useState('menu');
  const [playerName, setPlayerName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [wildcardActive, setWildcardActive] = useState(true);
  const [difficultyTime, setDifficultyTime] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false); // Estado para feedback de carga

  // ESCALA DE PREMIOS ACTUALIZADA (10 Niveles hasta el Millón)
  const escalaPremios = [100, 500, 1000, 5000, 15000, 50000, 100000, 250000, 500000, 1000000];

  /**
   * Prepara el banco de preguntas para una nueva partida
   */
  const prepareGame = () => {
    const allData = [...d1, ...d2, ...d3, ...d4, ...d5, ...d6, ...d7, ...d8];
    
    const filtered = allData.filter(q => 
      q.question && !q.question.toLowerCase().includes("inicialización")
    );

    const uniqueMap = new Map();
    filtered.forEach(q => {
      const key = q.question.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, q);
      }
    });
    const uniqueQuestions = Array.from(uniqueMap.values());

    const shuffled = uniqueQuestions.sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, 10);

    const finalQuestions = selection.map((q, index) => ({
      ...q,
      prize: escalaPremios[index]
    }));

    setQuestions(finalQuestions);
  };

  /**
   * Lógica para generar preguntas con IA y descargar el archivo JSON
   */
  const handleGenerateBank = async () => {
    setIsGenerating(true);
    try {
      // Obtenemos textos de preguntas actuales para que la IA intente no repetirlas
      const existingTexts = questions.map(q => q.question);
      
      const data = await generateQuizData(existingTexts);
      
      if (data && data.questions && data.questions.length > 0) {
        // Formateamos el JSON para que sea legible
        const jsonString = JSON.stringify(data.questions, null, 2);
        
        // Crear un link invisible para forzar la descarga
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.href = url;
        link.download = `preguntas_ia_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        
        // Limpieza de memoria y elementos
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert("¡Archivo JSON generado y descargado con éxito!");
      }
    } catch (error) {
      console.error("Error al generar banco:", error);
      alert("Error: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (view === 'game') {
      prepareGame();
    }
  }, [view]);

  /**
   * Guarda el puntaje en LocalStorage
   */
  const saveScore = (name, score) => {
    const saved = JSON.parse(localStorage.getItem('scores') || '[]');
    const newEntry = { 
      name: name || "Anónimo", 
      score: score, 
      date: new Date().toLocaleString() // Guardamos fecha y hora
    };
    
    // Guardamos todos los registros ordenados por puntaje
    const updatedScores = [...saved, newEntry].sort((a, b) => b.score - a.score);
      
    localStorage.setItem('scores', JSON.stringify(updatedScores));
  };

  const clearScores = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar todo el historial de puntuaciones?")) {
      localStorage.removeItem('scores');
      // Forzamos un re-render o alerta si es necesario
      alert("Historial borrado.");
    }
  };

  return (
    <div className="app-container">
      {view === 'menu' && (
        <MainMenu setView={setView} />
      )}

      {view === 'setup' && (
        <SetupPlayer 
          setView={setView} 
          setPlayerName={setPlayerName} 
        />
      )}

      {view === 'game' && questions.length > 0 && (
        <Game 
          playerName={playerName} 
          questions={questions} 
          setView={setView} 
          saveScore={saveScore} 
          wildcardActive={wildcardActive} 
          difficultyTime={difficultyTime} 
        />
      )}

      {view === 'scores' && (
        <Scoreboard 
          setView={setView} 
          clearScores={clearScores} // Pasamos la nueva función
        />
      )}

      {view === 'settings' && (
        <Settings 
          setView={setView} 
          wildcardActive={wildcardActive} 
          setWildcardActive={setWildcardActive} 
          difficultyTime={difficultyTime} 
          setDifficultyTime={setDifficultyTime} 
          onGenerateBank={handleGenerateBank} // Pasamos la función al componente
        />
      )}

      {/* Overlay opcional de carga para la IA */}
      {isGenerating && (
        <div className="loading-overlay">
          <p>Generando nuevas preguntas con IA...</p>
        </div>
      )}
    </div>
  );
}

export default App;