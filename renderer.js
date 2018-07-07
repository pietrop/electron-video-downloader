// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

'use strict';
const fs                          = require('fs');
const path                        = require('path');
const youtubedl                   = require('youtube-dl');
const {app}                       = require('electron').remote; 

const ISO6391 = require('iso-639-1');

const  webvtt                     = require('node-webvtt-youtube');

var destDownloadFolder            = app.getPath("videos");

//elements
var urlInputElement 			        = document.getElementById("urlInput");
var btnLoadElement 				        = document.getElementById("btnLoad");
var infoPanelElemnet 			        = document.getElementById("infoPanel");
var statusElement 				        = document.getElementById("status");
var captionsCheckboxElement       = document.getElementById("captionsCheckbox");
var captionsStatusElement         = document.getElementById("captionsStatus");
var videoCheckboxElement          = document.getElementById("videoCheckbox");

var optionsRadiosHumanCaptionsElement = document.getElementById("optionsRadiosHumanCaptions");
var optionsRadiosAutomatedCaptionsElement = document.getElementById("optionsRadiosAutomatedCaptions");
var languageSelectionElement = document.getElementById("languageSelection");
var captionsToPlainTextCheckboxElement = document.getElementById("captionsToPlainTextCheckbox");
// messages 
var downloadingMessage 			      = 'Downloading Video...';
var finishedDownloadingMessage 	  = `Finished downloading Video in ${destDownloadFolder}`;
var subtitlesDownloadedMessage    = `subtitle files downloaded in ${destDownloadFolder}`;
var subtitlesDownloadingMessage   = 'Downloading subtitles files ...';
var subtitlesNotAviableMessage    = 'Could not retrieve subtitles at this time.';
//set element for  select file format. 
// getter  for file element. 
var loadExtraLanguagesOptions   = document.getElementById("extraLanguagesBtn");


/**
 * helper functions 
 */
function requestedVideo(){
  return videoCheckboxElement.checked;
}

function getUrlInput(){
  return urlInputElement.value; 

}

function captionStatus(){
  return captionsCheckboxElement.checked; 
}

function getCaptionPlainTextOption(){
  return captionsToPlainTextCheckboxElement.checked;
}

//set user info in GUI on captions 
function setCaptionsStatus(status, done){
  if(status !== ""){
    captionsStatusElement.innerHTML = `<div class="alert alert-dismissible ${isDone(done)}">${status}</div>`;
  }
  //TODO: status update for captions temporarily disabled. 
}

function setStatusElement(status, done){
  if(status !== ""){
    statusElement.innerHTML = `<div class="alert alert-dismissible ${isDone(done)}">${status}</div>`;
  }
}


function setInfoPanel(info){
  // if(info !== ""){
    infoPanelElemnet.innerHTML =  `<div class="alert alert-dismissible alert-success"><strong>Filename: </strong>${info.filename}<br><strong>size: </strong>${info.size}<br><strong>Destination: </strong>${info.path}</div>`;
  // }
}

function isDone(bool){
  if(bool){
    return 'alert-success';
  }else {
    return 'alert-warning';
  }
}

// urlInputElement.oninput = function(){
//   setCaptionsStatus("");
//   setStatusElement("");
//   setInfoPanel("");
// }

/**
 * main Download function  
 */
//https://youtu.be/pxcI5g2iUCg
function downloadVideo(url){
	//update user GUI on status of download
  
  // reset captions status
  if(requestedVideo()){
    setStatusElement(downloadingMessage, false);
  //setup download with youtube-dl
      var video = youtubedl(url,
        // Optional arguments passed to youtube-dl. 
        // see here for options https://github.com/rg3/youtube-dl/blob/master/README.md
        ['--format=best'],
        // Additional options can be given for calling `child_process.execFile()`. 
        { 
          cwd: destDownloadFolder, 
          maxBuffer: Infinity 
        });

      //listener for video info, to get file name 
      video.on('info', function(info) {

        var destFilePathName =  path.join(destDownloadFolder,info._filename); 
        
        // update GUI with info on the file being downloaded 
        // TODO: turn info panel back on.
        // setInfoPanel({filename: info._filename,size: info.size, path: destFilePathName});

        //TODO: sanilitse youtube file name so that it can be 

        //save file locally 
        var writeStream = fs.createWriteStream(destFilePathName);
        video.pipe(writeStream);
      });


      video.on('end', function() {
        console.info("done downloading video file");
        //TODO: replace with update Div symbol
        setStatusElement(finishedDownloadingMessage, true);
      });
    }
}

/**
 * function to download 
 * TODO: provide language/languages as options, eg check boxes(?)
 */
//https://github.com/przemyslawpluta/node-youtube-dl#downloading-subtitles
function downloadCaptions(url, getAutomaticCations, languagesList, cb){
  
  setCaptionsStatus(subtitlesDownloadingMessage,false);

  var options = {
    // Write automatic subtitle file (youtube only)
    auto: getAutomaticCations,
    // Downloads all the available subtitles.
    all: false,
    // Languages of subtitles to download, separated by commas.
    lang: languagesList,
    // The directory to save the downloaded files in.
    cwd: destDownloadFolder,
  };

  youtubedl.getSubs(url, options, function(err, files) {
    if (err) throw err;

    if(files.length === 0){
      setCaptionsStatus(subtitlesNotAviableMessage, false);
    }else{
      setCaptionsStatus(subtitlesDownloadedMessage, true);
      console.info('subtitle files downloaded:', files);
      if(cb){
        cb(files);
      }else{
        return files;
      }
    }
    
    
  });
}

/**
 * kickstart downloafing when user clicks download btn
 */
btnLoadElement.onclick = function(){
  var inputValue = getUrlInput();
  //TODO: add some checks on validity of (url) url.   
 
  //DOWNLOAD CAPTIONS
  if(captionStatus()){
    //automated vs human captions 
    var getAutomaticCations;
    if(optionsRadiosHumanCaptionsElement.checked){
       getAutomaticCations = false;
    }else if(optionsRadiosAutomatedCaptionsElement.checked){
       getAutomaticCations = true;
    }

    //list of languages 
    var languagesList = getSelectedValues(languageSelectionElement);

    downloadCaptions(inputValue, getAutomaticCations, languagesList, function(files){
      console.info("Downloaded captions", files);
      if(getCaptionPlainTextOption()){
        //for files in array 
        console.info('getCaptionPlainTextOption', files);
        files.forEach(function(f){
           var parsed = parseYoutubeVtt(openFile(path.join(destDownloadFolder,f )));
           
           parsed = parsed.replace(/\r?\n/g, " ");
           // console.log('parsed', parsed);
           var destFilePathName =  path.join(destDownloadFolder,f+".txt"); 

           fs.writeFileSync(destFilePathName, parsed);
           console.info("writing plain text files", destFilePathName, parsed);
        });
        //convert vtt to plain text
        
        //write plain text to destination folder.
      }
    });
  }

  //DOWNLOAD VIDEO
   downloadVideo(inputValue);
};


// var filePath ="/Users/pietropassarelli/Desktop/Andrea_Ginzburg_-_L\'attualità_di_un_dissidente._L\'idea_di_sviluppo_in_Albert_O._Hirschman-M7LhBTmJHXg.vtt";

////////////////////////////// Parsing youtube VTT 
///TODO: move to own module
function parseYoutubeVtt(vtt){
  var vttJSON =webvtt.parse(vtt);
  var result ="";
  // console.log('vttJSON',vttJSON);
  vttJSON.cues.forEach(function(line, index){
    result+= parseYoutubeVttTextLine(line.text)+" ";
  });
  return result;
}


function parseYoutubeVttTextLine(textLine){
  //used http://scriptular.com/
  return textLine.replace(/<[A-z|.|0-9|:|/]*>/g,"");
}

function openFile(path){
  // console.log("inside open file");
  var result = fs.readFileSync(path,'utf8').toString('utf-8');
  // console.log("open file result", result);
  return result;
}
///////////////////////////

//helper function 
function getSelectedValues(selectionElement){
  var selected = [];
  for (var i = 0; i < selectionElement.length; i++) {
      if (selectionElement.options[i].selected){
        selected.push(selectionElement.options[i].value);
      } 
  }
  return selected;
}


//////language code options
loadExtraLanguagesOptions.onclick = function(){
   populateLanguageCodeOptions();
};

function populateLanguageCodeOptions(){
  languageSelectionElement.innerHTML= makeLanguageCodesOptions(ISO6391);
}

function makeLanguageCodesOptions(ISO6391){
  var allLanguageCodes = ISO6391.getAllCodes();
  var results = "";

  allLanguageCodes.forEach((lc)=>{
     results +=`<option value="${lc}">${ISO6391.getName(lc)} \t| ${ISO6391.getNativeName(lc)}</option>`;

  });
  return results;
}
///////////////
//https://stackoverflow.com/questions/44738314/escape-a-space-in-a-file-path-in-node-js
function escapeSpacesInFileName(fileName){
  return fileName.replace(/(\s+)/g, '\\$1')
}
