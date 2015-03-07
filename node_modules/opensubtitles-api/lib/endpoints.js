/**
 * User: seb
 * Date: 10/5/12
 * Time: 5:15 PM
 * To change this template use File | Settings | File Templates.
 */
var xmlrpc = require('xmlrpc');

var ep = module.exports = function() {

	this.clientOptions = 'http://api.opensubtitles.org/xml-rpc';
	this.client = xmlrpc.createClient(this.clientOptions);

	/*
	var def = "<strong>array LogIn( $username, $password, $language, $useragent )</strong>"+
	"<strong>string LogOut( $token )</strong>"+
	"<strong>array SearchSubtitles( $token, array(array('sublanguageid' =&gt; $sublanguageid, 'moviehash' =&gt; $moviehash, 'moviebytesize' =&gt; $moviesize, <em>imdbid =&gt; $imdbid</em>, <em>query</em> =&gt; 'movie name', 'season' =&gt; 'season number', 'episode' =&gt; 'episode number', 'tag' =&gt; tag ),array(...)))</strong>"+
	"<strong>array SearchToMail( $token, array( $sublanguageid, $sublanguageid, ...), array( array( 'moviehash' =&gt; $moviehash, 'moviesize' =&gt; $moviesize), array( 'moviehash' =&gt; $moviehash, 'moviesize' =&gt; $moviesize), ...) )</strong>"+
	"<strong>array CheckSubHash( $token, array($subhash, $subhash, ...) )</strong>"+
	"<strong>array CheckMovieHash( $token, array($moviehash, $moviehash, ...) )</strong>"+
	"<strong>array CheckMovieHash2( $token, array($moviehash, $moviehash, ...) )</strong>"+
	"<strong>array InsertMovieHash( $token, array( array('moviehash' =&gt; $moviehash, 'moviebytesize' =&gt; $moviebytesize, 'imdbid' =&gt; $imdbid, 'movietimems' =&gt; $movietimems, 'moviefps' =&gt; $moviefps, 'moviefilename' =&gt; $moviefilename), array(...) ) )</strong>"+
	"<strong>array TryUploadSubtitles( $token, array('cd1' =&gt; array('subhash' =&gt; $submd5hash, 'subfilename' =&gt; $subfilename, 'moviehash' =&gt; $moviehash, 'moviebytesize' =&gt; $moviesize, 'movietimems' =&gt; $movietimems, 'movieframes' =&gt; $movieframes, 'moviefps' =&gt; $moviefps, 'moviefilename' =&gt; $moviefilename), 'cd2' =&gt; array(...) ) )</strong>"+
	"<strong>array UploadSubtitles( $token,array( 'baseinfo' =&gt; array ( 'idmovieimdb' =&gt; $idmovieimdb, 'moviereleasename' =&gt; $scene_releasename, 'movieaka' =&gt; $aka_in_subtitle_language, 'sublanguageid' =&gt; $sublanguageid, 'subauthorcomment' =&gt; $author_comment, 'hearingimpaired' =&gt; $hearing_impaired, 'highdefinition' =&gt; $high_definition, 'automatictranslation' =&gt; $automatic_translation), 'cd1' =&gt; array( 'subhash' =&gt; $md5subhash, 'subfilename' =&gt; $subfilename, 'moviehash' =&gt; $moviehash, 'moviebytesize' =&gt; $moviebytesize, 'movietimems' =&gt; $movietimems, 'moviefps' =&gt; $moviefps, 'movieframes' =&gt; $movieframes, 'moviefilename' =&gt; $moviefilename, 'subcontent' =&gt; $subtitlecontent ), 'cd2' =&gt; array (...) ) )</strong>"+
	"<strong>array DetectLanguage( $token, array($text, $text, ...) )</strong>"+
	"<strong>array DownloadSubtitles( $token, array($IDSubtitleFile, $IDSubtitleFile,...) )</strong>"+
	"<strong>array ReportWrongMovieHash( $token, $IDSubMovieFile )</strong>"+
	"<strong>array ReportWrongImdbMovie( $token, array('moviehash' =&gt; $moviehash, 'moviebytesize' =&gt; $moviebytesize, 'imdbid' =&gt; $imdbid )</strong>"+
	"<strong>array GetSubLanguages( $language = 'en' )</strong>"+
	"<strong>array GetAvailableTranslations( $token, $program )</strong>"+
	"<strong>array GetTranslation( $token, $iso639, $format, $program )</strong>"+
	"<strong>array SearchMoviesOnIMDB( $token, $query )</strong>"+
	"<strong>array GetIMDBMovieDetails( $token, $imdbid )</strong>"+
	"<strong>array InsertMovie( $token, array('moviename' =&gt; $moviename, 'movieyear' =&gt; $movieyear) )</strong>"+
	"<strong>array SubtitlesVote( $token, array('idsubtitle' =&gt; $idsubtitle, 'score' =&gt; $score) )</strong>"+
	"<strong>array GetComments( $token, array($idsubtitle, $idsubtitle, ...))</strong>"+
	"<strong>array AddComment( $token, array('idsubtitle' =&gt; $idsubtitle, 'comment' =&gt; $comment, 'badsubtitle' =&gt; $int) )</strong>"+
	"<strong>array AddRequest( $token, array('sublanguageid' =&gt; $sublanguageid, 'idmovieimdb' =&gt; $idmovieimdb, 'comment' =&gt; $comment ) )</strong>"+
	"<strong>array AutoUpdate ( $program_name )</strong>"+
	"<strong>array NoOperation( $token )</strong>";

	def = def.split('strong>').join('').split('<').join('').split('/');
	for (var i in def) {
		var t_meth = def[i].split(' ');
		var t_args = def[i].split('(');
		t_args.shift();
		var args = t_args.join('');


		console.log(t_meth[1].split('(')[0]+' = function(cb, '+args.replace(/\$/g, '')+'{');
		console.log('   this.call(\''+t_meth[1].replace('(', '')+'\', arguments);');
		console.log('};');
	}
	console.log(def.join('***'));
	*/
};

ep.prototype.call = function(method, args) {
	var cb = args[0];
	var t = [];
	delete(args[0]);
	for(var i in args) {
		t.push(args[i]);
	}
	this.client.methodCall(method, t, cb);
};


/** protocol methods */
ep.prototype.LogIn = function(cb,  username, password, language, useragent ){
	this.call('LogIn', arguments);
};
ep.prototype.LogOut = function(cb,  token ){
	this.call('LogOut', arguments);
};
ep.prototype.SearchSubtitles = function(cb,  token, t_queries){
	this.call('SearchSubtitles', arguments);
};

ep.prototype.SearchToMail = function(cb,  token, t_langs, t_movies){
	this.call('SearchToMail', arguments);
};
ep.prototype.CheckSubHash = function(cb,  token, t_subs_hash){
	this.call('CheckSubHash', arguments);
};
ep.prototype.CheckMovieHash = function(cb,  token, t_movies_hash){
	this.call('CheckMovieHash', arguments);
};
ep.prototype.CheckMovieHash2 = function(cb,  token, t_movies_hash){
	this.call('CheckMovieHash2', arguments);
};
ep.prototype.InsertMovieHash = function(cb,  token, t_movies_info){
	this.call('InsertMovieHash', arguments);
};
ep.prototype.TryUploadSubtitles = function(cb,  token, t_sub){
	this.call('TryUploadSubtitles', arguments);
};
ep.prototype.UploadSubtitles = function(cb,  token, t_sub){
	this.call('UploadSubtitles', arguments);
};
ep.prototype.DetectLanguage = function(cb,  token, t_texts){
	this.call('DetectLanguage', arguments);
};
ep.prototype.DownloadSubtitles = function(cb,  token, t_subid){
	this.call('DownloadSubtitles', arguments);
};
ep.prototype.ReportWrongMovieHash = function(cb,  token, IDSubMovieFile ){
	this.call('ReportWrongMovieHash', arguments);
};
ep.prototype.ReportWrongImdbMovie = function(cb,  token, t_movie){
	this.call('ReportWrongImdbMovie', arguments);
};
ep.prototype.GetSubLanguages = function(cb,  language){
	this.call('GetSubLanguages', arguments);
};
ep.prototype.GetAvailableTranslations = function(cb,  token, program ){
	this.call('GetAvailableTranslations', arguments);
};
ep.prototype.GetTranslation = function(cb,  token, iso639, format, program ){
	this.call('GetTranslation', arguments);
};
ep.prototype.SearchMoviesOnIMDB = function(cb,  token, query ){
	this.call('SearchMoviesOnIMDB', arguments);
};
ep.prototype.GetIMDBMovieDetails = function(cb,  token, imdbid ){
	this.call('GetIMDBMovieDetails', arguments);
};
ep.prototype.InsertMovie = function(cb,  token, t_movie){
	this.call('InsertMovie', arguments);
};
ep.prototype.SubtitlesVote = function(cb,  token, t_vote){
	this.call('SubtitlesVote', arguments);
};
ep.prototype.GetComments = function(cb,  token, t_subids){
	this.call('GetComments', arguments);
};
ep.prototype.AddComment = function(cb,  token, t_comments){
	this.call('AddComment', arguments);
};
ep.prototype.AddRequest = function(cb,  token, t_request){
	this.call('AddRequest', arguments);
};
ep.prototype.AutoUpdate = function(cb,  program_name ){
	this.call('AutoUpdate', arguments);
};
ep.prototype.NoOperation = function(cb,  token ){
	this.call('NoOperation', arguments);
};
