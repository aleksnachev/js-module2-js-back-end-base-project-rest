const API = 'http://localhost:5000';

const qs = sel => document.querySelector(sel);

// Auth helpers
function getToken() { return localStorage.getItem('token'); }
function setToken(t) { if (t) localStorage.setItem('token', t); else localStorage.removeItem('token'); }
function authHeaders() {
    const token = getToken();
    return token ? { 'X-Authorization': token } : {};
}

// Elements
const postsList = qs('#posts-list');
const refreshBtn = qs('#refresh');
const newPostBtn = qs('#new-post');
const detailView = qs('#detail-view');
const listView = qs('#list-view');
const formView = qs('#form-view');
const postForm = qs('#post-form');
const formTitle = qs('#form-title');
const cancelFormBtn = qs('#cancel-form');
const detailTitle = qs('#detail-title');
const detailAuthor = qs('#detail-author');
const detailContent = qs('#detail-content');
const backBtn = qs('#back');
const detailActions = qs('#detail-actions');
const editPostBtn = qs('#edit-post');
const deletePostBtn = qs('#delete-post');
const newPostBtnToolbar = qs('#new-post');

// Auth elems
const guestArea = qs('#guest-area');
const userArea = qs('#user-area');
const welcomeSpan = qs('#welcome');
const logoutBtn = qs('#logout');
const showLoginBtn = qs('#show-login');
const showRegisterBtn = qs('#show-register');
const authForms = qs('#auth-forms');
const loginFormWrap = qs('#login-form');
const registerFormWrap = qs('#register-form');
const formLogin = qs('#form-login');
const formRegister = qs('#form-register');

let currentPost = null; // for detail/edit

// --- API calls ---
async function api(path, { method = 'GET', body, headers = {}, expectJson = true } = {}) {
    const opts = { method, headers: { ...headers }, };
    if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    // attach auth header if present
    const token = getToken();
    if (token) opts.headers['X-Authorization'] = token;

    const res = await fetch(API + path, opts);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || res.statusText);
    }
    if (expectJson && res.status !== 204) return res.json();
    return null;
}

// --- UI ---
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function updateAuthUI() {
    const token = getToken();
    if (token) {
        hide(guestArea);
        show(userArea);
        show(newPostBtnToolbar);
        // try to decode username from payload
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            welcomeSpan.textContent = payload.username || 'User';
        } catch (e) { welcomeSpan.textContent = 'User'; }
    } else {
        show(guestArea);
        hide(userArea);
        hide(newPostBtnToolbar);
    }
}

// List
async function loadPosts() {
    postsList.innerHTML = '<li>Loading...</li>';
    try {
        const posts = await api('/posts');
        renderPosts(posts);
    } catch (err) {
        postsList.innerHTML = `<li class="error">Error: ${err.message}</li>`;
    }
}

function renderPosts(posts) {
    if (!posts.length) {
        postsList.innerHTML = '<li>No posts</li>';
        return;
    }
    postsList.innerHTML = '';
    posts.forEach(p => {
        const li = document.createElement('li');
        const title = document.createElement('span');
        title.textContent = p.title || 'Untitled';
        const meta = document.createElement('span');
        meta.className = 'meta';
        // author not defined in model; show Anonymous
        meta.textContent = p.author?.username || 'Anonymous';
        li.appendChild(title);
        li.appendChild(meta);
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => showDetail(p._id));
        postsList.appendChild(li);
    });
}

// Detail
async function showDetail(id) {
    try {
        const post = await api(`/posts/${id}`);
        currentPost = post;
        detailTitle.textContent = post.title || '';
        detailAuthor.textContent = post.author?.username || 'Anonymous';
        detailContent.textContent = post.content || '';
        // if logged in show actions
        if (getToken()) show(detailActions); else hide(detailActions);
        show(detailView); hide(listView); hide(formView); hide(authForms);
    } catch (err) {
        alert('Failed to load post: ' + err.message);
    }
}

// Create/Edit
function showNewForm() {
    formTitle.textContent = 'New Post';
    postForm.dataset.mode = 'create';
    postForm.title.value = '';
    postForm.content.value = '';
    show(formView); hide(listView); hide(detailView); hide(authForms);
}

function showEditForm() {
    if (!currentPost) return;
    formTitle.textContent = 'Edit Post';
    postForm.dataset.mode = 'edit';
    postForm.dataset.id = currentPost._id;
    postForm.title.value = currentPost.title || '';
    postForm.content.value = currentPost.content || '';
    show(formView); hide(listView); hide(detailView); hide(authForms);
}

async function submitPostForm(e) {
    e.preventDefault();
    const data = { title: postForm.title.value, content: postForm.content.value };
    try {
        if (postForm.dataset.mode === 'edit') {
            const id = postForm.dataset.id;
            await api(`/posts/${id}`, { method: 'PUT', body: data });
            alert('Updated');
        } else {
            await api('/posts', { method: 'POST', body: data });
            alert('Created');
        }
        await loadPosts();
        hide(formView); show(listView);
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function deleteCurrentPost() {
    if (!currentPost) return;
    if (!confirm('Delete post?')) return;
    try {
        await api(`/posts/${currentPost._id}`, { method: 'DELETE', expectJson: false });
        alert('Deleted');
        currentPost = null;
        await loadPosts();
        hide(detailView); show(listView);
    } catch (err) { alert('Error: ' + err.message); }
}

// Auth
function showLogin() { show(authForms); show(loginFormWrap); hide(registerFormWrap); hide(listView); hide(detailView); hide(formView); }
function showRegister() { show(authForms); show(registerFormWrap); hide(loginFormWrap); hide(listView); hide(detailView); hide(formView); }

async function submitLogin(e) {
    e.preventDefault();
    const form = new FormData(formLogin);
    const body = { username: form.get('username'), password: form.get('password') };
    try {
        const res = await fetch(API + '/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setToken(data.accessToken);
        updateAuthUI();
        hide(authForms); show(listView);
        await loadPosts();
    } catch (err) { alert('Login failed: ' + err.message); }
}

async function submitRegister(e) {
    e.preventDefault();
    const form = new FormData(formRegister);
    const body = { username: form.get('username'), password: form.get('password') };
    try {
        const res = await fetch(API + '/users/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message);
        }
        alert('Registered. Please login.');
        showLogin();
    } catch (err) { alert('Register failed: ' + err.message); }
}

function logout() { setToken(null); updateAuthUI(); loadPosts(); hide(detailActions); }

// --- Events ---
refreshBtn.addEventListener('click', loadPosts);
newPostBtn.addEventListener('click', showNewForm);
cancelFormBtn.addEventListener('click', () => { hide(formView); show(listView); });
postForm.addEventListener('submit', submitPostForm);
backBtn.addEventListener('click', () => { hide(detailView); show(listView); });
editPostBtn.addEventListener('click', showEditForm);
deletePostBtn.addEventListener('click', deleteCurrentPost);
showLoginBtn.addEventListener('click', showLogin);
showRegisterBtn.addEventListener('click', showRegister);
formLogin.addEventListener('submit', submitLogin);
formRegister.addEventListener('submit', submitRegister);
logoutBtn.addEventListener('click', () => { logout(); });

// --- Init ---
updateAuthUI();
loadPosts();

export { };
