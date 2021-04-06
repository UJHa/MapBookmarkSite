from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login, name='login'),
    path('login_request', views.login_request, name='login_request'),
    path('logout', views.logout, name='logout'),
    path('sign_up', views.sign_up, name='sign_up'),
    path('save_marker', views.save_marker, name='save_marker'),
]