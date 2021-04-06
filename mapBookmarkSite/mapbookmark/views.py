from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
import requests

from .models import Member, Marker

REST_API_KEY = '' #앱의 REST API 키를 입력하세요.
REDIRECT_URL = 'http://127.0.0.1:8000/login_request'


def index(request):
    session_id = ''
    if request.session.get('access_token'):
        session_id = request.session.get('access_token')

    return render(request, 'mapbookmark/index.html', {'session_id' : session_id})


def login(request):
    URL = f"https://kauth.kakao.com/oauth/authorize?response_type=code&client_id={REST_API_KEY}&redirect_uri={REDIRECT_URL}"
    return HttpResponseRedirect(URL)


def login_request(request):
    print(request.GET)
    query_dict = request.GET
    code_values = query_dict.getlist('code')

    # 인가 코드가 1개로 정상적으로 반환된 경우에만 토큰을 요청합니다.
    if len(code_values) == 1:
        URL = f'https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id={REST_API_KEY}&redirect_uri={REDIRECT_URL}&code={code_values[0]}'
        print(f'url : {URL}')
        _headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}

        # URL 경로에 인가 코드 정보를 추가하여 카카오 서버에 토큰 요청
        response = requests.post(URL, headers=_headers)

        # 토큰 요청에 대한 결과가 성공(200)했을 때만 access_token 세션에 저장
        if response.status_code == 200:
            _datas = response.json()

            request.session['access_token'] = _datas['access_token']
            request.session.modified = True
        else:
            return HttpResponse(f'카카오 로그인 시 토큰 정보를 받지 못했습니다.실패 코드 : {response.status_code}')

        return HttpResponseRedirect('/sign_up')
    else:
        return HttpResponse('카카오 로그인 시 인가 코드를 받지 못했습니다.')


def logout(request):
    token = request.session['access_token']
    print(f'token : {token}')
    if token:
        URL = "https://kapi.kakao.com/v1/user/logout"
        _headers = {'Authorization': f"Bearer {token}"}
        response = requests.post(URL, headers=_headers)
        if response.status_code == 200:
            del request.session['access_token']
        # 유효하지 않은 토큰 요청 시 세션이 저장한 토큰 제거
        elif response.status_code == -401:
            del request.session['access_token']
        else:
            return HttpResponse(f'로그아웃에 실패했습니다. 실패 코드 : {response.status_code}')
    return HttpResponseRedirect('/')


def sign_up(request):
    if request.session.get('access_token'):
        token = request.session.get('access_token')
        print(f'token : {token}')
        # 카카오 API에서 토큰을 통하여 회원번호를 가져옵니다.
        response = get_token_info(token)
        if response.status_code == 200:
            _datas = response.json()
            member_id = _datas['id']
            print(f'회원번호 : {member_id}')
            # 기존에 가입한 회원일 때
            if Member.objects.filter(id=member_id).count() == 1:
                # 로그인 성공 후 첫 페이지로 이동합니다.
                return HttpResponseRedirect('/')
            elif Member.objects.filter(id=member_id).count() == 0:
                # Member 테이블에 회원정보, 이름 데이터 저장하기(데이터 삽입)

                # rest api를 통하여 이름 정보 불러오기
                URL = f'https://kapi.kakao.com/v2/user/me'
                _headers = {'Authorization': f"Bearer {token}"}
                response = requests.get(URL, headers=_headers)

                _name = ''
                if response.status_code == 200:
                    _user_datas = response.json()
                    _name = _user_datas['properties']['nickname']
                    print(f'로그인 이름 : {_name}')
                else:
                    return HttpResponse(f'이름 정보를 불러오는 것에 실패했습니다. 실패 코드 : {response.status_code}')

                # 데이터를 member 테이블에 추가
                m = Member(id=member_id, name=_name)
                m.save()

                return HttpResponseRedirect('/')
            else:
                return HttpResponse(f'같은 회원 번호가 여러번 저장되었습니다.')

        else:
            return HttpResponse(f'토큰 정보 조회가 실패했습니다. 실패 코드 : {response.status_code}')
        # DB의 member 테이블에서 토큰의 회원번호가 id로 저장 여부를 확인합니다.

def save_marker(request):
    print('asdf')
    if request.session.get('access_token'):
        response = get_token_info(request.session.get('access_token'))
        if response.status_code == 200:
            _datas = response.json()
            member_id = _datas['id']

            member = Member.objects.get(id=member_id)

            member.marker_set.create(latitude=33,longitude=126,title='제목 입력',content='내용 입력')
            return HttpResponseRedirect('/')
    else:
        pass
    return HttpResponse(f'로그아웃 되어서 저장에 실패했습니다. 다시 로그인해 주세요.')


def get_token_info(token):
    URL = f'https://kapi.kakao.com/v1/user/access_token_info'
    _headers = {'Authorization': f"Bearer {token}", 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
    response = requests.get(URL, headers=_headers)

    return response


def get_markers(request):
    data = []
    if request.session.get('access_token'):
        response = get_token_info(request.session.get('access_token'))
        if response.status_code == 200:
            _datas = response.json()
            member_id = _datas['id']

            markers = Marker.objects.filter(member_id=member_id)
            for value in markers.values():
                data.append(value)
            print(data)
    print('마커 데이터들 반환합시다')

    return JsonResponse(data, safe=False)
