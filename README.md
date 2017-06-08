# Electron video (youtube) downloader 

An app that quickly downloads video from youtube. 

The app uses [youtube-dl]() under the hood, which means there is [a long list of supported sites](youtube-dl-supported-extractors.md). 

![sample](sample.png)

## possible todo to extend the app: 
- [x] add check box option for [downloading associated subtitles](https://github.com/przemyslawpluta/node-youtube-dl#downloading-subtitles). 
- [ ] support languages other then english when downloading captions.  
- [ ] if url is of playlist, then [download playlist](https://github.com/przemyslawpluta/node-youtube-dl#downloading-playlists)
- [ ] show [list of extractors in app](https://github.com/przemyslawpluta/node-youtube-dl#getting-the-list-of-extractors) _half implemented, but vimeo not working_
- [ ] _optional_ a video preview for select url.  
- [ ] figure out a way to support direct url to video, eg not from supported extractors.  
- [ ] Add CSS styling
- [ ] Package app and make release.
- [ ] Check if app works on osx, windows, linux. (needs checking if `youtube-dl` works cross platform).
- [ ] add a logo. 
- [ ] refactor yotube downloader as separate component.