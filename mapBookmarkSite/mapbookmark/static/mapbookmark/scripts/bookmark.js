var container = document.getElementById('map');
//초기 위치 값 설정
var options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 6
};

// 지도 생성
var map = new kakao.maps.Map(container, options);

$.ajax({
    url:'get_markers',
    data : { 'FD' : 'Front End data'},
    success:function(data)
    {
        for (d in data) {
            console.log(`index : ${d} ================`);
            console.log(`${data[d]['id']}`);
            console.log(`${data[d]['member_id_id']}`);
            console.log(`${data[d]['latitude']}`);
            console.log(`${data[d]['longitude']}`);
            console.log(`${data[d]['title']}`);
            console.log(`${data[d]['content']}`);


            // 마커 이미지의 이미지 주소입니다
            var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

            // 마커 이미지의 이미지 크기 입니다
            var imageSize = new kakao.maps.Size(24, 35);

            // 마커 이미지를 생성합니다
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

            // 마커를 생성합니다
            var marker = new kakao.maps.Marker({
                map: map, // 마커를 표시할 지도
                position: new kakao.maps.LatLng(data[d]['latitude'], data[d]['longitude']), // 마커를 표시할 위치
                title : data[d]['title'], // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
                image : markerImage // 마커 이미지
            });

            // 서버에서 불러온 마커의 인포 윈도우 창의 HTML 문자열
            var load_marker_info_content = '<div style="padding:5px;">'+
                            data[d]['title']+
                            '<br>'+
                            data[d]['content']+
                            '<br>'+
                            '<a href="/edit_marker" style="color:blue">수정하기</a>'+
                            '<br>'+
                            '<a href="/delete_marker" style="color:blue">삭제하기</a>'+
                            '</div>';

            // 마커에 클릭이벤트를 등록합니다
            kakao.maps.event.addListener(marker, 'click', function() {
                markPos = marker.getPosition();
                console.log('마커 클릭!' + markPos);
                // 인포윈도우를 생성합니다
                var infowindow = new kakao.maps.InfoWindow({
                    position : markPos,
                    content : load_marker_info_content,
                    removable : true
                });

            //    infowindow.position = markPos;
                infowindow.open(map, marker);
            });

            // 마커가 지도 위에 표시되도록 설정합니다
//            marker.setMap(map);
        }
    }
});


// 지도를 클릭한 위치에 표출할 마커입니다
var click_marker = new kakao.maps.Marker({
    // 지도 중심좌표에 마커를 생성합니다
    //    position: map.getCenter()
});


//////////// 마커 이벤트 모음 //////////
// 지도에 클릭 이벤트를 등록합니다
kakao.maps.event.addListener(map, 'rightclick', function(mouseEvent) {

    // 클릭한 위도, 경도 정보를 가져옵니다
    var latlng = mouseEvent.latLng;

    // 마커 위치를 클릭한 위치로 옮깁니다
    click_marker.setPosition(latlng);

    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';

    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = message;

    click_marker.setMap(map);
});

// 마커에 클릭이벤트를 등록합니다
kakao.maps.event.addListener(click_marker, 'click', function() {
    markPos = click_marker.getPosition();

    // 클릭 시 생성되는 마커의 인포 윈도우 창의 HTML 문자열
    var click_info_content = '<div style="padding:5px;">'+
                             '클릭한 Marker!'+
                             '<br>'+
                             '<a href="/save_marker?latitude=' + markPos.getLat() + '&longitude=' + markPos.getLng() + '" style="color:blue">저장하기</a>'+
                             '</div>';

    // 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
        position : markPos,
        content : click_info_content,
        removable : true
    });

    infowindow.open(map, click_marker);
});