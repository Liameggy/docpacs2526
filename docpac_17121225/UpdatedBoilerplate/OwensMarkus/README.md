uses db folder 'sted o' data , index 'sted o' home and app.js 'sted o' server.js ,made user 'sted o' users in routes/api/user
A boilerplate which moved functality away from app.js file to others intended for future projects.
For start npm install then move .env template to .env and replace placeholders with topical values. Then npm run init-db. then npm run dev
The folder struture is organized to keep files of similar purpose/function together.
The auth module folder is in charge of hashing,native auth, and formbar auth. The sockets folder allows more space efficinat sockets and socket server allows web sockets funstionality for sockets.ejs
The logger uses winston to have a basic centralized loggining method to ensure functionality.
For Socket.IO demo page have two users on the page type yout message int the prompt box then click send and all people on that page will be able to see the message and the user who sent it there is also a welcome message at the top of the page. 