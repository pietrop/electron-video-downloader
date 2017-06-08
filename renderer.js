// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

'use strict';
const fs = require('fs');
const youtubedl = require('youtube-dl');
const {app} = require('electron').remote; 

var destDownloadFolder = app.getPath("videos");

var urlInputElement 			         = document.getElementById("urlInput");
var btnLoadElement 				         = document.getElementById("btnLoad");
var infoPanelElemnet 			        = document.getElementById("infoPanel");
var statusElement 				        = document.getElementById("status");
var fileExtensionsSelectElement 	= document.getElementById("fileExtensionsSelect");

var downloadingMessage 			    = "Downloading ...";
var finishedDownloadingMessage 	= "Finished downloading";
//set element for  select file format. 
// getter  for file element. 

function setInfoPanel(info){
  infoPanelElemnet.innerHTML = info;
}

function setStatusElement(status){
	statusElement.innerHTML = status;
}

function getFileExtension(){
	return fileExtensionsSelectElement.options[fileExtensionsSelectElement.selectedIndex].value;	
}

//https://youtu.be/pxcI5g2iUCg
function downloadVideo(url, fileExtension){
	setStatusElement(downloadingMessage);
  var video = youtubedl(url,
    // Optional arguments passed to youtube-dl. 
    ['--format=18'],
    // Additional options can be given for calling `child_process.execFile()`. 
    { cwd: __dirname });


  video.on('info', function(info) {
   var destFilePathName= destDownloadFolder+"/"+info._filename+'.'+getFileExtension();

   setInfoPanel('<strong>Filename: </strong>' + info._filename+'<br><strong>size: </strong>' + info.size+'<br>'+'<strong>Destination: </strong>'+destFilePathName);

    //TODO: sanilitse youtube file name so that it can be 

    var writeStream = fs.createWriteStream(destFilePathName);
    video.pipe(writeStream);
  });


  video.on('end', function() {
    //TODO: replace with update Div symbol
    setStatusElement(finishedDownloadingMessage);
  });

}

btnLoadElement.onclick = function(){
  var inputValue = urlInputElement.value; 
  //TODO: some checks on validity of (url) url. 
  
  //TODO get user selected file extension 
  
  downloadVideo(inputValue, getFileExtension());

};
