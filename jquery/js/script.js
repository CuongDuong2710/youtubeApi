var channelName = 'DJASSKICKER';
var video;
var dataItem = null;
var firebaseRef = null;
var firebaseChannelRef = null;
var firebaseUsernameRef = null;
var firebasePlaylistRef = null;
var flg = null;
// channel data
var channel = null;
// username data
var username = null;
// flag user input playlist link
var flgPlaylist = null;
// playlist data
var playlist = null;

/**
 * Pressing submit channel button
 */
function submitChannel() {
	//initial
	dataItem = null;
	//clear
	$('#results').html('');

	// init firebase
	firebaseRef = firebase.database().ref("video");

	// get channel link
	var channelLink = $("#channelLink").val();
	flg = detectChannel(channelLink);
	var key = getChannelFromUrl(channelLink);

	var data = null;

	// get lasted uploaded video data
	var search = null;


	if (flg.length == 24) { // if user input channel link

		firebaseChannelRef = firebase.database().ref("channel");

		data = {
			part: 'contentDetails',
			id: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};

		var query = firebaseChannelRef.orderByChild("id").equalTo(key).once("value", snapshot => {

			var isChannelExist = snapshot.val();
			console.log("isChannelExist: ", isChannelExist);

			if (isChannelExist) { // if channel exists -> uploading only new videos by compare publishedAt
				console.log("channel exist");
				// get publishAt and compare
				snapshot.forEach(function (childSnapshot) {
					var value = childSnapshot.val();
					var publishedAt = value.publishedAt;
					console.log("publishedAt: ", value.publishedAt);

					// checking channel has new video
					checkAndGetNewVideo(data, publishedAt, key);
				})

			} else { // if channel does not exist -> uploading all videos
				console.log("channel does not exist");

				// data channel
				channel = {
					id: key,
					publishedAt: ''
				};

				search = {
					part: 'snippet',
					channelId: key,
					maxResults: 1,
					order: 'date',
					type: 'video',
					key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
				};

				// get lasted time of channel
				getLastedUploadedVideo(search, key);

				// get all uploaded videos of channel
				console.log("data: ", data);
				getUploadsId(data, key);
			}
		});
	} else { // if user input username link

		firebaseUsernameRef = firebase.database().ref("username");

		data = {
			part: 'contentDetails',
			forUsername: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};

		var query = firebaseUsernameRef.orderByChild("username").equalTo(key).once("value", snapshot => {

			var isUsernameExist = snapshot.val();
			console.log("isUsernameExist", isUsernameExist);

			if (isUsernameExist) { // if channel exists -> uploading only new videos by compare publishedAt
				console.log("username exists");

				// get publishAt and compare
				snapshot.forEach(function (childSnapshot) {
					var value = childSnapshot.val();
					var publishedAt = value.publishedAt;
					console.log("publishedAt: ", value.publishedAt);

					// checking channel has new video
					checkAndGetNewVideo(data, publishedAt, key);
				})

			} else { // if channel does not exist -> uploading all videos
				console.log("username does not exists");

				// data username
				username = {
					username: key,
					publishedAt: ''
				};

				// get all uploaded videos of channel
				console.log("data: ", data);
				getUploadsId(data, key);
			}
			
		});
	}
}

/**
 * Checking channel has new video
 * @param {*} data 
 * @param {*} publishedAt 
 * @param {*} key 
 */
function checkAndGetNewVideo(data, publishedAt, key) {
	$.get(
		"https://www.googleapis.com/youtube/v3/channels", data,
		function (data) {
			$.each(data.items, function (i, item) {

				pid = item.contentDetails.relatedPlaylists.uploads;

				dataItem = {
					part: 'snippet',
					maxResults: 50,
					playlistId: pid,
					key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
				};

				checkNewVideo(dataItem, publishedAt, key);
			})
		}
	);
}

/**
 * Checking if channel has new video, push to firebase
 * @param {*} dataItem 
 * @param {*} publishedAt 
 * @param {*} key 
 */
function checkNewVideo(dataItem, publishedAt, key) {
	$.get(
		"https://www.googleapis.com/youtube/v3/playlistItems", dataItem,
		function (response) {

			var output;

			$.each(response.items, function (i, item) {

				var videoPublishedAtTimeStamp = Date.parse(item.snippet.publishedAt);
				console.log("videoTitle:", item.snippet.title);
				console.log("videoPublishedAtTimeStamp:", videoPublishedAtTimeStamp);
				console.log("publishedAt:", publishedAt);

				if (videoPublishedAtTimeStamp <= publishedAt) { // if video is older, exit function
					console.log("videoPublishedAtTimeStamp <= publishedAt:", videoPublishedAtTimeStamp <= publishedAt);
					console.log("older---");
					return false;
				} else { // if video is new, get and upload to firebase
					console.log("videoPublishedAtTimeStamp > publishedAt:", videoPublishedAtTimeStamp > publishedAt);
					console.log("newer---");
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
						videoId: videoId,
						publishedAt: videoPublishedAt
					}

					if (flg.length === 24) { // updated 'publishedAt' of channel branch
						var query = firebaseChannelRef.orderByChild("id").equalTo(key);
						query.once("child_added", function (snapshot) {
							snapshot.ref.update({ publishedAt: videoPublishedAtTimeStamp })
						});
					} else { // updated 'publishedAt' of username branch
						var query = firebaseUsernameRef.orderByChild("username").equalTo(key);
						query.once("child_added", function (snapshot) {
							snapshot.ref.update({ publishedAt: videoPublishedAtTimeStamp })
						});
					}
					

					//output = '<li><iframe src=\"//www.youtube.com/embed/'+videoId+'\"></iframe></li>';
					output = '<li>' + videoTitle + '</li>';

					// Append to results listStyleType
					$('#results').append(output);
				}

				//console.log(JSON.parse(JSON.stringify(video)));

				// push data to firebase
				firebaseRef.push().set(video);

				// get CategoryId
				getCategoryId(videoId);
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
				if(checkNewVideo(dataTemmp, publishedAt, key)==false){
					return false;
				}
			}
		}
	);
}

/**
 * Pressing submit playlist button
 */
function submitPlaylist() {
	//initial
	dataItem = null;

	flgPlaylist = 1;

	// clear
	$('#results').html('');

	// init firebase
	firebasePlaylistRef = firebase.database().ref("playlist");
	firebaseRef = firebase.database().ref("video");

	// get playlist link
	var playlistLink = $('#playlistLink').val();
	var key = getPlayListFromUrl(playlistLink);
	//console.log("playlistId: " + key)

	// flag check exists
	var isPlaylistExist = null;

	if (key != null) {
		var query = firebasePlaylistRef.orderByChild("playlist").equalTo(key).once("value", snapshot => {
			isPlaylistExist = snapshot.val();

			if (isPlaylistExist) { // if playlist exist
				console.log("exists");
			} else { // if playlist does not exist
				console.log("not exists");
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
				// get all videos of playlist
				getVids(dataItem);
			}
		});
	}
}

/**
 * Pressing submit video button
 */
function submitVideo() {
	// clear
	$('#results').html('');

	// init firebase
	firebaseRef = firebase.database().ref("video");

	var videoLink = $('#videoLink').val();
	var key = getVideoFromUrl(videoLink);

	var data = null;
	if (key !== null) {
		data = {
			part: 'snippet',
			id: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};
	}

	getVideoById(key, data);
}

/**
 * Sending playlistId to playlistItems
 * @param {*} data 
 * @param {*} key 
 */
function getUploadsId(data, key) {
	$.get(
		"https://www.googleapis.com/youtube/v3/channels", data,
		function (data) {
			$.each(data.items, function (i, item) {

				pid = item.contentDetails.relatedPlaylists.uploads;

				dataItem = {
					part: 'snippet',
					maxResults: 50,
					playlistId: pid,
					key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
				};

				getVids(dataItem, key);
			})
		}
	);
}

/**
 * Getting all videos of channel
 */
var count = 0;
function getVids(dataVid, key) {
	$.get(
		"https://www.googleapis.com/youtube/v3/playlistItems", dataVid,
		function (response) {

			var output;

			$.each(response.items, function (i, item) {

				if (flg !== null && flg.length !== 24 && i === 0) { // if user input forUsername
					count++;
					// update
					username["publishedAt"] = Date.parse(item.snippet.publishedAt);

					if (count === 1) {
						// push at first child
						firebaseUsernameRef.push().set(username);
					}
				}

				if (flgPlaylist != null && flgPlaylist === 1 && i === 0) { // if user input playlist link
					playlist["publishedAt"] = Date.parse(item.snippet.publishedAt);
					firebasePlaylistRef.push().set(playlist);
				}

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
					videoId: videoId,
					publishedAt: videoPublishedAt
				}

				//console.log(JSON.parse(JSON.stringify(video)));

				// push data to firebase
				firebaseRef.push().set(video);

				// get CategoryId
				getCategoryId(videoId);

				//output = '<li><iframe src=\"//www.youtube.com/embed/'+videoId+'\"></iframe></li>';
				output = '<li>' + videoTitle + '</li>';

				// Append to results listStyleType
				$('#results').append(output);
			})

			if (typeof response.nextPageToken == "undefined") {
				return false;
			} else {
				$('#results').append("-----------------Next Page-------------");
				//change DATA
				var dataTemmp = dataItem;
				//console.log("response.nextPageToken: " + response.nextPageToken);
				dataTemmp['pageToken'] = response.nextPageToken;
				//alert(dataTemmp['pageToken'] );
				//call again
				if (getVids(dataTemmp) == false) {
					return false;
				}
			}
		}
	);
	return false;
}

/**
 * Getting categoryId of each video
 * @param {*} videoId 
 */
function getCategoryId(videoId) {
	//console.log("videoId: ", videoId);
	$.get(
		"https://www.googleapis.com/youtube/v3/videos", {
			part: 'snippet',
			id: videoId,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		},
		function (data) {
			var output;
			$.each(data.items, function (i, item) {
				videoCategoryId = item.snippet.categoryId;
				//console.log("videoCategoryId: ", videoCategoryId);

				// updated categoryId of videoId
				var query = firebaseRef.orderByChild("videoId").equalTo(videoId);
				query.once("child_added", function (snapshot) {
					snapshot.ref.update({ categoryId: videoCategoryId })
				});

				//console.log(JSON.parse(JSON.stringify(video)));
			})
		}
	)
}

/**
 * Getting video by id
 * @param {*} videoId 
 * @param {*} data 
 */
function getVideoById(videoId, data) {
	$.get(
		"https://www.googleapis.com/youtube/v3/videos", data,
		function (data) {
			$.each(data.items, function (i, item) {
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
					videoId: videoId,
					publishedAt: videoPublishedAt
				}

				// output
				output = '<li>' + videoTitle + '</li>';
				// Append to results listStyleType
				$('#results').append(output);

				// push data to firebase
				firebaseRef.push().set(video);
			})
		}
	)
}

/**
 * Getting lasted uploading video
 */
var lastedPublishedAt = '';
function getLastedUploadedVideo(data, key) {
	$.get(
		"https://www.googleapis.com/youtube/v3/search", data,
		function (data) {
			$.each(data.items, function (i, item) {

				lastedPublishedAt = item.snippet.publishedAt;

				channel["publishedAt"] = Date.parse(lastedPublishedAt);

				firebaseChannelRef.push().set(channel);
			})
		}
	)
}

// get channel or user id by regex
function getChannelFromUrl(url) {
	var pattern = new RegExp('^(?:https?:\/\/)?(?:(?:www|gaming)\.)?youtube\.com\/(?:channel\/|(?:user\/)?)([a-z\-_0-9]+)\/?(?:[\?#]?.*)', 'i');
	var matches = url.match(pattern);

	if (matches) {
		return matches[1];
	}

	return url;
}

// Detect channel link by regex
function detectChannel(url) {
	var pattern = new RegExp('^(?:https?:\/\/)?(?:(?:www|gaming)\.)?youtube\.com\/(?:channel\/?)([a-z\-_0-9]+)\/?(?:[\?#]?.*)', 'i');
	var matches = url.match(pattern);

	if (matches) {
		return matches[1];
	}

	return url;
}

// Get playlist id by regex
function getPlayListFromUrl(url) {
	var regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
	var match = url.match(regExp);
	if (match && match[2]) {
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