from django.db import models


class Member(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)


class Marker(models.Model):
    member_id = models.ForeignKey(Member, on_delete=models.CASCADE)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=300)