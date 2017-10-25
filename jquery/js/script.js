var channelName = 'DJASSKICKER';
var video;

function submitClick() {

	var firebaseRef = firebase.database().ref("Video");
	
		$.get(
			"https://www.googleapis.com/youtube/v3/channels", {
				part: 'contentDetails',
				forUsername: channelName,
				key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'},
				function(data){
					$.each(data.items, function(i, item){
						console.log(item);
						pid = item.contentDetails.relatedPlaylists.uploads;
						getVids(pid);
					})
				}
		);
		
		function getVids(pid){
			$.get(
			"https://www.googleapis.com/youtube/v3/playlistItems", {
				part: 'snippet',
				maxResults: 2,
				playlistId: pid,
				key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'},
				function(data){
					var output;
					$.each(data.items, function(i, item){
						console.log("getVids: ", item);
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

						console.log(JSON.parse(JSON.stringify(video)));

						firebaseRef.push().set(video);

						// get CategoryId
						getCategoryId(videoId);
	
						//output = '<li><iframe src=\"//www.youtube.com/embed/'+videoId+'\"></iframe></li>';
						output = '<li>'+videoTitle+'</li>';
						
						// Append to results listStyleType
						$('#results').append(output);
					})
				}
			);
		}
	
		function getCategoryId(videoId){
			console.log("videoId: ", videoId);
			$.get(
				"https://www.googleapis.com/youtube/v3/videos", {
					part: 'snippet',
					id: videoId,
					key: 'AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI'},
					function(data){
						var output;
						$.each(data.items, function(i, item){
							videoCategoryId = item.snippet.categoryId;
							console.log("videoCategoryId: ", videoCategoryId);
	
							video["categoryId"] = videoCategoryId;

							var query = firebaseRef.orderByChild("videoId").equalTo(videoId);
							query.once("child_added", function(snapshot) {
							  snapshot.ref.update({ categoryId: videoCategoryId })
							});

							console.log(JSON.parse(JSON.stringify(video)));
						})
					}
			)
		}
}