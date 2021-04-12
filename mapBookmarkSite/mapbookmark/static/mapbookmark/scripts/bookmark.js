var container = document.getElementById('map');
//초기 위치 값 설정
var options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 6
};

// 지도 생성
var map = new kakao.maps.Map(container, options);

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 지도 좌표를 지번 주소로 변환하여 반환합니다. 변환 함수 콜백 호출
function searchDetailAddrFromCoords(coords, callback) {
    var address_name = ''
    geocoder.coord2Address(coords.getLng(), coords.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            address_name = result[0].address.address_name;
            callback(address_name);
        }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getInputMarkerInfoHTML(id, url, pos, address_name, title='', content=''){
    var click_info_content = '<div style="padding:5px;">' +
                             '<form action="/'+url+'" method="post">' +
                             '<input type="hidden" name="csrfmiddlewaretoken" value="' + getCookie('csrftoken') + '">' +
                             '<input type="hidden" name="id" value="' + id + '" />' +
                             '<input type="hidden" name="latitude" value="' + pos.getLat() + '" />' +
                             '<input type="hidden" name="longitude" value="' + pos.getLng() + '" />' +
                             '<input type="hidden" name="address_name" value="' + address_name + '"/>' +
                             '<label type="text">제목 : </label>' +
                             '<input type="text" name="title" value="' + title + '" />' +
                             '<br>' +
                             '<label type="text">내용 : </label>' +
                             '<input type="text" name="content" value="' + content + '" />' +
                             '<br>' +
                             '<label type="text" name="address_name" value="' + address_name + '">지번 주소 : ' + address_name + '</label>' +
                             '<br>' +
                             '<input type="submit" value="저장">' +
                             '<br>' +
                             '<br>' +
                             '<br>' +
                             '</form>'
                             '</div>';
     return click_info_content;
}

function getViewMarkerInfoHTML(obj){
    var view_info_content = '<div style="padding:5px;">'+
                            obj['title']+
                            '<br>'+
                            obj['content']+
                            '<br>'+
                            obj['address_name']+
                            '<br>'+
                            '<a href="#" onClick="tempFunc(this,' + obj['id'] + ',' + obj['latitude'] + ',' + obj['longitude'] + ',\'' +  obj['address_name'] + '\',\'' + obj['title'] + '\',\'' + obj['content'] + '\');" style="color:blue">수정하기</a>'+
                            '<br>'+
                            '<a href="/delete_marker?id=' + obj['id'] + '" style="color:blue">삭제하기</a>'+
                            '<br>'+
                            '<br>'+
                            '</div>';
     return view_info_content;
}

var info_windows = [];
var info_contents = [];

function addMarkerListener(marker, info_window) {
    kakao.maps.event.addListener(marker, 'click', function() {
        markPos = marker.getPosition();
        console.log('마커 클릭!' + markPos);

        for (let i = 0; i < info_windows.length; i++) {
            info_windows[i].close();
            console.log(info_windows[i].setContent(info_contents[i]));
        }


        info_window.open(map, marker);
    });
}

$.ajax({
    url:'get_markers',
    data : { 'FD' : 'Front End data'},
    success:function(data)
    {
        for (d in data) {
//            console.log(`index : ${d} ================`);
//            console.log(`${data[d]['id']}`);
//            console.log(`${data[d]['member_id']}`);
//            console.log(`${data[d]['latitude']}`);
//            console.log(`${data[d]['longitude']}`);
//            console.log(`${data[d]['title']}`);
//            console.log(`${data[d]['content']}`);

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
            var marker_info_content = getViewMarkerInfoHTML(data[d]);

            // 인포윈도우를 생성합니다
            var info_window = new kakao.maps.InfoWindow({
                position : marker.getPosition(),
                content : marker_info_content,
                removable : true
            });

            info_windows.push(info_window);
            info_contents.push(marker_info_content);

            addMarkerListener(marker, info_window);
        }
    }
}).done(function() { // 서버요청이 성공시의 콜백함수
});


// 지도를 클릭한 위치에 표출할 마커입니다
var click_marker = new kakao.maps.Marker({
    // 지도 중심좌표에 마커를 생성합니다
    //        position: map.getCenter()
});


//////////// 마커 이벤트 모음 //////////
// 지도에 클릭 이벤트를 등록합니다
kakao.maps.event.addListener(map, 'rightclick', function(mouseEvent) {

    // 클릭한 위도, 경도 정보를 가져옵니다
    var latlng = mouseEvent.latLng;

    // 마커 위치를 클릭한 위치로 옮깁니다
    click_marker.setPosition(latlng);

    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다.<br>';

    searchDetailAddrFromCoords(mouseEvent.latLng, function(address_name) {
        message += address_name;
        var resultDiv = document.getElementById('result');
        resultDiv.innerHTML = message;
    });

    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = message;

    click_marker.setMap(map);
});

// 마커에 클릭이벤트를 등록합니다
kakao.maps.event.addListener(click_marker, 'click', function() {
    markPos = click_marker.getPosition();
    console.log('aaaa')
    searchDetailAddrFromCoords(new kakao.maps.LatLng(markPos.getLat(), markPos.getLng()), function(address_name) {
            var click_info_content = getInputMarkerInfoHTML(0, 'save_marker', markPos, address_name);

            // 인포윈도우를 생성합니다
            var info_window = new kakao.maps.InfoWindow({
                position : markPos,
                content : click_info_content,
                removable : true
            });

            info_window.open(map, click_marker);
    });
});

// 마커 수정하기 클릭 시 실행
function tempFunc(tag, id, lat, lng, address_name, title, content){
    info_html = getInputMarkerInfoHTML(id, 'edit_marker', new kakao.maps.LatLng(lat, lng), address_name, title, content);
    $(tag.parentElement)[0].outerHTML = info_html;
}
