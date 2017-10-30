var channelName = 'DJASSKICKER';
var video;
var dataItem = null;
var firebaseRef = null;
var firebaseChannelRef = null;
var firebaseUsernameRef = null;
var firebasePlaylistRef = null;

// When submit Channel link
function submitChannel() {
	//initial
	dataItem = null;
	//clear
	$('#results').html('');

	// init firebase
	firebaseChannelRef = firebase.database().ref("channel");
	firebaseUsernameRef = firebase.database().ref("username");
	firebaseRef = firebase.database().ref("video");

	// get channel link
	var channelLink = $("#channelLink").val();
	var flg = detectChannel(channelLink);
	var key = getChannelFromUrl(channelLink);

	var data = null;
	var channel = null;
	var username = null;
	if(flg.length == 24) {
		// if user input channel link
		data = {
			part: 'contentDetails',
			id: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};
		// data channel
		channel = {
			id: key,
			publishedAt: ''
		};
		// push to 'channel' branch
		firebaseChannelRef.push().set(channel);
	} else {
		// if user input username link
		data = {
			part: 'contentDetails',
			forUsername: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};
		// data username
		username = {
			username: key,
			publishedAt: ''
		};
		// push to 'username' branch
		firebaseUsernameRef.push().set(username);
	}
	// get all uploaded videos of channel
	getUploadsId(data);

}

// When submit Playlist link
function submitPlaylist() {
	//initial
	dataItem = null;
	// clear
	$('#results').html('');

	// init firebase
	firebasePlaylistRef = firebase.database().ref("playlist");
	firebaseRef = firebase.database().ref("video");	

	// playlist data
	var playlist = null;

	// get playlist link
	var playlistLink = $('#playlistLink').val();
	var key = getPlayListFromUrl(playlistLink);
	//console.log("playlistId: " + key)

	if(key != null) {
		dataItem = {
			part: 'snippet',
			maxResults: 50,
			playlistId: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};
		// data playlist
		playlist = {
			playlist: key,
			publishedAt: ''
		};
		// push to 'playlist' branch
		firebasePlaylistRef.push().set(playlist);

		// get all videos of playlist
		getVids(dataItem);
	}
}

// When submit Video link
function submitVideo() {
	// clear
	$('#results').html('');

	// init firebase
	firebaseRef = firebase.database().ref("video");	

	var videoLink = $('#videoLink').val();
	var key = getVideoFromUrl(videoLink);

	var data = null;
	if(key !== null) {
		data = {
			part: 'snippet',
			id: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};
	}

	getVideoById(key, data);
}

// get all uploaded videos of channel
function getUploadsId(data) {
	$.get(
		"https://www.googleapis.com/youtube/v3/channels", data,
			function(data){
				$.each(data.items, function(i, item){
					console.log(item);
					pid = item.contentDetails.relatedPlaylists.uploads;
					dataItem = {
						part: 'snippet',
						maxResults: 50,
						playlistId: pid,
						key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
					};
					getVids(dataItem);
				})
			}
	);
}

// get all video of channels
function getVids(dataVid){
	$.get(
	"https://www.googleapis.com/youtube/v3/playlistItems", dataVid,
		function(response){
			var output;
			$.each(response.items, function(i, item){
				//console.log("getVids: ", item);
				videoTitle = item.snippet.title;
				videoId = item.snippet.resourceId.videoId;
				videoImage = item.snippet.thumbnails.high.url;
				videoGeneral = 'true';				
				videoPublishedAt = item.snippet.publishedAt;	
				
				video = {
					categoryId: '',
					image: videoImage,
					isGeneral: true,
					title: videoTitle,
					videoId: videoId ,
					publishedAt: videoPublishedAt
				}

				//console.log(JSON.parse(JSON.stringify(video)));

				// push data to firebase
				//firebaseRef.push().set(video);

				// get CategoryId
				//getCategoryId(videoId);

				//output = '<li><iframe src=\"//www.youtube.com/embed/'+videoId+'\"></iframe></li>';
				output = '<li>'+videoTitle+'</li>';
				
				// Append to results listStyleType
				$('#results').append(output);
			})

			if (typeof response.nextPageToken == "undefined"){
				return false;
			} else {				
				$('#results').append("-----------------Next Page-------------");
				//change DATA
				var dataTemmp = dataItem;
				//console.log("response.nextPageToken: " + response.nextPageToken);
				dataTemmp['pageToken'] = response.nextPageToken;
				//alert(dataTemmp['pageToken'] );
				//call again
				if(getVids(dataTemmp)==false){
					return false;
				}
			}	
		}
	);
	return false;
}


function getCategoryId(videoId){
	//console.log("videoId: ", videoId);
	$.get(
		"https://www.googleapis.com/youtube/v3/videos", {
			part: 'snippet',
			id: videoId,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'},
			function(data){
				var output;
				$.each(data.items, function(i, item){
					videoCategoryId = item.snippet.categoryId;
					//console.log("videoCategoryId: ", videoCategoryId);

					video["categoryId"] = videoCategoryId;

					var query = firebaseRef.orderByChild("videoId").equalTo(videoId);
					query.once("child_added", function(snapshot) {
					  snapshot.ref.update({ categoryId: videoCategoryId })
					});

					//console.log(JSON.parse(JSON.stringify(video)));
				})
			}
	)
}

// get video by Id and data
function getVideoById(videoId, data){
	$.get(
		"https://www.googleapis.com/youtube/v3/videos", data,
		function(data){
			$.each(data.items, function(i, item){
				console.log(item);

				videoTitle = item.snippet.title;
				videoId = videoId;
				videoImage = item.snippet.thumbnails.high.url;
				videoGeneral = 'true';	
				videoCategoryId = item.snippet.categoryId;	
				videoPublishedAt = item.snippet.publishedAt;				
				
				video = {
					categoryId: videoCategoryId,
					image: videoImage,
					isGeneral: true,
					title: videoTitle,
					videoId: videoId ,
					publishedAt: videoPublishedAt
				}

				// Append to results listStyleType
				$('#results').append(output);
				
				// push data to firebase
				firebaseRef.push().set(video);
			})
		}
	)
}

// get channel or user id by regex
function getChannelFromUrl(url) {
	var pattern = new RegExp('^(?:https?:\/\/)?(?:(?:www|gaming)\.)?youtube\.com\/(?:channel\/|(?:user\/)?)([a-z\-_0-9]+)\/?(?:[\?#]?.*)', 'i');
	var matches = url.match(pattern);
	
	if(matches) {
	  return matches[1];
	}
  
	return url;
  }

// Detect channel link by regex
function detectChannel(url) {
	var pattern = new RegExp('^(?:https?:\/\/)?(?:(?:www|gaming)\.)?youtube\.com\/(?:channel\/?)([a-z\-_0-9]+)\/?(?:[\?#]?.*)', 'i');
	var matches = url.match(pattern);

	if(matches) {
		return matches[1];
	}

	return url;
}

// Get playlist id by regex
function getPlayListFromUrl(url) {
	var regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
	var match = url.match(regExp);
	if (match && match[2]){
		return match[2];
	}
	return url; 
}

// get video id by regex
function getVideoFromUrl(url) {
	var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match = url.match(regExp);
	if (match && match[2].length == 11) {
	  return match[2];
	}

	return url;
}