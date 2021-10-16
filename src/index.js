import {auth, fbauth, serverRef, rtdb} from './firebase-connection.js';

let username;
let user;
let userUID;
let signUpForm = false; // Flag to check whether or not we are in Sign Up page
let loginForm = true; // Flag to check whether or not we are in Login page
let passwordResetPage = false; // Flag to check whether or not we are in Password Reset page
let mainPage = false;
let serverPage = false;

let serverClickHandler = function(name){
    let serverList = document.getElementById("serverlist");
    rtdb.get(serverRef).then(ss=>{
        ss.forEach(s=>{
            if(s.val()["name"] == name){
                let nameContainer = document.getElementById("nameOfServer");
                nameContainer.innerHTML = "";

                let name = document.createElement("div");
                name.innerHTML = s.val()["name"];
                name.style = "color: yellow";
                nameContainer.appendChild(name);

                let membersList = document.getElementById("membersList");
                membersList.innerHTML = "";

                s.val()["members"].forEach(member=>{
                    let currMember = document.createElement("div");
                    currMember.innerHTML = member["username"];
                    currMember.style = "color: yellow";
                    membersList.appendChild(currMember);
                });

                let adminContainer = document.getElementById("adminName");
                adminContainer.innerHTML = "";

                let adminName = document.createElement("div");
                adminName.innerHTML = s.val()["createdBy"]["username"];
                adminName.style = "color: yellow";
                adminContainer.appendChild(adminName);
            }
        })
    });

    loginForm = false;
    signUpForm = false;
    passwordResetPage = false;
    mainPage = false;
    serverPage = true;

    location.href = "#serverPage"
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("load", handleHash);
    
    serverList.innerHTML = "";
}

let displayServers = function(){
    let serverList = document.getElementById("serverlist");

    // Read servers from the database, if any, and store it in the sidepanel container for list of servers
    rtdb.get(serverRef).then(ss=>{
        ss.forEach(server => {
            let currServer = document.createElement("div");
            let serverName = server.val()["name"];

            currServer.innerHTML = serverName;
            currServer.style = "color: white";
            currServer.id = serverName;
            currServer.onclick = function(){
                serverClickHandler(currServer.id);
            }

            serverList.appendChild(currServer);
       });
    });
}

let handleHash = function(){
    if(signUpForm == true){
        document.getElementById("login").style = "display: none";
        document.getElementById("signup").style = "display: block";
        document.getElementById("main_page").style = "display: none";
        document.getElementById("password-reset").style = "display: none";
        document.getElementById("serverPage").style = "display: none";
    }
    if(loginForm == true){
        document.getElementById("signup").style = "display: none";
        document.getElementById("login").style = "display: block";
        document.getElementById("main_page").style = "display: none";
        document.getElementById("password-reset").style = "display: none";
        document.getElementById("serverPage").style = "display: none";
    }
    if(passwordResetPage == true){
        let email = document.getElementById("signin-email").value;

        document.getElementById("signup").style = "display: none";
        document.getElementById("login").style = "display: none";
        document.getElementById("main_page").style = "display: none";
        document.getElementById("password-reset").style = "display: block";
        document.getElementById("serverPage").style = "display: none";

        fbauth.sendPasswordResetEmail(auth, email).then(() => {
            // Password reset email sent!
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorCode);
        });
    }
    if(mainPage == true){
        document.getElementById("signup").style = "display: none";
        document.getElementById("login").style = "display: none";
        document.getElementById("main_page").style = "display: block";
        document.getElementById("password-reset").style = "display: none";
        document.getElementById("serverPage").style = "display: none";

        displayServers();
    }

    if(serverPage == true){
        document.getElementById("signup").style = "display: none";
        document.getElementById("login").style = "display: none";
        document.getElementById("main_page").style = "display: none";
        document.getElementById("password-reset").style = "display: none";
        document.getElementById("serverPage").style = "display: block";
    }
};

document.getElementById("login-link").onclick = function(){
    loginForm = true;
    signUpForm = false;
    passwordResetPage = false;
    mainPage = false;
    serverPage = false;
    document.getElementById("signupChecker").innerText = "";
    document.getElementById("user-email").value = "";
    document.getElementById("user-username").value = "";
    document.getElementById("user-password").value = "";
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("load", handleHash);
};

document.getElementById("password-reset-login-link").onclick = function() {
    loginForm = true;
    signUpForm = false;
    passwordResetPage = false;
    mainPage = false;
    serverPage = false;
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("load", handleHash);
    document.getElementById("signin-email").value = "";
    document.getElementById("signin-password").value = "";
};

document.getElementById("signup-link").onclick = function(){
    loginForm = false;
    signUpForm = true;
    passwordResetPage = false;
    mainPage = false;
    serverPage = false;
    document.getElementById("signin-email").value = "";
    document.getElementById("signin-password").value = "";
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("load", handleHash);
};
/* Action to be performed when user clicks "Sign Up" button */
document.getElementById("signup-btn").onclick = function(e){
    let email = document.getElementById("user-email").value;
    let password = document.getElementById("user-password").value;

    fbauth.createUserWithEmailAndPassword(auth, email, password).then(()=>{
        document.getElementById("signupChecker").innerText = "SIGNUP SUCCESSFUL!!!";
        username = document.getElementById("user-username").value;
    }).catch(e=>{
        document.getElementById("signupChecker").innerText = "";
        alert(e.code);
    });
};

/* Action to be performed when user clicks "Login" button */
document.getElementById("login-btn").onclick = function(){
    let email = document.getElementById("signin-email").value;
    let password = document.getElementById("signin-password").value;

    fbauth.signInWithEmailAndPassword(auth, email, password).then(()=>{
        loginForm = false;
        signUpForm = false;
        passwordResetPage = false;
        mainPage = true;
        serverPage = false;
        user = auth.currentUser;       
        userUID = user.uid;

        location.href = "#main_page";
        window.addEventListener("hashchange", handleHash);
        window.addEventListener("load", handleHash);
    }).catch(e=>{
        alert(e.code);
    })
        
};

document.getElementById("password-reset-link").onclick = function(){
    passwordResetPage = true;
    signUpForm = false;
    loginForm = false;
    mainPage = false;
    serverPage = false;
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("load", handleHash);
};

document.getElementById("addserver-btn").onclick = function(){
    document.getElementById("create-server").style.display = "block";
}

document.getElementById("cancel-btn").onclick = function(){
    document.getElementById("create-server").style.display = "none";
}

document.getElementById("create-server-btn").onclick = function(){
    let serverList = document.getElementById("serverlist");
    let server = document.createElement("div");
    let serverName = String(document.getElementById("server-name").value);

    server.innerHTML = serverName;
    server.style = "color: white";
    server.id = serverName;
    server.onclick = function(){
        serverClickHandler(server.id);
    }
    serverList.appendChild(server);

    document.getElementById("create-server").style.display = "none";
    document.getElementById("server-name").value = "";

    let nameRef = rtdb.child(serverRef, serverName);
    let userObj = {
        "admin": true,
        "userID": userUID,
        "username": String(username)
    }

    let serverObj = {
        "name": serverName,
        "chats": [],
        "members": [
            userObj
        ],
        "createdBy" : userObj,
        "serverID" : userObj.userID
    };

    rtdb.update(nameRef, serverObj);
}

document.getElementById("back-btn").onclick = function(){
    loginForm = false;
    signUpForm = true;
    passwordResetPage = false;
    mainPage = true;
    serverPage = false;

    document.getElementById("nameOfServer").innerHTML = "";
    document.getElementById("membersList").innerHTML = "";
    document.getElementById("adminName").innerHTML = "";

    location.href = "#main_page"
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("load", handleHash);
}