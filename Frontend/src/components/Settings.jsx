
const Settings = ({ 
  setView, 
  wildcardActive, 
  setWildcardActive, 
  difficultyTime, 
  setDifficultyTime,
  onGenerateBank 
}) => {
  return (
    <div className="settings-overlay">
      <div className="settings-card">
        <h2 className="settings-title">⚙️ CONFIGURACIÓN</h2>
        
        <div className="settings-section">
          <h3>COMODINES</h3>
          <div className="option-box">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={wildcardActive} 
                onChange={(e) => setWildcardActive(e.target.checked)} 
              />
              Activar Comodín de Llamada
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>TIEMPO POR PREGUNTA</h3>
          <select 
            className="settings-select"
            value={difficultyTime}
            onChange={(e) => setDifficultyTime(Number(e.target.value))}
          >
            <option value={45}>Fácil (45 seg)</option>
            <option value={30}>Normal (30 seg)</option>
            <option value={15}>Difícil (15 seg)</option>
          </select>
        </div>

        <hr style={{opacity: 0.2, margin: '20px 0'}} />

        <div className="settings-section">
          <h3>BANCO DE DATOS (IA)</h3>
          <p style={{fontSize: '0.75rem', marginBottom: '10px', color: '#ccc'}}>
            Genera 20 preguntas con DeepSeek y guárdalas en /data automáticamente.
          </p>
          <button 
            onClick={onGenerateBank} 
            className="btn-save-settings"
            style={{backgroundColor: '#28a745', fontSize: '0.8rem'}}
          >
            ✨ GENERAR Y GUARDAR JSON
          </button>
        </div>

        <button 
          onClick={() => setView('menu')} 
          className="btn-save-settings" 
          style={{marginTop: '20px'}}
        >
          VOLVER AL MENÚ
        </button>
      </div>
    </div>
  );
};

export default Settings;