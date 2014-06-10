---
title: Getting Started with Wordpress on Openshift
author: Grant Shipley
layout: default
---

One of the most popular open source projects that users deploy to their OpenShift gears is WordPress.  However, if you use the standard quickstart or instant app template, you will notice that by default WordPress is not scalable on the OpenShift PaaS.  The main reason for this is the way the application stores media and plugins on the filesystem.  In a scaled environment, you can't be guaranteed that you have shared file storage on all gears.  In this post, I will explain and demonstrate how to create a scaleable WordPress deployment where your media files on hosted on Amazon S3.

##**Signing up for an OpenShift Account**

If you don’t already have an OpenShift account, head on over to the website and signup. It is completely free and Red Hat gives every user three free Gears on which to run your applications. At the time of this writing, the combined resources allocated for each user is 1.5 GB of memory and 3 GB of disk space.


##**Install the client tools on your machine**

The OpenShift client tools are written in a very popular programming language called Ruby. With OSX 10.6 or later and most Linux distributions, ruby is installed by default so installing the client tools is a snap. Simply issue the following command on your terminal application:

	sudo gem install rhc
	
##**Setting up OpenShift**

In order to configure the OpenShift command line tools, all you need to do is enter in the following command:

	rhc setup
	
	
##**Creating the Wordpress instance**

Create a scalable application on the OpenShift system to house your WordPress deployment.  Once you have signed up for an account, all you need to do is issue the following command:

	$ rhc app create wordpress php-5.3 -s
	
The *-s* options informs OpenShift that you want to create your application with a scalable infrastructure.  Essentially this means that your application gear will be fronted with a HAProxy load balancer and your MySQL database will be hosted on a separate gear from your first application gear.  If you want more detailed information on how scaling works, check out this excellent [post[(https://www.openshift.com/blogs/scaling-in-action-on-openshift).


##**Adding MySQL**

As you know, Wordpress requires the use of the MySQL database.  Fortunately, it is a simply process to add a database to your *wordpress* application that you created in the previous step.  To add database support for your installation, enter the following command:

	$ rhc cartridge add mysql-5.1 -a wordpress
	
After this command has been executed, the admin username and password will be displayed on the terminal.  Make a quick note of these in case you need them in the future.  If you fail to remember these, or make a note of them, you always view them again be using the following command:

	$ rhc app show wordpress

##**Downloading the WordPress code**

The OpenShift team maintains a quickstart that makes installing Wordpress extremely easy.  All it takes is a few commands:

**Note:** Execute the following command from inside of your git repository that was cloned to your local machine after creating the wordpress application:

	$ git remote add upstream -m master git://github.com/openshift/wordpress-example.git
	$ git pull -s recursive -X theirs upstream master
	
##**Creating your *themes* and *plugins* directories**

The quickstart source code that we just downloaded assumes that the user does not want to create a scaled Wordpress instance.  Because of this, the code creates a symlink for the *themes* and *plugins* directories and links back to your *data* directory.  Unfortunately, when a scale event happens, the data directory is not synced to your new application gear once it has been spun up and added to your WordPress cluster.  To fix this, we simply need to create these directories.  Change to your *wordpress/php/wp-content* directory enter the following command:

	$ mkdir plugins
	$ mkdir themes
	
##**Deploy your Wordpress instance**

At this point, we have a scaled infrastructure created, a MySQL database installed and configured, and the Wordpress source code in our local git repository.  All we need to do at this point is to deploy our instance up to the OpenShift cloud:

	$ git add .
	$ git commit -am "My first deploy"
	$ git push
	
##**Managing themes and plugins**

In order to correctly sync your themes and plugins over to new nodes as they are created, you can not use the WordPress UI to install these items.  This is because when you use the Wordpress UI to install new items, it stores them on the filesystem on your first OpenShift gear.  When a new gear is created, the service syncs your code over from your git repository so this is where you need to perform the installation of new themes and plugins.

To install a theme or plugin, simply download the .zip file for the item and extract the contents in the proper directory on your local machine,  For example, to install a new theme you would save the file to the *wordpress/php/wp-content/themes* directory and execute the following commands:

	$ unzip themeName.zip
	$ rm themName.zip
	$ git add .
	$ git commit -am "Adding new theme"
	$ git push
	
Once the push completes, you can log in to your WordPress instance and activate the theme.  The process is the same for plugins.

##**What about scaling my media?**

Be default, when you upload images and other media to WordPress, the system stores the data on the local filesystem.  This is problematic for the same reason we previously discussed around themes and plugins.  Fortunately, there are several plugins that you can install that will save your media uploads to a cloud based storage system.  For this blog post, I am storing all of the images on Amazon S3 to ensure that my media can scale just as well as my Wordpress instance.  I am using a plugin called [Amazon S3 and Cloud Front](https://github.com/bradt/wp-tantan-s3).

##**Backups?**

I am paranoid when it comes to backing up my software.  I decided to go with another great plugin called [Updraft[(http://wordpress.org/plugins/updraftplus/) to will backup my blog on a daily basis to my dropbox account.

##**Does it really scale?**

**YES!**  I ran a load test against my blog and finally shut the test down after I scaled up to 10 servers.  The site was fast and responsive even under heavy load and all content and media were served correctly.

Have fun and happy scaling!

## What's Next?

- [Sign up for OpenShift Online](https://www.openshift.com/app/account/new)
- Get your own [private Platform As a Service](https://engage.redhat.com/forms/contact-sales-openshift) (PaaS) 
by evaluating [OpenShift Enterprise](https://www.openshift.com/products/enterprise/try-enterprise)
- Need Help? [Ask the OpenShift Community](https://www.openshift.com/forums/openshift) your questions in the forums
- Showcase your awesome app in the [OpenShift Developer Spotlight](https://www.openshift.com/developer-spotlight). 
Get in the [OpenShift Application Gallery](https://www.openshift.com/application-gallery) today.