from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login, name='login'),
    path('login_request', views.login_request, name='login_request'),
    path('logout', views.logout, name='logout'),
    path('sign_up', views.sign_up, name='sign_up'),
    path('save_marker', views.save_marker, name='save_marker'),
    path('get_markers', views.get_markers, name='get_markers'),
    path('delete_marker', views.delete_marker, name='delete_marker'),
    path('edit_marker', views.edit_marker, name='edit_marker'),
]