"""
Chatbot de Trivia Académico
Streamlit + DeepSeek

Incluye:
- Registro de usuarios
- Puntaje dinámico
- Fin automático del juego al fallar
- API integrada
- Soporte para ejecución en red
"""

import streamlit as st
import requests
from typing import List, Dict

# =========================
# CONFIGURACIÓN API
# =========================

DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"
DEEPSEEK_API_KEY = "sk-c76f7a44fd974f04ad7593aa6777f170"

# =========================
# PROMPT DEL SISTEMA
# =========================

SISTEMA_PROMPT = """
Actúas como un motor de juego de trivia académica.

Reglas obligatorias:
- Solo puedes interactuar dentro del contexto del juego.
- Si el usuario se sale del contexto, rechaza educadamente.
- Usa el historial para mantener el estado.

Funciones:
1. Solicitar modo de juego si no está definido.
2. Generar preguntas con 4 opciones (A, B, C, D).
3. Evaluar la respuesta del usuario.
4. Mantener puntaje y estado del juego.

Formato obligatorio de evaluación:
Evaluación: Correcta
o
Evaluación: Incorrecta

Reglas del juego:
- 1 jugador: Si falla, el juego termina.
- 2 jugadores: Alternar turnos (simulado).

Tono:
Educativo, claro y neutral.
"""

# =========================
# CLASE CHATBOT
# =========================

class ChatbotTrivia:
    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY
        self.historial: List[Dict[str, str]] = []

    def _agregar_sistema(self):
        if not any(m["role"] == "system" for m in self.historial):
            self.historial.append({
                "role": "system",
                "content": SISTEMA_PROMPT
            })

    def enviar_mensaje(self, mensaje: str) -> str:
        if not mensaje.strip():
            return "El mensaje no puede estar vacío."

        self._agregar_sistema()

        self.historial.append({
            "role": "user",
            "content": mensaje
        })

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": DEEPSEEK_MODEL,
            "messages": self.historial,
            "temperature": 0.6,
            "max_tokens": 2000
        }

        try:
            response = requests.post(
                DEEPSEEK_API_URL,
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                respuesta = data["choices"][0]["message"]["content"]

                self.historial.append({
                    "role": "assistant",
                    "content": respuesta
                })

                return respuesta
            else:
                return f"Error API: {response.status_code}"

        except requests.exceptions.RequestException as e:
            return f"Error de conexión: {str(e)}"

    def limpiar(self):
        self.historial = []

# =========================
# APP STREAMLIT
# =========================

def main():
    st.set_page_config(
        page_title="Juego de Trivia",
        layout="wide"
    )

    st.title("Juego de Trivia Académico")

    # =========================
    # REGISTRO DE USUARIO
    # =========================

    if "usuario" not in st.session_state:
        st.session_state.usuario = None

    if st.session_state.usuario is None:
        st.subheader("Registro de usuario")
        nombre = st.text_input("Nombre de usuario")

        if st.button("Registrar"):
            if nombre.strip():
                st.session_state.usuario = nombre
                st.session_state.puntaje = 0
                st.session_state.juego_terminado = False
                st.rerun()
            else:
                st.warning("El nombre no puede estar vacío.")
        return

    # =========================
    # ESTADO DEL JUEGO
    # =========================

    if "puntaje" not in st.session_state:
        st.session_state.puntaje = 0

    if "juego_terminado" not in st.session_state:
        st.session_state.juego_terminado = False

    # =========================
    # SIDEBAR
    # =========================

    st.sidebar.success(f"Usuario: {st.session_state.usuario}")
    st.sidebar.info(f"Puntaje actual: {st.session_state.puntaje}")

    if st.session_state.juego_terminado:
        st.sidebar.error("Juego terminado")

    if st.sidebar.button("Reiniciar juego"):
        st.session_state.puntaje = 0
        st.session_state.juego_terminado = False
        st.session_state.mensajes = []
        st.session_state.chatbot.limpiar()
        st.rerun()

    if st.sidebar.button("Cerrar sesión"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

    # =========================
    # CHAT
    # =========================

    if "chatbot" not in st.session_state:
        st.session_state.chatbot = ChatbotTrivia()

    if "mensajes" not in st.session_state:
        st.session_state.mensajes = []

    for msg in st.session_state.mensajes:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if st.session_state.juego_terminado:
        st.warning("El juego ha terminado. Reinicia para volver a jugar.")
        return

    if prompt := st.chat_input("Escribe tu respuesta o comando"):
        st.session_state.mensajes.append({
            "role": "user",
            "content": prompt
        })

        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            respuesta = st.session_state.chatbot.enviar_mensaje(prompt)
            st.markdown(respuesta)

        # =========================
        # CONTROL DE PUNTAJE
        # =========================

        if "Evaluación: Correcta" in respuesta:
            st.session_state.puntaje += 10

        elif "Evaluación: Incorrecta" in respuesta:
            st.session_state.juego_terminado = True

        st.session_state.mensajes.append({
            "role": "assistant",
            "content": respuesta
        })

    # =========================
    # MENSAJE INICIAL
    # =========================

    if len(st.session_state.mensajes) == 0:
        bienvenida = (
            "Bienvenido al juego de trivia.\n\n"
            "Escribe:\n"
            "- Iniciar modo 1 jugador\n"
            "- Iniciar modo 2 jugadores"
        )

        with st.chat_message("assistant"):
            st.markdown(bienvenida)

        st.session_state.mensajes.append({
            "role": "assistant",
            "content": bienvenida
        })

# =========================
# EJECUCIÓN
# =========================

if __name__ == "__main__":
    main()
