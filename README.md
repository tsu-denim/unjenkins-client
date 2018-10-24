# README #

This repository is for unjenkins-client, a rest based thin-client that can read responses from [un-jenkins](https://bitbucket.org/kdwaechter/un-jenkins)

### Whats so great about it? ###

* Provides a polished and easy to read dashboard for your Jenkins pipeline that can be proudly displayed on a big flat screen in your work area or just your desktop. 
* Client is very lightweight, should have no trouble powering a flatscreen with a raspberry pi.
* unjenkins-client provides an easy to read dashboard for build histories of Jenkins jobs.
* Dashboard refreshes automatically, or manually via hidden refresh button.
* It uses just plain 'ol javascript to do an http call to unjenkins. No extra libraries, in other words its simple, fast, and easy to work with.
* Can support different themes for different teams, such as glorious potato theme!

### How do I get set up? ###

* Pull repo and host via local web-server
* Access url http://localhost/unjenkins-client/jenkinsClient.html#view/Content%20Management/view/CM%20API%20and%20UI/
* The part of the URL after the # is copied straight out of the url for a Jenkins view, https://jenkins.inintca.com:8443/view/Content%20Management/view/CM%20API%20and%20UI/.

Voila! ![Screen Shot 2016-01-06 at 4.16.29 PM.png](https://bitbucket.org/repo/y6K9d9/images/548361218-Screen%20Shot%202016-01-06%20at%204.16.29%20PM.png)