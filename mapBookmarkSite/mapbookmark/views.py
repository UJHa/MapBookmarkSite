from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. 첫 페이지입니다!")