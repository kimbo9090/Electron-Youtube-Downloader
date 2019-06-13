// Framework inizialitation
const electron = require('electron');
const {
    ipcRenderer
} = electron;
const url = require('url');
const path = require('path');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg')
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;

let mainWindow;
// Create main window

app.on('ready', function () {
    // Check if the directory exits, if not, create one
    if (!fs.existsSync('videos')) {
        fs.mkdirSync('videos');
    }
    mainWindow = new BrowserWindow({
        icon: __dirname + '/icon.png',
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
// Icon




// Create Menu Template
const mainMenuTemplate = [{
        label: 'Quit',
        // Different command for different platform
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
            app.quit();
        }
    }


];
// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
                label: 'Toogle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
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
ipcMain.on('url:add', function (e, url, format) {
    // TODO Handle if it's a playlist

    if (format == 'video') {
        console.log('estoy en video')
        // We download the file in .mp4 format
        const s = ytdl(url, {
                filter: (format) => format.container === `mp4`
            })
            // We create a data stream for downloading the video, when it's end, we activate the download button
            .pipe(fs.createWriteStream('videos/' + Date.now() + '.mp4')).on('end', () => { // This will go on until the file process is fully ended
                mainWindow.webContents.send('activate:button');
            }).on('progress',(progress)=> { 
                // Send the progress to the html
                console.log('from video',progress.timemark)
                mainWindow.webContents.send('progress:bar', progress.timemark);
            });
    } else if (format == 'audio') {
        const stream = ytdl(url, {
            filter: (format) => format.container === `mp4`
        })
        // Download in .mp4 format and do a conversion to .mp3
        ffmpeg(stream).audioBitrate('128k').format('mp3').save('videos/' + Date.now() + '.mp3').on('end', () => { // This will go on until the file process is fully ended
            mainWindow.webContents.send('activate:button');
        }).on('progress', (progress) => {
            // Send the progress to the html
            mainWindow.webContents.send('progress:bar', progress.timemark);

        });

    }


})