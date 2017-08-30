var audioObject = new Audio();
var $channelsList = $('.header>.channels-list'),
    $channelsUl = $('.header>.channels-list>ul'),
	$musicTitle = $('.infor>.title'),
	$musicAuthor = $('.infor>.author'),
	$musicBg = $('.music-box .header'),
	$volumeBar = $('.volume-bar'),
	$volumeBarNow =$('.volume-bar-now'),
    $horn = $('.volume>.horn'),
    $next = $('.btn>.next'),
    $last = $('.btn>.last'),
    $play = $('.btn .play-btn'),
    $pause = $('.btn .pause-btn'),
    $timeNow = $('.process>.time-now'),
    $timeTotal = $('.process>.time-total'),
    $processBar = $('.process-bar'),
    $processBarNow = $('.process-bar-now'),
     $lyricUl = $('.lyric>ul');

var storageChannel = 'public_tuijian_rege';
var musicSid,
    lyricArr = [];

firstEnter();
function firstEnter() {
    setVolume(0.7);
  	getMusic();
    getChannelData();
}
//事件监听
$(audioObject).on('ended', function () {
    getMusic();
});
$(audioObject).on('playing',function () {
    setTime(audioObject.currentTime, $timeNow);
    setTime(audioObject.duration, $timeTotal);
});
audioObject.ontimeupdate = function(){
 	setTime(audioObject.currentTime, $timeNow);
 	var timeBar = Math.ceil(audioObject.currentTime)/Math.ceil(audioObject.duration);	
	showLyric();
    setBar($processBar, $processBarNow,timeBar);
};
//数据请求
function getChannelData() {
    $.ajax({
        type: 'get',
        url: 'http://api.jirengu.com/fm/getChannels.php',
        dataType: 'jsonp',
        jsonp: 'callback'
    }).done(function (ret) {
        renderChannel(ret);
    }).fail(function () {
        alert('数据获取失败！')
    })
}
function getMusic(){
	$.ajax({
		type:'get',
		url:'http://api.jirengu.com/fm/getSong.php',
		dataType:'jsonp',
		jsonp:'callback',
		data:{
			 channel: storageChannel
		}
	}).done(function(ret){	
        if(ret.song[0].url == null){            
            getMusic();
        }else{
            getMusicInfor(ret); 
        }
	}).fail(function(){
		console.log('music erro');
	});
}
function getMusicInfor(data){
/*	console.log(data);*/
	$musicBg.css('background-image','url('+data.song[0].picture+')');
	$musicTitle.text(data.song[0].title);
    $musicAuthor.text(data.song[0].artist);
    musicSid = data.song[0].sid;
  	getLyric();
  	audioObject.src = data.song[0].url;
 	audioObject.play();
}



//事件绑定
$next.on('click',function(){
	getMusic();

});
$pause.on('click',function(){
 	audioObject.pause();
 	$play.css('display','inline-block');
	$pause.css('display','none');
 });
$play.on('click',function(){
	audioObject.play();
	$pause.css('display','inline-block');
	$play.css('display','none');	
});
$volumeBar.on('click',function(e){
	var vol = e.offsetX/$volumeBar.width();
	setVolume(vol);
});
$horn.on('click',function(){
	if($horn.hasClass('icon-VolumeMaxIcon')){
		setVolume(0);
	}else if($horn.hasClass('icon-VolumeOffIcon')){
		setVolume(0.7);
	}
 	$horn.toggleClass('icon-VolumeMaxIcon');
    $horn.toggleClass('icon-VolumeOffIcon');
});
$channelsUl.on('click', 'li', function (e) {
    if( e.target.tagName.toLowerCase() === 'li' ) {   
     var $self = $(e.target);
     storageChannel = $self.attr('channelId');
      getMusic();
    }
});
$('.icon-menu').on('click',function(){
	$('.channels-list').toggle();
});
$('.icon-lyric').on('click',function(){
	$('.lyric').toggle();
});

//功能函数
function setVolume(vol){
	$volumeBarNow.animate({
		width:vol*100+'%'
	});	
	audioObject.volume = vol;
};
function setBar($ct,$ele,number){
	var widths = parseInt($ct.css('width'));
	$ele.css({
		'width': widths *number
	});

}
function setTime(time,$node){
	var timer = timeConver(time);
	$node.text(timer);
}
function timeConver(time){
	var minute  = parseInt(time/60);
	var second = parseInt(time%60);
	if(minute < 10){
	 	minute = '0' + minute
	}
	if(second  < 10){
		second = '0' + second
	}
	timer = minute + ':' +second;
	return timer;
}
$processBar.on('click',function(e){
	var process = e.offsetX/$processBar.width();
	setProcess(process);
	setBar($processBar, $processBarNow,process)
});
function setProcess(cent) {
    audioObject.currentTime = cent * audioObject.duration;
}
function renderChannel(data) {
    var htmls = '';
    $.each(data.channels, function (idx, val) {
        htmls += '<li channelId="'+val.channel_id+'">' + val.name + '</li>';
    });
    $channelsUl.empty();
    $(htmls).appendTo($channelsUl);
}

//歌词部分
function getLyric(){
    $.ajax({
        url: 'http://api.jirengu.com/fm/getLyric.php',
        type: 'post',
        dataType: 'json',
        jsonp: 'callback',
        data: {
            sid: musicSid
        }
	}).done(function(ret){			
		dealLrc(ret.lyric);
		renderLyric();
	}).fail(function(){
		console.log('获取歌词失败');
	})
}

function dealLrc(lyric) {
    if(lyric){
        var lines = lyric.split('\n');
        var timeReg = /\[\d{2}:\d{2}.\d{2}\]/g;
        var result = [];
        if(lines != ''){
            for(var i in lines){
                var time = lines[i].match(timeReg);
                var value = lines[i].replace(timeReg, '');
                for(var y in time){
                    var t = time[y].slice(1, -1).split(':');
                    var timeArr = parseInt(t[0], 10) * 60 + parseFloat(t[1]);
                    result.push([timeArr, value]);
                }
            }
        }
    }
    result.shift();
    result.sort(function (a, b) {
        return a[0] - b[0];
    });
    lyricArr = result;   
}
function renderLyric() {
    var lyrHtmls = '';
    for(var i = 0; i < lyricArr.length; i++){
        if( lyricArr[i][1] === '') continue;
        lyrHtmls += '<li data-time="' + lyricArr[i][0] + '">' + lyricArr[i][1] + '</li>';
    }
    $lyricUl.empty();
    $(lyrHtmls).appendTo($lyricUl);
}
function showLyric() {
    var $lyricLis = $('.lyric>ul>li');
    for(var i = 0; i < lyricArr.length; i++){
        var curT =  $lyricLis.eq(i).attr("data-time");
        var nextT =  $lyricLis.eq(i+1).attr("data-time");
        var curTime = audioObject.currentTime;   
        if( (curTime > curT) && (curTime < nextT) ){
            var liH = 0;
            for(var j = 0; j <= i; j++){
                liH += $lyricLis.eq(j).outerHeight(true);
            }
            $lyricLis.removeClass("active");
            $lyricLis.eq(i).addClass("active");
            $('.lyric>ul').css({
                "top": 50-liH
            });
        }
    }
}

