---
title: How to Migrate Drupal to Openshift
author: Diane Mueller
layout: default
---

With [DrupalCon](http://portland2013.drupal.org/) just around the corner, I decided brush up on my Drupal skills and to make the jump to host one of my Drupal web sites on [OpenShift Online](http://openshift.com). I thought I should take you on my journey. I will show you the triumphs, help you avoid the pitfalls of migrating a Drupal installation from one platform (Dreamhost) to the brave new world of PaaS on OpenShift Online and find ways to make it as painless as possible.
    
If you know me you know that I love technology. I love writing about technology. I love spinning up websites to talk about tech. I love PaaS. I hate building servers. I also have long-standing love/ hate relationship with Drupal.   
   
## The Online Project
   
One of my personal projects is a website called [XBRLSpy](http://www.xbrlspy.org). It is a website that I have been running in one form or another for over twelve years. But, more recently it has fallen into the category of “backburner” and it has been in need of a little pick me up.
  
When I decided to try my first OpenShift project, I decided that [XBRLSpy](http://www.xbrlspy.org) would be my best candidate for a technology refresh.
  
The website itself is a simple blog-like setup and, since it has been somewhat neglected for a year or so, it didn’t entirely matter if I played a bit with the look and feel. The content also needed some love and massaging and I was ready to dive in.
   
## Installing Drupal on OpenShift
   
You thought I was going to head right into the collection of data, didn’t you? Hah! No such luck. I know I first need to install Drupal on my OpenShift system. There are a few pieces that need to happen before I can put my website anywhere. Annoying I know, but it is a necessary step in this whole process.
   
### Creating your Application
   
The first thing I need to do on OpenShift is to create my application. After logging into OpenShift, I selected the My Apps button, located in the top right corner. So far, so good.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2009_54_56-OpenShift%20by%20Red%20Hat%20_%20OpenShift%20by%20Red%20Hat.png" width="317" height="164" alt="" title="" />
   
Now, I need to add my application (called a gear in OpenShift terminology). I can do this from the My Apps page by selecting the add application button.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2009_55_07-OpenShift%20by%20Red%20Hat.png" width="261" height="92" alt="" title="" />
  
After clicking add application, I can now select which type of application I want. I already know I need Drupal so, I select it from the list.

<img src="https://www.openshift.com/sites/default/files/2013-05-02%2009_55_23-An%20open%20source%20content%20management%20platform%20written%20in%20PHP%20powering%20millions%20of%20w.png" width="532" height="72" alt="Drupal7" title="" />
 
Now, I need to give it a name.

<img src="https://www.openshift.com/sites/default/files/2013-05-02%2009_55_49-OpenShift%20by%20Red%20Hat.png" width="492" height="106" alt="Public URL" title="" />

You can add a name to the public URL (the URL that you get when you first install your application) and these will vary since there are different systems where the installs are placed when they are created. Once I have chosen my name, I can then click on the create application button.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2009_56_09-OpenShift%20by%20Red%20Hat.png" width="279" height="119" alt="Create Application" title="" />
  
That’s it! I now wait for a moment for the application to install and I am half way there.
 
## Installing Cartridges
 
The next thing I need to do is add cartridges. Cartridges are OpenShift’s answer to installing different supporting applications when you need them. You can add cartridges to applications you create. It sounds very much like a gaming console influence, doesn’t it? I think it makes sense as most of us that use technology are familiar with old cartridges, right?
 
For my Drupal migration, I will want cartridges for phpMyAdmin for editing and managing my database, and cron jobs. I will need the database administration to make my life on OpenShift easy and the cron jobs for my Drupal maintence crons.
 
I first went over to my installation and clicked the handy arrow on the right hand side of my application URL. 
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2010_50_51-OpenShift%20by%20Red%20Hat.png" width="600" height="142" alt="WickedAwesomePants" title="" />
 
This takes me to the cartridge page. I have a wide selection to choose from but I only need a couple (by the way, there is a limit of three cartridges for the free gears).
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2010_51_19-Add%20a%20Cartridge%20_%20OpenShift%20by%20Red%20Hat.png" width="345" height="160" alt="phpadmin" title="" />
 
I select my first cartridge (yes, MySQL is also a cartridge but it was installed for me when I created the application). Click select.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2010_51_31-Add%20a%20Cartridge%20_%20OpenShift%20by%20Red%20Hat.png" width="483" height="297" alt="phpadmin add cartridge" title="" />
 
I then complete the installation by selecting add cartridge. This will install the application on my Drupal installation. I then repeat this process for the Cron cartridge. 
 
Once both cartridges are installed, I will now get to start my move!
 
## Connecting To OpenShift
 
Oh, wait, here is where I ran into a bit of trouble. I needed to connect to OpenShift. How does one do this? They do it by using SSH authentication keys. What this means is you need to play with public and private keys.
 
With most web hosts, they will give you different ways to connect to your data. Usually, this will consist of connecting to your database using either command line (more common with non-shared / VPS hosting) or via some type of graphical interface like phpMyAdmin. phpMyAdmin almost everywhere as it is a powerful software package and can make interaction with your database easier and less head-achy.
 
### Openshift Keys
 
Each account on OpenShift allows you to set up a series of keys. You can use these keys to authenticate. You can create a public and private key right from your own computer. All you need to do (once you’ve created them) is install the private key on your computer and install the public key on OpenShift. Confused yet? Don’t worry this gets easier.
 
### PuTTY
 
PuTTY is an SSH client that most people can install to use on their Mac or PC computers. This program comes with a series of bits and bobs that you can use - but our main focus will be on PuTTY itself, PuTTYGen, and Pageant. PuTTY allows you to access the command line for each of your OpenShift gears, PuTTYGen allows you to create pairs of security keys, and Pageant allows you to run keys on your local computer in order for non-PuTTY software to access the keys you’ve made.
 
### sFTP
 
Ack! I want to use sFTP but I don’t know how! Never fear, this is what Pageant is for. In this example, I will assume you are using FileZilla, one of the most powerful FTP software packages available.
 
When you run Pageant, it will allow you to install your private key locally. Once you install the key, FileZilla will be able to read the key and use that for the authentication process. What you need to do is:
 
* Run Pageant.
* Click install key.
* Select the private key you have created for your gear.
 
That’s it!
 
Make sure to stop running Pageant when you don’t need it. Sometimes it can cause your computer to freak out and act a little funny.
 
## The Preparation
 
The first thing I needed to do was figure out what technology assets I have. There are three main components of average Drupal installation:
 
* Software
* Database
* and Files 
 
## Software
 
I won’t need the core Drupal installation as OpenShift provides a custom setup for Drupal. The only things I will need are any contributed modules and libraries files that I may want to keep. I can just reinstall these from the Drupal website as well, so, these are not entirely important.
 
## Database
 
This is probably the most crucial and most involved part of the whole process. Without the database, the site won’t exist. I will want to export this and re-import it onto the OpenShift service. It should be fairly easy as phpMyAdmin is available both on OpenShift (as a cartridge) and as a standard feature on my older hosting service.
 
### Exporting Data
 
I will need to get my database off of the current hosting service. I logged into the hosting company control panel and selected the phpMyAdmin interface for the database I want.
 
Once I am looking at all of the tables available inside of my database, I clicked on the export button. This takes me to the data export screen. There are a lot of features on this screen but I can ignore all of them as the defaults are enough for most exports. I am not doing anything fancy here, I just want my data.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-01%2015_35_34-xbrlspy.org%20_%20mysql.xbrlspy.org%20_%20xbrlspy_7x%20_%20phpMyAdmin%203.3.10.4.png" width="388" height="115" alt="addfile gzipped" title="" />
 
The main thing I want to do here is to make sure I remember what my file name is called. Sometimes you will see phpMyAdmin suppling you with default selections like “___DB___”. These are probably fine for most people but I like to make thing happen the way I will remember them. I hate losing data and this is not the time to start. I gave my export the name “xbrlspy-export” and selected the file to be “gzipped”. This means the exported file will download as a compressed file. A note about compressed SQL export files is you can import them into any other database even while compressed. It makes for an easy and clean transfer.
 
After I click on the OK button, I downloaded my compressed file without any problems.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-01%2015_40_51-.png" width="316" height="84" alt="download my compressed file" title="" />
 
With that done, there is no sense in waiting. I can head over to my fancy new OpenShift install and start the import process.
 
#### MyIASM vs. InnoDB
 
Depending on your hosting provider, here is something you should consider. One thing worth mentioning is the MyIASM vs. InnoDB debate. I won’t go into a huge amount to detail but I will say that InnoDB allows for more flexibility. Double check to see if your database has references to MyIASM. If they do, you can do a text search and replace in any text editor. If you have troubles around here, you may seek a nerd to assist.
 
* Extract your compressed SQL file
* Open the file in a text editor
* Do a search and replace of `MyIASM` with `InnoDB`
 
This will replace all of the entries and when you import the data it will adopt the new settings.
 
Make sure to export the database file as a GZIPPED file. Gzip is a FOSS form of the more common ZIP compression method, used for shrinking files. Once you have your exported database saved on your computer, its time to make your import.
 
### Importing Data
 
The first thing I need to do is log into my Drupal application phpMyAdmin install. I installed this earlier with the phpMyAdmin cartridge. To access it, I need to hit up the database.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-01%2015_22_35-Access%20denied.png" width="600" height="202" alt="Authentication Required" title="" />
 
I logged into my database with my MySQL credentials. I then selected my database from the left hand column. Careful here, don’t select schema or anything else. You only want the database created for the Drupal install.
 
Now, here is something that people will always tell you is crazy. Since we’ve already installed Drupal on OpenShift, we need to drop the tables that were created. Don’t worry, we don’t actually require this data. We require the data that we have already exported from our existing website.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-01%2016_03_51-xbrlspy-clawbackend.rhcloud.com%20_%20127.11.156.1%20_%20xbrlspy%20_%20phpMyAdmin%203.5.8.png" width="448" height="252" alt="watchdog check all" title="" />
   
Select the database and when you are looking at all of the tables, scroll down to the bottom and select the Check All link. This will check all of the tables in your database. Then from the drop down, select Drop. You will be taken to a confirmation screen.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-01%2016_04_39-xbrlspy-clawbackend.rhcloud.com%20_%20127.11.156.1%20_%20xbrlspy%20_%20phpMyAdmin%203.5.8.png" width="600" height="153" alt="pink" title="" /> 
 
Click "Yes".
 
This will drop all of the tables in your database. Now, for the good part. Let’s import the data. Then click the import tab.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2011_31_08-xbrlspy-clawbackend.rhcloud.com%20_%20127.11.156.1%20_%20xbrlspy%20_%20phpMyAdmin%203.5.8.png" width="192" height="146" alt="Import" title="" />
 
Select the browse button and select the compressed database.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2011_31_23-xbrlspy-clawbackend.rhcloud.com%20_%20127.11.156.1%20_%20xbrlspy%20_%20phpMyAdmin%203.5.8.png" width="549" height="123" alt="Select Compressed" title="" />
  
Click 'Go'. This will start the import and should take only a minute or two.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2011_31_32-xbrlspy-clawbackend.rhcloud.com%20_%20127.11.156.1%20_%20xbrlspy%20_%20phpMyAdmin%203.5.8.png" width="399" height="246" alt="SQL Click GO" title="" />
  
Success! The database will be imported. If you head back to the application on your browser, it will load the web site data from the database you just imported.
 
## Files
 
Drupal is fairly organized with the files system. There are two files directories that I will need to worry about: the main files directory and the private files directory. The main files storage is where everything I upload lives. These are all public files and freely available from my website. The private files folder is where I keep files that are not freely available and are kept in a private folder that is not available to the general web visitor. I haven’t used this folder before since I upgraded to Drupal 7 and I know it is empty. But for those of you who may have private files, you will want to make sure to download these to your computer in preparation for migration.
 
### Download Files Directory From Your Old Host
 
Off to the FTP directory I go, a place where I know I will recognize the things I need.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2007_52_08-xbrlspy.org%20on%20dreamhost%20-%20sftp___pompidou%40ravenwest.dreamhost.com%20-%20FileZilla.png" width="344" height="281" alt="files" title="" />
  
Looking at the directory, I know right away that I will not require most of this. I know that once I create my OpenShift installation, it will build the Drupal install for me. What I really need then is just my individual site data. Drupal is very good at keeping this data contained within the sites directory. 
 
Inside the sites directory you can see that I only have the default settings. This means that my entire site is contained within the default folder. If you were to have more than a single website living off the same installation, you would see a bunch of sites in here. I used to run this website with five other sites but my last upgrade moved to Drupal 7 and I only updated to a single site. This is good news. Easy peasy.
 
Inside the default folder are two important things: the files directory and the themes directory.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2008_22_11-xbrlspy.org%20on%20dreamhost%20-%20sftp___pompidou%40ravenwest.dreamhost.com%20-%20FileZilla.png" width="287" height="207" alt="files and themes" title="" />
  
For our migration we can ignore anything else as we will not need the database information. If there is anything within the settings file, I can either download it or reconfigure it again once I move everything over. I know that, for my site, I haven’t modified the settings.php file and I can safely ignore it. 
 
I will now download these two directories to my laptop. It is important not to mess with them and to keep them as they are on the old hosting service.
 
### Upload To OpenShift
 
The Drupal structure on OpenShift is a customized system where the files and directories may not be familiar to those who don’t work within their Drupal installations. But never fear, once you know where to look, it should all become clear.
 
Uploading the files is easy. Once you’ve connected to the site via sFTP, here is where you want to place things.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2007_25_51-xbrlspy.org%20on%20openshift%20-%20sftp___5175be225973caada30001a2%40xbrlspy-clawbackend.r.png" width="209" height="159" alt="app-root" title="" />
  
Head on into the folder app-root.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2007_26_00-xbrlspy.org%20on%20openshift%20-%20sftp___5175be225973caada30001a2%40xbrlspy-clawbackend.r.png" width="182" height="148" alt="data" title="" /> 
 
Then into data.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2007_26_09-xbrlspy.org%20on%20openshift%20-%20sftp___5175be225973caada30001a2%40xbrlspy-clawbackend.r.png" width="184" height="142" alt="sites" title="" />
  
And then, finally, into sites. The data directory is where most of the information related to your site will live. Inside of sites, you will see the default folder. Once here, you can upload your files info the sites/default folder.
 
### Don’t Forget Your Private Files
 
Older versions of Drupal stored private uploads in secure directories within the main files directory. In Drupal 7, there is a private files section where files are stored outside of your web site root folder. If you have any private files available, you will want to make sure those files are also moved over in addition to your main files repository.
 
OpenShift provides you with a protected directory under /app-root/data/private 
 
Once I uploaded my private files, I was able to gain access to them again by reconnecting my private folder in the files system.
 
## Themes
 
To upload the theme files into the new Drupal install on OpenShift, you’re going to have to do a little permissions magic. It sounds daunting (well, maybe) but it isn’t. When Drupal creates the /sites/default folder, it sets that directory’s permissions to 555. This means we can make additional folders. But don’t fret. Here is what you need to do to make this happen using FTP software.
 
**Right click** on the default folder.

Select **file permissions**.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2014_49_54-xbrlspy.org%20on%20dreamhost%20-%20sftp___pompidou%40ravenwest.dreamhost.com%20-%20FileZilla.png" width="342" height="342" alt="Select File Permissions" title="" />
  
Set the **permissions** to **755** and click "Okay".
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2014_50_20-xbrlspy.org%20on%20dreamhost%20-%20sftp___pompidou%40ravenwest.dreamhost.com%20-%20FileZilla.png" width="317" height="372" alt="755" title="" />
   
Now, click into the default folder and right click somewhere inside the folder (usually the blank white space).
  
Select **create directory**.
 
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2007_26_44-xbrlspy.org%20on%20openshift%20-%20sftp___5175be225973caada30001a2%40xbrlspy-clawbackend.r.png" width="324" height="244" alt="create a directory" title="" />
   
Name the folder themes. This will now create the folder within the /sites/default folder.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2007_26_57-xbrlspy.org%20on%20openshift%20-%20sftp___5175be225973caada30001a2%40xbrlspy-clawbackend.r.png" width="369" height="154" alt="name it "themes"" title="" />
   
Now, let’s re-secure the default folder. We will repeat the same instructions from above. Let’s head out of the themes folder we’ve just created.
  
Select **file permissions** again on the default folder.
  
Set **permissions** back to **555**.
  
<img src="https://www.openshift.com/sites/default/files/2013-05-02%2014_50_33-xbrlspy.org%20on%20dreamhost%20-%20sftp___pompidou%40ravenwest.dreamhost.com%20-%20FileZilla.png" width="317" height="370" alt="555" title="" /> 
  
That’s it! Now you can upload custom themes or edit any existing themes you may have created by your own hands. 
  
## Clean Up
  
We’ve now imported the database, uploaded the files directories (both public and private), and added the theme we want.
  
### Log In
  
You will want to confirm that all of your hard work is complete. Why not surf over to your application domain and give it a try? You should be able to log in and administer your site just like you did before. If you can’t, you will want to review everything you did.
  
## Cron
  
Drupal requires a cron job to run the maintenance call for Drupal. The maintenance cron does a lot of things depending on what modules you have installed and it is a good idea to make sure it runs at least once a day. 

By default, the OpenShift system adds an hourly cron job to run the maintenance.  Awesome! One less thing to worry about.
  
## Setting Your Domain
 
Now we’ve arrived at the final step - making your new web site appear on your own domain! 

I hope you’re excited because this final step can get a little tricky, especially for those of you who are not terribly comfortable using the dreaded command line. If you are a command line junkie, then you shouldn’t have any issues here.
 
The first thing you will want to do is to tell your Openshift website that it will be expecting traffic from your top level domain. A “top level” domain is just a fancy way to saying your “website domain”. It is those things that end with “.com”, “.org”, or “.net”. There are, of course, many other types of domains these days but, regardless of which ending you have on your website domain, they all work the same.
  
### Adding Aliases to Openshift
  
Once you’ve successfully pointed your website domain records at the Openshift system, you will want to make sure to tell Openshift to expect the domains. This is done by using the Openshift RHC commands from the command line.
  
## RHC What and The Who’s On First in What Universe?
   
I know some of you will not have any idea what I am talking about but this bit of the process will require you to fire up the command line and add the domain aliases to your Openshift gear. It isn’t terribly evil but it will require your attention. The first thing you will want to do is head over to this site and download the rhc client:
  
https://www.openshift.com/developers/rhc-client-tools-install
  
This helpful tutorial will guide you through the entire process of installing the bits of software that will allow you to connect to the Openshift environment. Once you have installed everything and have connected successfully, you will then be able to add the fancy aliases that will make your website sing.
  
Now that you’ve connected and are rocking the command line properly, you will want to add your aliases. This helpful page on our website gives a great summary of what commands to use:

https://www.openshift.com/blogs/custom-url-names-for-your-paas-applications-host-forwarding-and-cnames-the-openshift-way

Finally! By now, you’ve added the aliases and are ready to point your web domain at Openshift.

### Modifying Your Website Domain (On Your Domain Host)

When you register your own domain, you should be provided with different methods of controlling your DNS (or domain) records. We will want to modify two of these records:
 
example.com ? CNAME ? sitename-drupalsite.rhcloud.com
 
www.example.com ? CNAME ? sitename-drupalsite.rhcloud.com
 
The other records you can ignore as they won’t need to point at the Openshift system. What we need to modify on these records is to turn them both into CNAME records that are directed or “point” at Openshift.

You will need to make both of the records CNAME records that point at your “sitename-drupalsite.rhcloud.com” domain. You can do this in multiple ways but the best way is to contact your domain registrar and ask them how you can point both your top level domain and the “www” CNAME.

What this will do is any time someone searches and finds your website, they will be directed to the appropriate Openshift installation using your domain. So, instead of your rhcloud.com domain showing up, it will use your own.

# The Future

I suspect more of the Setting Up Domain Names process will get incorporated into the OpenShift Online console as time goes on.  There is a lot of work being done by the awesome OpenShift UX team in the background and improvements are being released on a regular basis. You can also keep checking the blog for any future announcements and updates.

If you have questions or comments (or notice something that I could have done more efficiently) please feel free to leave me a note or join us on our freenode irc channel #openshift-dev

I'll be at [DrupalCon](http://portland2013.drupal.org/) in Portland in a few weeks, so be look for us at the Red Hat OpenShift Booth! 

## What's Next? ##

- [Sign up](https://www.openshift.com/app/account/new) for OpenShift Online
- Interested a private PaaS? [Register](https://engage.redhat.com/forms/contact-sales-openshift) for an evaluation of [OpenShift Enterprise](https://openshift.redhat.com/community/enterprise-paas)
- Need Help? [Post](https://openshift.redhat.com/community/forums) your questions in the forums
- [Follow us](https://twitter.com/openshift) on Twitter


[OpenShift Origin]: https://www.openshift.com/open-source
[OpenShift Origin Community Day]: http://www.eventbrite.com/myevent?eid=5594154266
[Fedora]: http://fedora.org/
[Gluster]: http://gluster.org/
[JBoss]: http://jboss.org/
[OpenStack]: http://www.redhat.com/openstack/
[OpenShift.Com]: http://openshift.com/
[OpenShift]: http://openshift.com/
[OpenShift Enterprise]: https://www.openshift.com/enterprise-paas/
[@pythondj]: http://twitter.com/pythondj
[PyCon]: https://us.pycon.org/2013/