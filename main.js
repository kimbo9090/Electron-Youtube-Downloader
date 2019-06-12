// Framework inizialitation
const electron = require('electron');
const url = require('url');
const path = require('path');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { app, BrowserWindow, Menu, ipcMain } = electron;
let mainWindow;
// Create main window

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        title: 'Youtube Downloader'
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true // For external output
    }));
    // Quit App when close
    mainWindow.on('close', function () {
        app.quit()
    });
    // Build menu from the Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert the Menu
    Menu.setApplicationMenu(mainMenu);
});




// Create Menu Template
const mainMenuTemplate = [
    {
        label: 'Quit',
        // Different command for different platform
        accelerator: process.platform == 'darwin' ? 'Command+Q' :
            'Ctrl+Q',
        click() {
            app.quit();
        }
    }


];
// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toogle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                    'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}
// Catch url:add
ipcMain.on('url:add',function(e,url){
    console.log(url)
    // We need to handle if it's a playlist
    ytdl.getInfo(url, (err,info)=> {
        
        if (err) throw err;
        let title = info.title;
        // If we want audio
        ytdl('http://www.youtube.com/watch?v=A02s8omM_hI')
        .pipe(fs.createWriteStream('video.flv'));
        mainWindow.webContents.send('activate:button');
    })
})
