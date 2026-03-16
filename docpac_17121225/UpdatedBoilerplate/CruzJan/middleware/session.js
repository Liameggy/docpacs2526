// Middleware 
app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: new SQLiteStore({ db : "sessions.db", dir: `./db` }),
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))
