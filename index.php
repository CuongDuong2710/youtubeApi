<?php
	$playlistId = $_GET['id'];
	
	$api_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=".$playlistId.
	"&key=AIzaSyDlMX3v-eiC_SLkwuOrpvL19lRpTZbW4fI"; // API key
	
	$data = json_decode(file_get_contents($api_url));
?>

<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>

<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">

<style>
li{
	list-style-type: none;
}
.selected{
	color: green;
	font-weight: bold;
}
</style>

<div class="container">
	<div class="row" style="margin-top: 50px;">
		<div class="col-xs-12 col-md-8 col-sm-8 video-container">
			<iframe width="100%" height="450px" src="https://www.youtube.com/embed/<?php echo $data->items[0]->snippet->
			resourceId->videoId;?>" frameborder="0" allowfullscreen="">
			</iframe>
		</div>
		<div class="col-xs-12 col-md-4 col-sm-4" style="padding: 0px; background-color:#cc;">
			<ul style="padding:0px;">
				<?php 
					foreach($data->items as $video) {
						$title = $video->snippet->title;
						$description = $video->snippet->description;
						$thumbnails = $video->snippet->thumbnails->high->url;
						$videoId = $video->snippet->resourceId->videoId;
						$date = $video->snippet->publishedAt;
				?>
					<li>
						<span style="cursor:pointer; margin-bottom: 10px;" onclick="switchVideo('<?php echo $videoId;?>');">
							<div class="col-xs-12" id="vid-<?php echo $videoId;?>" style="padding-right:0px; padding-top:8px; padding-bottom:8px; border-bottom:1px solid white;">
								<div style="padding-left:0px;" class="image col-md-4 col-lg-4">
									<img src="https://i.ytimg.com/vi/<?php echo $videoId?>/default.jpg">
								</div>
								<div class="text col-md-8 col-lg-8">
									<?php echo $title; ?>
									<p class="date"><?php echo date('M j, Y', strtotime($date)) ?></p>
								</div>
							</div>
						</span>
					</li>
					<?php } ?>
			</ul>
		</div>
	</div>
</div>

<script>
	$("#vid-<?php echo $data->items[0]->snippet->resourceId->videoId; ?>").addClass('selected');
	
	function switchVideo(videoId) {
		$(".video-container iframe").attr('src', 'https://www.youtube.com/embed/'+videoId);
		$(".selected").removeClass('selected');
		$("#vid-"+videoId).addClass('selected');
	}
</script>
