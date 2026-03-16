CREATE TABLE "users" (
	"uid"	INTEGER NOT NULL UNIQUE,
	"name"	INTEGER NOT NULL,
	PRIMARY KEY("uid" AUTOINCREMENT)
);
-- Table users will be joined by Uid to Oid(User ID to Owner ID)
CREATE TABLE "post" (
	"Pid"	INTEGER NOT NULL UNIQUE,
	"Oid"	INTEGER NOT NULL,
	"title"	TEXT NOT NULL,
	"description"	INTEGER,
	PRIMARY KEY("Pid" AUTOINCREMENT)
);
-- Table posts will be joined by pids(Both will have a postID)
CREATE TABLE "comments" (
	"Cid"	INTEGER NOT NULL UNIQUE,
	"Pid"	INTEGER NOT NULL,
	"subject"	INTEGER NOT NULL,
	"contents"	INTEGER NOT NULL,
	PRIMARY KEY("Cid" AUTOINCREMENT)
);