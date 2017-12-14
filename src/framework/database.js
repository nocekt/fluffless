"use strict";

const APP_DB_NAME = "fluffless_db_v1";

class Database {

    constructor(tables) {
        this._indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        this._IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        this._IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

        if (!this._indexedDB) {
            console.log("Browser doesn't support a stable version of IndexedDB.");
            return;
        }

        this.connection = new Promise((resolve, reject) => {
            var openRequest = this._indexedDB.open(APP_DB_NAME, 1);
            
            openRequest.onerror = function(event) {
                reject("Unable to open a database.");
            }
            openRequest.onsuccess = function(event) {
                resolve(openRequest.result); 
            }
            openRequest.onupgradeneeded = function(event) {
                if(tables) {
                    tables.forEach(table => {
                        openRequest.result.createObjectStore(table, {keyPath: "id"});
                    });
                }
            }
        });
    }

	insert(table, data) {
        return this.connection.then(db => {
            var request = db.transaction([table], "readwrite").objectStore(table).add(data);
            return new Promise((resolve, reject)=>{
                request.onsuccess = function(event) {
                    resolve("Data has been added to your database.");
                };
                request.onerror = function(event) {
                    reject(request.error.message);
                };
            });
        });
	}

    queryAll(table) {
        return this.connection.then(db => {
            var request = db.transaction(table).objectStore(table).getAll();
            return this._queryRequestWrapper(request);
        });
    }

    queryById(table, id) {
        return this.connection.then(db => {
            var request = db.transaction(table).objectStore(table).get(id);
            return this._queryRequestWrapper(request);
        });
    }
    
    _queryRequestWrapper(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = function(event) {
                resolve(request.result);
            };
            request.onerror = function(event) {
                reject(request.error.message);
            };
        });
    }

    deleteById(table, id) {
        return this.connection.then(db => {
            var request = db.transaction(table, "readwrite").objectStore(table).delete(id);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = function(event) {
                    resolve("Data has been deleted from your database.");
                };
    
                request.onerror = function(event) {
                    reject(request.error.message);
                }; 
            });
        });
    }
}
