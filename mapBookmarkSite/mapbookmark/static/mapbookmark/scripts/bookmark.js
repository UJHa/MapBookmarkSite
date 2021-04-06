$.ajax({
    url:'get_markers',
    data : { 'FD' : 'Front End data'},
//    dataType: "json",
    success:function(data)
    {
        console.log(data[0]);
//        $('#data_table').html(data)
        for (d in data) {
//            console.log('데이터 받아옴 : ' + property);
            console.log(`index : ${d} ================`);
            console.log(`${data[d]['id']}`);
            console.log(`${data[d]['member_id_id']}`);
            console.log(`${data[d]['latitude']}`);
            console.log(`${data[d]['longitude']}`);
            console.log(`${data[d]['title']}`);
            console.log(`${data[d]['content']}`);
//            {'id': 1, 'member_id_id': 1679977277, 'latitude': 33, 'longitude': 126, 'title': '제목입니다', 'content': '.내용ㅇ입니다.'}
        }
    }
});
//$.ajax({
//    url: "/ajax/",
//    type: "POST",
//    data: name,
//    cache:false,
//    dataType: "json",
//    success: function(resp){
//        alert ("resp: "+resp.name);
//    }
//});

var container = document.getElementById('map');
//초기 위치 값 설정
var options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 6
};

var map = new kakao.maps.Map(container, options);

// 지도를 클릭한 위치에 표출할 마커입니다
var marker = new kakao.maps.Marker({
    // 지도 중심좌표에 마커를 생성합니다
//    position: map.getCenter()
});

// 지도에 마커를 표시합니다
marker.setMap(map);

// 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
var iwContent = '<div style="padding:5px;">'+
                'Hello World!'+
                '<br>'+
                '<a href="/save_marker" style="color:blue">저장하기</a>'+
                '</div>';


//////////// 마커 이벤트 모음 //////////
// 지도에 클릭 이벤트를 등록합니다
// 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
kakao.maps.event.addListener(map, 'rightclick', function(mouseEvent) {

    // 클릭한 위도, 경도 정보를 가져옵니다
    var latlng = mouseEvent.latLng;

    // 마커 위치를 클릭한 위치로 옮깁니다
    marker.setPosition(latlng);

    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';

    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = message;

});

// 마커에 클릭이벤트를 등록합니다
kakao.maps.event.addListener(marker, 'click', function() {
    markPos = marker.getPosition();
    console.log('마커 클릭!' + markPos);
    // 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
        position : markPos,
        content : iwContent,
        removable : true
    });

//    infowindow.position = markPos;
    infowindow.open(map, marker);
});