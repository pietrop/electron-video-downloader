// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

'use strict';
const fs                          = require('fs');
const path                        = require('path');
const youtubedl                   = require('youtube-dl');
const {app}                       = require('electron').remote; 

var destDownloadFolder            = app.getPath("videos");

//elements
var urlInputElement 			        = document.getElementById("urlInput");
var btnLoadElement 				        = document.getElementById("btnLoad");
var infoPanelElemnet 			        = document.getElementById("infoPanel");
var statusElement 				        = document.getElementById("status");
var captionsCheckboxElement       = document.getElementById("captionsCheckbox");
var captionsStatusElement         = document.getElementById("captionsStatus");

// messages 
var downloadingMessage 			      = 'Downloading ...';
var finishedDownloadingMessage 	  = 'Finished downloading';
var subtitlesDownloadedMessage    = 'subtitle files downloaded';
var subtitlesDownloadingMessage   = 'Downloading subtitles files ...';
//set element for  select file format. 
// getter  for file element. 


/**
 * helper functions 
 */
function setInfoPanel(info){
  infoPanelElemnet.innerHTML = info;
}

function setStatusElement(status){
	statusElement.innerHTML = "<div class='alert alert-dismissible alert-warning'>"+status+"</div>";
}


function getUrlInput(){
  return urlInputElement.value; 

}

function captionStatus(){
  return captionsCheckboxElement.checked; 
}
//set user info in GUI on captions 
function setCaptionsStatus(status){
  //TODO: status update for captions temporarily disabled. 
    captionsStatusElement.innerHTML = "<div class='alert alert-dismissible alert-warning'>"+status+"</div>";
}

/**
 * main Download function  
 */
//https://youtu.be/pxcI5g2iUCg
function downloadVideo(url){
	//update user GUI on status of download
  setStatusElement(downloadingMessage);
  // reset captions status
  setCaptionsStatus('...');


  //setup download with youtube-dl
  var video = youtubedl(url,
    // Optional arguments passed to youtube-dl. 
    // see here for options https://github.com/rg3/youtube-dl/blob/master/README.md
    ['--format=best'],
    // Additional options can be given for calling `child_process.execFile()`. 
    { cwd: destDownloadFolder });

  //listener for video info, to get file name 
  video.on('info', function(info) {

    var destFilePathName =  path.join(destDownloadFolder,info._filename); 
  
    // update GUI with info on the file being downloaded 
    setInfoPanel('<div class="alert alert-dismissible alert-success"><strong>Filename: </strong>' + info._filename+'<br><strong>size: </strong>' + info.size+'<br>'+'<strong>Destination: </strong>'+destFilePathName+"</div>");

    //TODO: sanilitse youtube file name so that it can be 

    //save file locally 
    var writeStream = fs.createWriteStream(destFilePathName);
    video.pipe(writeStream);
  });


  video.on('end', function() {
    //TODO: replace with update Div symbol
    setStatusElement(finishedDownloadingMessage);
  });

}

/**
 * function to download 
 * TODO: provide language/languages as options, eg check boxes(?)
 */
//https://github.com/przemyslawpluta/node-youtube-dl#downloading-subtitles
function downloadCaptions(url){
  setCaptionsStatus(subtitlesDownloadingMessage);

  var options = {
    // Write automatic subtitle file (youtube only)
    auto: false,
    // Downloads all the available subtitles.
    all: false,
    // Languages of subtitles to download, separated by commas.
    lang: 'en',
    // The directory to save the downloaded files in.
    cwd: destDownloadFolder,
  };

  youtubedl.getSubs(url, options, function(err, files) {
    if (err) throw err;
    setCaptionsStatus(subtitlesDownloadedMessage);
    console.info('subtitle files downloaded:', files);
  });
}

/**
 * kickstart downloafing when user clicks download btn
 */
btnLoadElement.onclick = function(){
  var inputValue = getUrlInput();
  //TODO: some checks on validity of (url) url.   
  downloadVideo(inputValue);
  if(captionStatus()){
    downloadCaptions(inputValue);
  }
};





