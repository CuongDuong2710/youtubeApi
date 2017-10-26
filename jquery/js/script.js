var channelName = 'DJASSKICKER';
var video;
var dataItem = null;
function submitChannel() {
	//clear
	$('#results').html('');
	var firebaseRef = firebase.database().ref("Video");	

	var channelLink = $("#channelLink").val();
	var flg = detectChannel(channelLink);
	var key = getChannelFromUrl(channelLink);

	var data = null;
	if(flg.length == 24) {
		data = {
			part: 'contentDetails',
			id: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};
	} else {
		data = {
			part: 'contentDetails',
			forUsername: key,
			key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'
		};
	}
	getUploadsId(data);

}

function getUploadsId(data) {
	$.get(
		"https://www.googleapis.com/youtube/v3/channels", data,
			function(data){
				$.each(data.items, function(i, item){
					//console.log(item);
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
				
				video = {
					categoryId: '',
					image: videoImage,
					isGeneral: 'true',
					title: videoTitle,
					videoId: videoId 
				}

				//console.log(JSON.parse(JSON.stringify(video)));

				//firebaseRef.push().set(video);

				// get CategoryId
				getCategoryId(videoId);

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
				dataItem['pageToken'] = response.nextPageToken;
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

					//var query = firebaseRef.orderByChild("videoId").equalTo(videoId);
					//query.once("child_added", function(snapshot) {
					  //snapshot.ref.update({ categoryId: videoCategoryId })
					//});

					//console.log(JSON.parse(JSON.stringify(video)));
				})
			}
	)
}

function getChannelFromUrl(url) {
	var pattern = new RegExp('^(?:https?:\/\/)?(?:(?:www|gaming)\.)?youtube\.com\/(?:channel\/|(?:user\/)?)([a-z\-_0-9]+)\/?(?:[\?#]?.*)', 'i');
	var matches = url.match(pattern);
	
	if(matches) {
	  return matches[1];
	}
  
	return url;
  }

function detectChannel(url) {
var pattern = new RegExp('^(?:https?:\/\/)?(?:(?:www|gaming)\.)?youtube\.com\/(?:channel\/?)([a-z\-_0-9]+)\/?(?:[\?#]?.*)', 'i');
var matches = url.match(pattern);

if(matches) {
	return matches[1];
}

return url;
}

function submitClick() {

	var firebaseRef = firebase.database().ref("Video");	
}