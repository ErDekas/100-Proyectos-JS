// Estado de la aplicación
const state = {
    posts: [],
    following: new Set(),
    currentUser: null
};

// Funciones de autenticación
function showRegisterForm() {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
}

function showLoginForm() {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function backToStart() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
}

function register() {
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validaciones
    if (username.length < 2) {
        alert("El nombre de usuario debe tener al menos 2 caracteres.");
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.es|hotmail\.com)$/;
    if (!emailPattern.test(email)) {
        alert("Correo no válido. Solo se permiten @gmail.com, @yahoo.es, @hotmail.com.");
        return;
    }

    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(password)) {
        alert("La contraseña debe tener al menos 8 caracteres y contener letras y números.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    // Guardamos el usuario
    const userData = { username, email, password, posts: [], following: [] };
    localStorage.setItem(username, JSON.stringify(userData));
    alert("Usuario registrado exitosamente.");
    backToStart();
}

function login() {
    const userInput = document.getElementById("loginUser").value;
    const password = document.getElementById("loginPassword").value;

    let userFound = null;

    // Buscar usuario por nombre o email
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            const userData = JSON.parse(localStorage.getItem(key));
            if (userData && (userData.username === userInput || userData.email === userInput)) {
                userFound = userData;
                break;
            }
        } catch (e) {
            continue;
        }
    }

    if (userFound && userFound.password === password) {
        state.currentUser = userFound.username;
        state.following = new Set(userFound.following || []);
        loadPosts();
        showMainContainer();
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

function showMainContainer() {
    document.getElementById("authContainer").classList.add("hidden");
    document.getElementById("mainContainer").classList.remove("hidden");
    document.getElementById("userDisplay").textContent = state.currentUser;
}

function logout() {
    state.currentUser = null;
    state.following.clear();
    state.posts = [];
    document.getElementById("mainContainer").classList.add("hidden");
    document.getElementById("authContainer").classList.remove("hidden");
    backToStart();
}

// Cargar posts del localStorage
function loadPosts() {
    state.posts = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            const userData = JSON.parse(localStorage.getItem(key));
            if (userData && userData.posts) {
                state.posts.push(...userData.posts);
            }
        } catch (e) {
            continue;
        }
    }
    state.posts.sort((a, b) => b.timestamp - a.timestamp);
    renderPosts();
}

// Manejador para la vista previa de medios
document.getElementById('media-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('media-preview');
    preview.innerHTML = '';

    if (file) {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.classList.add('media-preview');
            img.file = file;

            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.readAsDataURL(file);

            preview.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.classList.add('media-preview');
            video.controls = true;

            const reader = new FileReader();
            reader.onload = (e) => video.src = e.target.result;
            reader.readAsDataURL(file);

            preview.appendChild(video);
        }
    }
});

// Crear una nueva publicación
function createPost() {
    const input = document.querySelector('.post-input');
    const mediaInput = document.getElementById('media-input');
    const mediaPreview = document.getElementById('media-preview');
    
    if (!input.value.trim() && !mediaInput.files[0]) return;

    const post = {
        id: Date.now(),
        author: state.currentUser,
        content: input.value,
        media: mediaPreview.innerHTML,
        likes: 0,
        comments: [],
        timestamp: Date.now()
    };

    // Actualizar posts del usuario
    const userData = JSON.parse(localStorage.getItem(state.currentUser));
    userData.posts = userData.posts || [];
    userData.posts.unshift(post);
    localStorage.setItem(state.currentUser, JSON.stringify(userData));

    state.posts.unshift(post);
    renderPosts();

    // Limpiar el formulario
    input.value = '';
    mediaInput.value = '';
    mediaPreview.innerHTML = '';
}

// Añadir un comentario
function addComment(postId) {
    const commentInput = document.querySelector(`#comment-input-${postId}`);
    const comment = commentInput.value.trim();
    
    if (!comment) return;

    const newComment = {
        author: state.currentUser,
        content: comment,
        timestamp: Date.now()
    };

    // Actualizar el post en el estado y en localStorage
    const post = state.posts.find(p => p.id === postId);
    if (post) {
        post.comments.push(newComment);
        
        // Actualizar en localStorage
        const userData = JSON.parse(localStorage.getItem(post.author));
        const userPost = userData.posts.find(p => p.id === postId);
        if (userPost) {
            userPost.comments.push(newComment);
            localStorage.setItem(post.author, JSON.stringify(userData));
        }

        renderPosts();
    }

    commentInput.value = '';
}

// Alternar seguimiento
function toggleFollow(author) {
    if (state.following.has(author)) {
        state.following.delete(author);
    } else {
        state.following.add(author);
    }

    // Actualizar following en localStorage
    const userData = JSON.parse(localStorage.getItem(state.currentUser));
    userData.following = Array.from(state.following);
    localStorage.setItem(state.currentUser, JSON.stringify(userData));

    renderPosts();
}

function renderPosts() {
    const container = document.getElementById('posts-container');
    container.innerHTML = state.posts.map(post => `
        <div class="post">
            <div class="post-header">
                <span class="post-author">${post.author}</span>
                <span>${new Date(post.timestamp).toLocaleString()}</span>
                ${post.author !== state.currentUser ? `
                    <button class="button follow-button ${state.following.has(post.author) ? 'following' : ''}"
                        onclick="toggleFollow('${post.author}')">
                        ${state.following.has(post.author) ? 'Siguiendo' : 'Seguir'}
                    </button>
                ` : ''}
            </div>
            <div class="post-content">${post.content}</div>
            ${post.media ? `<div class="post-media">${post.media}</div>` : ''}
            <div class="post-actions">
                <button class="button" onclick="toggleLike(${post.id})">
                    Me gusta (${post.likes})
                </button>
            </div>
            <div class="comments">
                ${post.comments.map(comment => `
                    <div class="comment">
                        <strong>${comment.author}</strong>: ${comment.content}
                        <small>${new Date(comment.timestamp).toLocaleString()}</small>
                    </div>
                `).join('')}
                <div class="comment-form">
                    <input type="text" id="comment-input-${post.id}" 
                           class="auth-input" 
                           placeholder="Escribe un comentario...">
                    <button class="button" onclick="addComment(${post.id})">
                        Comentar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Función complementaria para manejar los "Me gusta"
function toggleLike(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (post) {
        post.likes += 1;
        
        // Actualizar en localStorage
        const userData = JSON.parse(localStorage.getItem(post.author));
        const userPost = userData.posts.find(p => p.id === postId);
        if (userPost) {
            userPost.likes = post.likes;
            localStorage.setItem(post.author, JSON.stringify(userData));
        }
        
        renderPosts();
    }
}
