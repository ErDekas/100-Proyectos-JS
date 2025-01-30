# Pizarra Colaborativa

Este proyecto es una pizarra colaborativa en tiempo real utilizando Firebase y Vite.

## Instalación y Configuración

### 1. Configuración de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/).
2. Crea un nuevo proyecto.
3. En la sección de "Authentication", habilita el método de autenticación que prefieras (por ejemplo, Google, Email/Password, etc.).
4. En la sección de "Firestore Database", crea una base de datos en modo de prueba.
5. En la sección de "Project Settings", obtén las credenciales de configuración de Firebase y añádelas a tu proyecto.

### 2. Instalación de Vite

1. Abre la terminal y navega al directorio del proyecto.
2. Ejecuta el siguiente comando para crear un nuevo proyecto con Vite:

    ```sh
    npm create vite@latest
    ```

3. Sigue las instrucciones en pantalla para configurar tu proyecto.

### 3. Instalación de Firebase y Herramientas Necesarias

1. Navega al directorio del proyecto creado con Vite.
2. Instala Firebase y sus herramientas necesarias ejecutando los siguientes comandos:

    ``` sh
    npm install firebase
    npm install firebase-tools
    npm install dotenv
    ```

3. Crea un archivo `firebaseConfig.js` en tu directorio `src` y añade la configuración de Firebase obtenida en el paso 1:

    ``` js
    // src/firebaseConfig.js
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth } from "firebase/auth";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    export { db, auth };
    ```

### 4. Importa y utiliza `db` y `auth` en tu aplicación para interactuar con Firestore y Authentication.

## Ejecución del Proyecto

Para ejecutar el proyecto, utiliza el siguiente comando:

    ``` sh
    npm run dev
    ```
### 5. Despliegue Final

## Ejecución

Para desplegar el proyecto usando el hosting que hemos configurado con Firebase, utiliza el siguiente comando:

    ``` sh
    firebase deploy
    ```
