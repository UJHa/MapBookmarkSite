from django.contrib import admin

# Register your models here.
from .models import Member, Marker

admin.site.register(Member)
admin.site.register(Marker)