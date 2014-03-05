---
layout: page
title: Forward Labs Software
tagline:
---
{% include JB/setup %}

## About Me
I'm a senior computer science major at Williams College. I started my own company a few years back and I've been doing software consulting on and off since then, but focusing mainly on my schoolwork.

## Some Thoughts

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

