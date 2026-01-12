"""
Juego de Trivia Académico
Modo Chat
Fin inmediato al error
"""

import streamlit as st
import pandas as pd
import os

# =============================
# CONFIGURACIÓN
# =============================

st.set_page_config(
    page_title="Juego de Trivia",
    layout="wide"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(BASE_DIR, "categorias (1).xlsx")

# =============================
# CARGA DE PREGUNTAS
# =============================

@st.cache_data
def cargar_preguntas():
    df = pd.read_excel(EXCEL_PATH)
    df.columns = [c.strip().lower() for c in df.columns]

    columnas = [
        "pregunta",
        "r1 (correcta)",
        "r2 (incorrecto)",
        "r3 (incorrecta)",
        "r4 (incorrecta)"
    ]

    for c in columnas:
        if c not in df.columns:
            st.error(f"Falta la columna requerida: {c}")
            st.stop()

    return df

# =============================
# APP
# =============================

def main():
    st.title("Juego de Trivia")

    preguntas = cargar_preguntas()

    # =============================
    # ESTADO
    # =============================

    if "estado" not in st.session_state:
        st.session_state.estado = "config"

    # =============================
    # CONFIGURACIÓN
    # =============================

    if st.session_state.estado == "config":
        st.subheader("Configuración")

        modo = st.selectbox("Modo de juego", ["1 jugador", "2 jugadores"])
        jugador1 = st.text_input("Jugador 1")

        jugador2 = ""
        if modo == "2 jugadores":
            jugador2 = st.text_input("Jugador 2")

        if st.button("Iniciar juego"):
            # Validar que los campos necesarios estén llenos
            if modo == "1 jugador":
                if jugador1.strip():
                    st.session_state.modo = modo
                    st.session_state.j1 = jugador1
                    st.session_state.j2 = None
                    st.session_state.turno = 1
                    st.session_state.puntaje1 = 0
                    st.session_state.puntaje2 = 0
                    st.session_state.pregunta = preguntas.sample(1).iloc[0]
                    st.session_state.chat = []
                    st.session_state.estado = "jugando"
                    st.rerun()
                else:
                    st.error("Por favor ingresa el nombre del Jugador 1")
            else:  # modo == "2 jugadores"
                if jugador1.strip() and jugador2.strip():
                    st.session_state.modo = modo
                    st.session_state.j1 = jugador1
                    st.session_state.j2 = jugador2
                    st.session_state.turno = 1
                    st.session_state.puntaje1 = 0
                    st.session_state.puntaje2 = 0
                    st.session_state.pregunta = preguntas.sample(1).iloc[0]
                    st.session_state.chat = []
                    st.session_state.estado = "jugando"
                    st.rerun()
                else:
                    st.error("Por favor ingresa los nombres de ambos jugadores")
        return

    # =============================
    # SIDEBAR
    # =============================

    st.sidebar.header("Puntaje")
    st.sidebar.write(f"🎮 {st.session_state.j1}: {st.session_state.puntaje1}")

    if st.session_state.modo == "2 jugadores":
        st.sidebar.write(f"🎮 {st.session_state.j2}: {st.session_state.puntaje2}")
        actual = st.session_state.j1 if st.session_state.turno == 1 else st.session_state.j2
        st.sidebar.warning(f"🎯 Turno: {actual}")

    if st.sidebar.button("Reiniciar"):
        st.session_state.clear()
        st.rerun()

    # =============================
    # ESTADO FIN
    # =============================
    
    if st.session_state.estado == "fin":
        for msg in st.session_state.chat:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])
        return

    # =============================
    # CHAT
    # =============================

    for msg in st.session_state.chat:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # MOSTRAR PREGUNTA UNA VEZ
    if len(st.session_state.chat) == 0:
        p = st.session_state.pregunta
        
        turno_msg = ""
        if st.session_state.modo == "2 jugadores":
            actual = st.session_state.j1 if st.session_state.turno == 1 else st.session_state.j2
            turno_msg = f"**Turno de: {actual}**\n\n"

        st.session_state.chat.append({
            "role": "assistant",
            "content": f"""
{turno_msg}**{p['pregunta']}**

A) {p['r1 (correcta)']}
B) {p['r2 (incorrecto)']}
C) {p['r3 (incorrecta)']}
D) {p['r4 (incorrecta)']}

Escribe la letra o la respuesta.
"""
        })
        st.rerun()

    # =============================
    # INPUT
    # =============================

    if respuesta := st.chat_input("Escribe tu respuesta..."):
        respuesta = respuesta.strip().lower()

        st.session_state.chat.append({
            "role": "user",
            "content": respuesta
        })

        correcta_texto = str(st.session_state.pregunta["r1 (correcta)"]).strip().lower()
        correcta_letra = "a"

        # =============================
        # VALIDACIÓN CORRECTA
        # =============================

        if (
            respuesta == correcta_letra
            or respuesta == correcta_texto
            or respuesta == f"a) {correcta_texto}"
        ):
            # Sumar puntos al jugador actual
            if st.session_state.turno == 1:
                st.session_state.puntaje1 += 10
            else:
                st.session_state.puntaje2 += 10

            st.session_state.chat.append({
                "role": "assistant",
                "content": "✅ Respuesta correcta."
            })

            # En modo 2 jugadores, cambiar turno después de respuesta correcta
            if st.session_state.modo == "2 jugadores":
                st.session_state.turno = 2 if st.session_state.turno == 1 else 1

            # Nueva pregunta
            st.session_state.pregunta = preguntas.sample(1).iloc[0]
            st.session_state.chat = []
            st.rerun()

        # =============================
        # INCORRECTA → FIN
        # =============================

        else:
            if st.session_state.modo == "1 jugador":
                mensaje = (
                    "❌ Respuesta incorrecta.\n\n"
                    "Juego terminado.\n\n"
                    f"✅ Respuesta correcta: **{correcta_texto.capitalize()}**\n\n"
                    f"Puntaje final: {st.session_state.puntaje1}"
                )
            else:
                # En modo 2 jugadores, el jugador que NO falló gana
                ganador = st.session_state.j2 if st.session_state.turno == 1 else st.session_state.j1
                perdedor = st.session_state.j1 if st.session_state.turno == 1 else st.session_state.j2
                puntaje_ganador = st.session_state.puntaje2 if st.session_state.turno == 1 else st.session_state.puntaje1
                puntaje_perdedor = st.session_state.puntaje1 if st.session_state.turno == 1 else st.session_state.puntaje2
                
                mensaje = (
                    f"❌ {perdedor} respondió incorrectamente.\n\n"
                    f"🏆 **Ganador: {ganador}**\n\n"
                    f"✅ Respuesta correcta: **{correcta_texto.capitalize()}**\n\n"
                    f"**Puntajes finales:**\n"
                    f"- {ganador}: {puntaje_ganador} puntos\n"
                    f"- {perdedor}: {puntaje_perdedor} puntos"
                )

            st.session_state.chat.append({
                "role": "assistant",
                "content": mensaje
            })

            st.session_state.estado = "fin"
            st.rerun()

# =============================
# RUN
# =============================

if __name__ == "__main__":
    main()