#!/usr/bin/env node

var _             = require('lodash'),
    Q             = require('q'),
    ua            = require('universal-analytics'),
    opensubtitles = require("../Index.js"),
    fs            = require("fs"),
    Utils         = require('../lib/Utils');;


/*
 * Parse Arguments
 *
 * --lang <str> -n <int> --retries <int> --retryIn <sec> --download
 */
var ap = require('argparser')
            .nonvals("download")
            .defaults({
               lang : "eng",
               n: 1,
               retries: 3,
               retryIn: 5,
            })
            .err(function(e) {
               console.log(e);
               process.exit(0);
             })
            .parse();


/*
 * Application
 *
 */
var APP = function(apObject){

  // to be set
  this.logintoken = null;

  this.text = ap.arg(0);
  this.lang = ap.opt("lang");
  this.n = ap.opt("n");
  this.download = ap.opt("download");
  this.retries = ap.opt("retries");
  this.retryIn = ap.opt("retryIn");
  this.isFile = false;
  this.isDirectory = false;
  this.track = ua('UA-23672935-2');

  //If is search or file?
  var file = null;
  if( fs.existsSync(this.text) ) {

      var stats = fs.statSync(this.text);
      this.download = true;
      this.isFile = true; //even if is a directory it's a file!
      this.isDirectory = stats.isDirectory();
  }

  this.bindOpensubtitlesEvents();

};


APP.prototype = {


  bindOpensubtitlesEvents: function(){

      var scope = this;


      opensubtitles.api.on(
        "beforeLogin",
        function(token){

          (function(){
              this.onBeforeLogin();
          }).call(scope);

        });

      opensubtitles.api.on(
        "login",
        function(token){

          (function(){
              this.onLogin(token);
          }).call(scope);

        });

      opensubtitles.api.on(
        "search",
        function(results){

          (function(){
              this.onSearch(results);
          }).call(scope);

        });

      opensubtitles.api.on(
        "error",
        function(e){

          (function(){
              this.onError(e);
          }).call(scope);

        });

      // Event onDownloaded
      opensubtitles.downloader.on(
          "downloaded",
          function(data){

            (function(){
              this.onDownloaded(data);
            }).call(scope);

          });

      // Event onDownloading
      opensubtitles.downloader.on(
          "downloading",
          function(data){

            (function(){
              this.onDownloading(data);
            }).call(scope);

          });

  },

  onBeforeLogin: function(token){
    console.log("Trying to login into opensubtitles API...");
  },

  onLogin: function(token){
    console.log("opensubtitles API Login with token", token);
  },

  onSearch: function(){

    console.log("Search results found #", results.length);
    console.log("------------------------");

    for(var i=0; (i<this.n && i<results.length); i++){
       var sub = results[i];
       console.log("Date\t\t", sub.SubAddDate);
       console.log("Language\t", sub.SubLanguageID, sub.LanguageName);
       console.log("Movie\t\t", sub.MovieReleaseName);
       console.log("Subtitle\t", sub.SubFileName);
       console.log("Download\t", sub.SubDownloadLink);

       console.log("------------------------");
    }

    if( this.download ) {

       // download subtitles
       opensubtitles.downloader.download(
                        results,
                        this.n,
                        this.isFile ? this.text : null,
                        function(){
                          opensubtitles.api.logout(this.logintoken);
                          process.exit();
                        }
                    );
    }

  },

  onDownloading: function(data){

     console.log("...Downloading ");

  },

  onDownloaded: function(data){

     console.log("...Downloaded ", data.url, " -> ", data.file);
     console.log("------------------------");

  },

  onError: function(e){


    if(--this.retries<=0){
      console.log("Oops. An error has occurred. Please try again...");
      process.exit();
    }else{
      console.log("Oops. An error has occurred. Retrying in", this.retryIn, "seconds");
      var scope = this;
      setTimeout(
        function(){

          (function(){
            this.run();
          }).call(scope);

        },
        (this.retryIn * 1000)
      );

    }




  },

  /**
   *
   * Run
   *
   * @return {[type]} [description]
   */
  run: function(){

    this.track.pageview("/subtitler.js")
              .event("run", "general")
              .send();

    if(!this.text){
      console.log("\nSUBTITLER USAGE:\n");
      console.log("\tsubtitler", "<file|directory|query> --lang eng|pob|... -n numberOfSubtitles --download --retries <numberOfRetries> --retryIn <secondsToRetry>\n");
      this.track.event("help", "general").send();
      return;
    }

    var scope = this;
    opensubtitles.api.login()
    .done(
        function(logintoken){
            (function(){

              this.logintoken = logintoken;

              if(this.isDirectory) {
                  // get the biggest file in the directory (might be the movie file)
                  this.text = Utils.getBiggestFile(this.text);

                  console.log("Searching subtitles for file:", this.text);
              }

              if(this.isFile){
                  opensubtitles.api.searchForFile(logintoken, this.lang, this.text);
                  this.track.event("download", "general").send();
              }
              else if(this.isDirectory) {
                  opensubtitles.api.searchForFile(logintoken, this.lang, this.text);
                  this.track.event("download", "general").send();
              }
              else {
                  opensubtitles.api.search(logintoken, this.lang, this.text);
                  this.track.event("search", "general").send();
              }

            }).call(scope);



        }
    );

  }

};


new APP().run();
