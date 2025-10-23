Simple vanilla JS SPA client for the REST API in ../api.

Run the server (from `api/`):

```powershell
# from api folder
npm install
node index.js
```

Open the client by opening `client/index.html` in your browser (or serve it with a static server). The SPA expects the API at http://localhost:5000 and uses the `X-Authorization` header for the JWT token.

Features:
- List posts (title + author)
- View post details
- Register & login
- Create, edit, delete posts when logged in

Notes:
- The API `Post` model doesn't include `author` currently; posts will show 'Anonymous' unless the server is extended to store author info.
