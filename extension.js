// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { exec } = require("child_process");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const https = require("https");
const { Console } = require("console");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "cody.helloWorld",
    function () {
      // The code you place here will be executed every time your command is executed
      const editor = vscode.window.activeTextEditor;

      let filename;
      if (editor) {
        let document = editor.document;
        filename = document.fileName;
        let extension = path.basename(filename).split(".")[1];
        let command = "",temp="";
        filename='"'+filename+'"';
        switch (extension) {
          case "cpp":
            temp = "c++";
            command = `g++ ${filename}`;
            break;
          case "java":
            temp = "java ";
            command = `java ${filename}`;
            break;
          case "py":
            temp = "python ";
            command = `python ${filename}`;
            break;
          case "c":
            temp = "c ";
            command = `gcc ${filename}`;
            break;
          case "js":
            temp = "javascript ";
            command = `node ${filename}`;
            break;
          default:
            break;
        }


        // if (editor) {
        //   let document = editor.document;
        //   filename = path.basename(document.fileName);
        //   // console.log(filename);
        //   const documentContent = document.getText();
        //   // console.log(documentContent);
        //   for (var i = filename.length; i > 0; i--) {
        //     if (filename[i] === ".") {
        //       filename = filename.slice(i + 1, filename.length);
        //       break;
        //     }
        //   }
        //   vscode.window.showInformationMessage(filename);
  
        //   if (filename === "cpp") {
        //     let reg = /#include\s*[<"]([^>"]+)[>"]/g;
        //     let match;
        //     while ((match = reg.exec(documentContent)) !== null) {
        //       console.log(match[1]);
        //     }
        //   } else if (filename == "py") {
        //     let reg = /(?:import|from)\s([\w.]+)/g;
        //     let match;
        //     while ((match = reg.exec(documentContent)) !== null) {
        //       console.log(match[1]);
        //     }
        //   } else if (filename == "java") {
        //     let reg = /(?:import)\s([\w.]+)/g;
        //     let match;
        //     while ((match = reg.exec(documentContent)) !== null) {
        //       console.log(match[1]);
        //     }
        //   }
        // }

        exec(command, async (error, stdout, stderr) => {
          let url="";
          if (stderr) {
            let ind = stderr.search(/(e|E)rror/);

            let str = stderr.substring(ind, stderr.length - 1);
            const array = str.split("\n");
            try {
              const linkStr = await handle(temp, array[0]);
              for (let element of linkStr) {
                if (element.title.includes("Stack Overflow")) {
                  url= element.link;
                  break;
                }
              }
              if(url===""&&linkStr&&linkStr.length>0)
                url=linkStr[0].link;
            } catch (err) {
              console.log(err);
            }
          }
          if(url!==""){
          let panel = vscode.window.createWebviewPanel(
            "browser", // Identifies the type of the webview. Used internally
            "Noogle's Solution", // Title of the panel displayed to the user
            vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
            {
              enableScripts: true,
              retainContextWhenHidden:true
            }
          );
          // Use XMLHttpRequest to fetch the HTML content of the website
          panel.webview.html = `<html><body>Loading...</body></html>`;
          var XMLHttpRequest = require("xhr2");
          let xhr = new XMLHttpRequest();
          xhr.open("GET",url
          , true);
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
              let str=xhr.responseText;
              let ind=str.lastIndexOf("</script>");
              let newVal=str.substring(0,ind);
              newVal+="</script></body></html>";
              panel.webview.html=newVal;
              
            }
          };
          xhr.send();

          // Handle navigation events
          panel.webview.onDidReceiveMessage(
            (message) => {
              switch (message.command) {
                case "navigate":
                  xhr.open("GET", message.url, true);
                  xhr.send();
                  break;
              }
            },
            null,
            context.subscriptions
          );
          }
          else{
            vscode.window.showInformationMessage("Noogle says you have no error");
          }
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

async function handle(a, b) {
  try {
    const httpsAgent = new https.Agent({ keepAlive: true });
    const search = a + b;
    //@ts-ignore
    let resp = await axios.get(
      `https://www.googleapis.com/customsearch/v1?key=AIzaSyCTXxbtkrHDaymn6PPHnOx7WoorkPw80oM&cx=2105e3b7edca745ba&q=${search}`
    );
    // console.log(resp);
    return resp.data.items;
  } catch (err) {
    return err;
  }
}


module.exports = {
  activate,
  deactivate,
};