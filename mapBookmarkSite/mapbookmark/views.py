from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
import requests

REST_API_KEY = '5e605b41268c5bff86ecff8272e0fb3a' #앱의 REST API 키를 입력하세요.
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

        return HttpResponseRedirect('/')
    else:
        return HttpResponse('카카오 로그인 시 인가 코드를 받지 못했습니다.')


def logout(request):
    token = request.session['access_token']
    if token:
        URL = "https://kapi.kakao.com/v1/user/logout"
        _headers = {'Authorization': f"Bearer {token}"}
        _response = requests.post(URL, headers=_headers)
        if _response.status_code == 200:
            del request.session['access_token']
        else:
            return HttpResponse(f'로그아웃에 실패했습니다. 실패 코드 : {_response.status_code}')
    return HttpResponseRedirect('/')