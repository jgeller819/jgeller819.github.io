---
layout: page
title: Forward Labs Software
tagline: Developing since 2012
---
{% include JB/setup %}

## About Me
I'm a senior computer science major at Williams College. I started my own company a few years back and I've been doing software consulting on and off since then, but focusing mainly on my schoolwork. I'm a co-captain of the Williams Rugby Football Club and am an avid sports fan (especially the Yankees and Eagles). I'm something of an audiophile with musical tastes so varied that as a composition, they make no sense. In my spare time you can usually find me coding or reading with music on in the background.

## Some of My Work
*    I've been writing a machine learning thesis this year, focusing on multi-class feature selection
*    I spent a summer as a research assistant to [Prof. Andrea Danyluk](http://dept.cs.williams.edu/~andrea/), working on using machine learning to identify individual spotted salamanders using only photographs
*    I've been a teaching assistant for a number of courses: CS 134 -- Intro to Computer Science, CS 136 -- Data Structures and Advanced Programming, CS 237 -- Computer Organization, and CS 334 -- Principles of Programming Languages
*    I was a co-founder and CTO for KYUR8, LLC. We built a photo-sharing [app](https://itunes.apple.com/us/app/kyur8/id605169076?mt=8) and [website](http://kyur8.com) modeled off of Instagram.
*    My first real programming job -- Scott Penberthy and I built a machine learning cloud for what was then known as Connectivity Data Systems to handle natural language processing tasks distributed over a cluster of Amazon EC2 instances

## Some Thoughts

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

