// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

'use strict';
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl');
const {app, dialog} = require('electron').remote;

const ISO6391 = require('iso-639-1');

const webvtt = require('node-webvtt-youtube');

let destDownloadFolder = app.getPath("videos");
var downloadFolderDestElement = document.getElementById("downloadFolderDest");
setDownloadFolderDestElement(destDownloadFolder)
// elements
var urlInputElement = document.getElementById("urlInput");
var btnLoadElement = document.getElementById("btnLoad");
var setDownloadDestBtnElement = document.getElementById("setDownloadDestBtn");
var downloadProgressBarEl = document.getElementById("downloadProgressBar")

var infoPanelElemnet = document.getElementById("infoPanel");
var statusElement = document.getElementById("status");
var captionsCheckboxElement = document.getElementById("captionsCheckbox");
var captionsStatusElement = document.getElementById("captionsStatus");
var videoCheckboxElement = document.getElementById("videoCheckbox");

var optionsRadiosHumanCaptionsElement = document.getElementById("optionsRadiosHumanCaptions");
var optionsRadiosAutomatedCaptionsElement = document.getElementById("optionsRadiosAutomatedCaptions");
var languageSelectionElement = document.getElementById("languageSelection");
var captionsToPlainTextCheckboxElement = document.getElementById("captionsToPlainTextCheckbox");
// messages
var downloadingMessage = 'Downloading Video...';
var downloadingPlaylistMessage = 'Downloading Playlist...';
var finishedDownloadingMessage = `Finished downloading Video`;
var subtitlesDownloadedMessage = `Finished downloading subtitle`;
var subtitlesDownloadingMessage = 'Downloading subtitles files ...';
var subtitlesNotAviableMessage = 'Could not retrieve subtitles at this time.';
// set element for  select file format.
// getter  for file element.
var loadExtraLanguagesOptions = document.getElementById("extraLanguagesBtn");


/**
 * helper functions 
 */
function requestedVideo() {
    return videoCheckboxElement.checked;
}

function getUrlInput() {
    return urlInputElement.value;

}

function captionStatus() {
    return captionsCheckboxElement.checked;
}

function getCaptionPlainTextOption() {
    return captionsToPlainTextCheckboxElement.checked;
}

// set user info in GUI on captions
function setCaptionsStatus(status, done) {
    if (status !== "") {
        captionsStatusElement.innerHTML = `<div class="alert alert-dismissible ${
            isDone(done)
        }">${status}</div>`;
    }
    // TODO: status update for captions temporarily disabled.
}

function setStatusElement(status, done) {
    if (status !== "") {
        statusElement.innerHTML = `<div class="alert alert-dismissible ${
            isDone(done)
        }">${status}</div>`;
    }
}


function setInfoPanel(info) { // if(info !== ""){
    infoPanelElemnet.innerHTML = `<div class="alert alert-dismissible alert-success"><strong>Filename: </strong>${
        info.filename
    }<br><strong>size: </strong>${
        info.size
    }<br><strong>Destination: </strong>${
        info.path
    }</div>`;
    // }
}

function isDone(bool) {
    if (bool) {
        return 'alert-success';
    } else {
        return 'alert-warning';
    }
}

function setDownloadFolderDestElement(text) {
    downloadFolderDestElement.innerText = text;
}

function setDownloadProgressBar(percentage){
        downloadProgressBarEl.innerHTML = `<div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width:${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">${percentage}%</div>
      </div>`
}

function resetDownloadFolderDestElement (){
    downloadProgressBarEl.innerHTML =""
}
// urlInputElement.oninput = function(){
// setCaptionsStatus("");
// setStatusElement("");
// setInfoPanel("");
// }

/**
 * main Download function  
 */
// https://youtu.be/pxcI5g2iUCg
function downloadVideo(url) {
    if (url.includes("youtube.com/playlist?")) {
        setStatusElement(downloadingPlaylistMessage, false);

        playlist(url);
    } else {
        // update user GUI on status of download
        // reset captions status
        if (requestedVideo()) {
            setStatusElement(downloadingMessage, false);
            // setup download with youtube-dl
            var video = youtubedl(url,
            // Optional arguments passed to youtube-dl.
            // see here for options https://github.com/rg3/youtube-dl/blob/master/README.md
                ['--format=best'],
            // Additional options can be given for calling `child_process.execFile()`.
                {
                cwd: destDownloadFolder,
                maxBuffer: Infinity
            });

            // listener for video info, to get file name
            video.on('info', function (info) {

                var destFilePathName = path.join(destDownloadFolder, info._filename);

                // update GUI with info on the file being downloaded
                setInfoPanel(`title: ${
                    info.title
                } | filename: ${
                    info._filename
                } | size:${
                    info.size
                } | path:${destFilePathName}`);

                // TODO: sanilitse youtube file name so that it can be
                // save file locally
                var writeStream = fs.createWriteStream(destFilePathName);
                video.pipe(writeStream);
            });


            video.on('end', function () {
                console.info("done downloading video file");
                // TODO: replace with update Div symbol
                setStatusElement(finishedDownloadingMessage, true);
            });
        }
    }

    // https://www.npmjs.com/package/youtube-dl#downloading-playlists
    function playlist(url) {

        const video = youtubedl(url)

        video.on('error', function error(err) {
            console.log('error 2:', err)
        })

        let size = 0
        let currentFileMessage;
        video.on('info', function (info) {
            console.log('info', info)
            info.playlist
            info.playlist_id
            info.description
            info.title
            // currentFileMessage = `playlist: ${info.playlist} |playlist_id: ${info.playlist_id}| title: ${info.title} | filename: ${info._filename} | size:${info.size} | path:${destFilePathName} | description: ${ info.description}`
            currentFileMessage = `playlist: ${
                info.playlist
            } |playlist_id: ${
                info.playlist_id
            }| title: ${
                info.title
            } | filename: ${
                info._filename
            } | size:${
                info.size
            } | path:${destFilePathName} `
            // TODO: save info.description with same name as the file with .descrition
            size = info.size
            // let output = path.join(__dirname + '/', size + '.mp4')
            // video.pipe(fs.createWriteStream(output))
            var destFilePathName = path.join(destDownloadFolder, info._filename);
            var writeStream = fs.createWriteStream(destFilePathName);
            video.pipe(writeStream);
        })

        let pos = 0
        video.on('data', function data(chunk) {
            pos += chunk.length
            // `size` should not be 0 here.
            if (size) {
                let percent = (pos / size * 100).toFixed(2)
                // process.stdout.cursorTo(0)
                // process.stdout.clearLine(1)
                // process.stdout.write(percent + '%')
                // console.log(percent)
                // setStatusElement(`${percent}%`, false);
                setStatusElement(`${currentFileMessage}`, false);
                setDownloadProgressBar(percent);
            }
        })

        video.on('end', function () {
            console.info("done downloading video file");
            // TODO: replace with update Div symbol
            setStatusElement(finishedDownloadingMessage, true);
            resetDownloadFolderDestElement()
        });

        video.on('next', playlist)
    }
}

/**
 * function to download 
 * TODO: provide language/languages as options, eg check boxes(?)
 */
// https://github.com/przemyslawpluta/node-youtube-dl#downloading-subtitles
function downloadCaptions(url, getAutomaticCations, languagesList, cb) {

    setCaptionsStatus(subtitlesDownloadingMessage, false);

    var options = { // Write automatic subtitle file (youtube only)
        auto: getAutomaticCations,
        // Downloads all the available subtitles.
        all: false,
        // Languages of subtitles to download, separated by commas.
        lang: languagesList,
        // The directory to save the downloaded files in.
        cwd: destDownloadFolder
    };

    youtubedl.getSubs(url, options, function (err, files) {
        if (err) 
            throw err;
        


        if (files.length === 0) {
            setCaptionsStatus(subtitlesNotAviableMessage, false);
        } else {
            setCaptionsStatus(subtitlesDownloadedMessage, true);
            console.info('subtitle files downloaded:', files);
            if (cb) {
                cb(files);
            } else {
                return files;
            }
        }


    });
}

/**
 * kickstart downloafing when user clicks download btn
 */
btnLoadElement.onclick = function () {
    var inputValue = getUrlInput();
    if (inputValue) {
        // TODO: add some checks on validity of (url) url.

        // DOWNLOAD CAPTIONS
        if (captionStatus()) { // automated vs human captions
            var getAutomaticCations;
            if (optionsRadiosHumanCaptionsElement.checked) {
                getAutomaticCations = false;
            } else if (optionsRadiosAutomatedCaptionsElement.checked) {
                getAutomaticCations = true;
            }

            // list of languages
            var languagesList = getSelectedValues(languageSelectionElement);

            downloadCaptions(inputValue, getAutomaticCations, languagesList, function (files) {
                console.info("Downloaded captions", files);
                if (getCaptionPlainTextOption()) { // for files in array
                    console.info('getCaptionPlainTextOption', files);
                    files.forEach(function (f) {
                        var parsed = parseYoutubeVtt(openFile(path.join(destDownloadFolder, f)));

                        parsed = parsed.replace(/\r?\n/g, " ");
                        // console.log('parsed', parsed);
                        var destFilePathName = path.join(destDownloadFolder, f + ".txt");

                        fs.writeFileSync(destFilePathName, parsed);
                        console.info("writing plain text files", destFilePathName, parsed);
                    });
                    // convert vtt to plain text

                    // write plain text to destination folder.
                }
            });
        }

        // DOWNLOAD VIDEO
        downloadVideo(inputValue);
    }
};


// var filePath ="/Users/pietropassarelli/Desktop/Andrea_Ginzburg_-_L\'attualità_di_un_dissidente._L\'idea_di_sviluppo_in_Albert_O._Hirschman-M7LhBTmJHXg.vtt";

// //////////////////////////// Parsing youtube VTT
// /TODO: move to own module
function parseYoutubeVtt(vtt) {
    var vttJSON = webvtt.parse(vtt);
    var result = "";
    // console.log('vttJSON',vttJSON);
    vttJSON.cues.forEach(function (line, index) {
        result += parseYoutubeVttTextLine(line.text) + " ";
    });
    return result;
}


function parseYoutubeVttTextLine(textLine) { // used http://scriptular.com/
    return textLine.replace(/<[A-z|.|0-9|:|/]*>/g, "");
}

function openFile(path) { // console.log("inside open file");
    var result = fs.readFileSync(path, 'utf8').toString('utf-8');
    // console.log("open file result", result);
    return result;
}
// /////////////////////////

// helper function
function getSelectedValues(selectionElement) {
    var selected = [];
    for (var i = 0; i < selectionElement.length; i++) {
        if (selectionElement.options[i].selected) {
            selected.push(selectionElement.options[i].value);
        }
    }
    return selected;
}


// ////language code options
loadExtraLanguagesOptions.onclick = function () {
    populateLanguageCodeOptions();
};

setDownloadDestBtnElement.onclick = function () {
    console.log('setDownloadDestBtnElement', destDownloadFolder);
    const result = dialog.showOpenDialog({
        properties: ['openDirectory']
    }, (result, error) => {

        // })
        // .then(result => {
        console.log('result', result)
        if (error) {
            console.error('result.canceled', result.canceled)
        } else {
            destDownloadFolder = result[0]
            console.log('destDownloadFolder', destDownloadFolder)
            setDownloadFolderDestElement(destDownloadFolder)
        }

        // }).catch(err => {
        // console.log(err)
    })


}

function populateLanguageCodeOptions() {
    languageSelectionElement.innerHTML = makeLanguageCodesOptions(ISO6391);
}

function makeLanguageCodesOptions(ISO6391) {
    var allLanguageCodes = ISO6391.getAllCodes();
    var results = "";

    allLanguageCodes.forEach((lc) => {
        results += `<option value="${lc}">${
            ISO6391.getName(lc)
        } \t| ${
            ISO6391.getNativeName(lc)
        }</option>`;

    });
    return results;
}
// /////////////
// https://stackoverflow.com/questions/44738314/escape-a-space-in-a-file-path-in-node-js
function escapeSpacesInFileName(fileName) {
    return fileName.replace(/(\s+)/g, '\\$1')
}
