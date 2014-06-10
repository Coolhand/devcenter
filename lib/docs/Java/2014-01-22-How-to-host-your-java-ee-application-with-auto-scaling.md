---
title: How to Host your Java EE  Application with Auto-scaling
author: Shekhar Gulati
layout: default
---

OpenShift is an auto-scalable Platform as a Service. Auto-scalable means OpenShift can horizontally scale your application up or down depending on the number of concurrent connections. OpenShift supports the JBoss application server, which is a certified platform for Java EE 6 development. As an OpenShift user, you have access to both the [community version of JBoss](http://www.jboss.org/jbossas/) and [JBoss EAP 6](http://www.redhat.com/products/jbossenterprisemiddleware/application-platform/)(JBoss Enterprise Application Platform) for free. In this blog post, we will learn how to host a scalable Java EE 6 application using a JBoss EAP 6 server cluster running on OpenShift.

## Prerequisites##

1. Basic Java knowledge is required. Install the latest Java Development Kit (JDK) on your operating system. You can either install [OpenJDK 7](http://openjdk.java.net/) or [Oracle JDK 7](http://www.oracle.com/technetwork/java/javase/downloads/index.html). OpenShift supports OpenJDK 6 and 7.

2. Basic [Java EE 6](http://docs.oracle.com/javaee/6/tutorial/doc/) knowledge is required.

3. Sign up for an [OpenShift Account](https://www.openshift.com/app/account/new). It is completely free and Red Hat gives every user three free gears on which to run your applications. At the time of writing, the combined resources allocated for each user was 1.5GB of memory and 3GB of disk space.

4. Install the [RHC client tool](https://openshift.redhat.com/community/get-started#cli) on your machine. RHC is a Ruby Gem, so you need to have Ruby 1.8.7 or above on your machine. To install RHC, just type <code>sudo gem install rhc</code> on the command line. If you already have the RHC Gem installed, make sure it is the latest one. To update RHC, execute the command <code>sudo gem update rhc</code>. For more assistance setting up the RHC command-line tool, see the following page: https://openshift.redhat.com/community/developers/rhc-client-tools-install.

5. Set up your OpenShift account using the command <code>rhc setup</code>. This command will help you to create a namespace and upload your SSH key to the OpenShift server.

## Github Repository##

The code for today's demo application is available on [GitHub](https://github.com/shekhargulati/jan2014-javaee-scalability-blog). 

It is a simple Java EE 6 'to do' application that exposes three REST endpoints.

* When a user makes a GET request to '/api/v1/ping', then the user gets a pong response.

```
$ curl http://todo-domainname.rhcloud.com/api/v1/ping

"ping":"pong"
```

* When a user makes a POST request to '/api/v1/todos', then the user creates a new 'to do' item.

```
$ curl -i -X POST -H "Content-Type: application/json" -H "Accept: application/json" -d  '{"todo" : "Learn AngularJS","tags":["angular","learning","book-reading"]}' http://todo-domainname.rhcloud.com/api/v1/todos

HTTP/1.1 201 Created
Date: Wed, 08 Jan 2014 20:06:22 GMT
Server: Apache-Coyote/1.1
Location: http://todo-domainname.rhcloud.com/api/v1/todos/192529
Content-Length: 0
Set-Cookie: GEAR=local-52ccf099e0b8cd8978000029; path=/
Content-Type: text/plain
```


* When a user makes a GET request to 'api/v1/todos/:id', then the user fetches the 'to do' item with the specified id.

```
$ curl http://todo-domainname.rhcloud.com/api/v1/todos/192529

{"id":192529,"todo":"Learn AngularJS","tags":["angular","learning","book-reading"],"createdOn":1389211581180}
```


## Create a scalable JBoss EAP application##

We will start by creating a new scalable application with the JBoss EAP 6 and PostgreSQL cartridges.
```
$ rhc app-create todo jbosseap postgresql-9 --scaling --from-code https://github.com/shekhargulati/jan2014-javaee-scalability-blog.git
```

Let's decipher the above command. It instructs OpenShift to create an application named *todo*, which should use the JBoss EAP and PostgreSQL 9.2 cartridges. The ***--scaling*** option tells OpenShift to create a scalable application. If you do not specify this, a non-scalable application will be created. The ***--from-code*** option instructs OpenShift to use the specified Git repository as the reference application. If you do not specify the ***--from-code*** option, then OpenShift will use a template application.

This command will create two gears. One gear will host the HAProxy load balancer and JBoss EAP application server, and the other gear will host a PostgreSQL database. OpenShift will also add the settings to allow communication between the gears. This is shown below.

<img src="https://www.openshift.com/sites/default/files/images/scalable-app.png" height="350" alt="Scalable Application on OpenShift">

In the above image, when a user makes a web request that request first goes to HAProxy. The HAProxy cartridge sits between your application and the user and routes web traffic to the JBoss EAP cartridges. If the request involves writing or fetching data to or from the database, then the application running inside JBoss EAP will use its datasource configuration to work with the PostgreSQL database. 

You can view the application running at http://todo-*domainname*.rhcloud.com. Please replace *domainname* with your OpenShift account domain name. At this stage, when you go to http://todo-*domainname*.rhcloud.com you will get a **503 Service Unavailable Error**. 

## Fixing the Service Unavailable Error##

To understand why you are getting this error, go to your application HAProxy status page at http://todo-*domainname*.rhcloud.com/haproxy-status.

<img src="https://www.openshift.com/sites/default/files/images/HAProxy%20Status%20Page.png" width="600" alt="HAProxy Status Page">

There is a lot of information on this page. We will look at it in detail in a later section, but for now the important visible information is that local-gear is down as it is shown in red. HAProxy does periodic health checks to determine the health of gears. The default health check URL is configured to poll '/', i.e. the root context of the application. The application that we have deployed exposes a few REST endpoints. There is no request handler for '/', so it returns a 404 (Page not found) HTTP response. HAProxy considers responses 2xx and 3xx as valid, and all others to indicate a server failure.

This can be solved by configuring HAProxy to use a URL that returns a valid HTTP response. In our application, we have a very simple PingResource, which returns a 200 HTTP response code. The resource is available at http://todo-*domainname*.rhcloud.com/api/v1/ping.

HAProxy maintains its configuration in the *haproxy.cfg* file. OpenShift allows its users to modify this file; to make a change, you have to SSH into the application gear. To SSH:

```
$ rhc ssh --app todo
```

Next, change into the *haproxy/conf* directory.
```
$ cd haproxy/conf
```

Now change the following in *haproxy.cfg*: 
```
option httpchk GET /
```

to 

```
option httpchk GET /api/v1/ping
```

Next, restart the HAProxy cartridge from your local machine using RHC.

```
$ rhc cartridge-restart --cartridge haproxy
```
Now refresh the HAProxy status page and you will see that local-gear is now in green. The green color means local-gear can now handle web requests.

<img src="https://www.openshift.com/sites/default/files/images/HAProxy%20Success%20Page.png" width="600" alt="HAProxy Success Page">


## Understanding the HAProxy Status Page##

Let's spend some time understanding the HAProxy status page. HAProxy listens for all incoming requests to the application and proxies them to one of the preconfigured back ends. 

The HAProxy status page shows two sections -- stats and express.  The stats section is configured to listen to all the requests made to the HAProxy status page. Every time you refresh the http://todo-*domainname*.rhcloud.com/haproxy-status page, the total number of sessions under the Sessions tab will increment as shown below. This is shown under the "Total" column. The "Cur" column is the number of users currently accessing the status page. The "Max" column is the maximum concurrent users. All these numbers are calculated since HAProxy was started; if you restart HAProxy, the stats will be reset.

<img src="https://www.openshift.com/sites/default/files/images/HAProxy%20Stats%20Section.png" width="600" alt="HAProxy Stats Section">

The express section is more interesting from the application point of view. The local-gear row corresponds to the requests handled by JBoss EAP. The total number of sessions handled by the application is shown in the "Total" column. The "Cur" column is the number of users currently accessing the application. The "Max" column is the maximum concurrent users. All these figures are since HAProxy was started; if you restart HAProxy, the stats will be reset. In the image shown above, we can see that local-gear has handled four requests, one at a time. When the application scales, it will add more rows for the new gears.

## Auto-scalable Java EE PaaS Features##

When you create a scalable JBoss OpenShift application, you get JBoss clustering with an HTTP load balancer. This has the following benefits:

* **Auto-Scalability**: OpenShift adds a new node to the cluster to service a higher client load. The algorithm for scaling up and scaling down is based on the number of concurrent requests to your application. OpenShift allocates 16 connections per gear - if HAProxy sees that you're sustaining 90% of your total connections, it adds another gear. If your demand falls to 50% of your total connections for several minutes, HAProxy removes that gear.

* **HTTP Request Load Balancing**: OpenShift uses HAProxy to load balance the HTTP requests. This makes sure each individual node only gets its fair share of the overall client load. HAProxy distributes client requests using the balance algorithm defined in its configuration. OpenShift configures HAProxy to use the ***leastconn*** algorithm. The ***leastconn*** algorithm makes sure that the server with the lowest number of connections receives the new connection. You can configure HAProxy to use any other balancing algorithm you prefer. We will cover this in a later section.

* **Session Replication**: You get session replication with JBoss clustering. This ensures that if one of the nodes dies, your session data is replicated to the other nodes in the cluster. This is achieved by using a replicated, clustered, distributed cache. JBoss uses Infinispan to provide this. You have to use a distributable element in your *web.xml* to make use of session replication.
```
<web-app>
   <distributable/>
</web-app>
```
* **Distributed Cache**: In your application you can use Infinispan as a replicated, clustered, distributed cache. You can use Infinispan by using the @Resource annotation as shown below.
```
@Resource(lookup="java:jboss/infinispan/container/cluster")
private CacheContainer container;
```
You can then use get() and put() methods to get or put elements into the cache.

* **High Availability**: Scaled apps will remain available even when a server instance fails. If a server instance fails, HAProxy will redirect the traffic to the healthy server instances. 


## Checking the Number of Requests##

The HAProxy status page offers a lot of information related to your application. You can easily find out the number of requests handled by your application by looking at the Sessions tab under the *express* server configuration. All these figures are since HAProxy was started. Let's use Curl to create and read a few 'to do' items.

To create 'to do' items, we will use Curl as shown below.

```
$ curl -i -X POST -H "Content-Type: application/json" -H "Accept: application/json" -d  '{"todo" : "Learn AngularJS","tags":["angular","learning","book-reading"]}' http://todo-domainname.rhcloud.com/api/v1/todos

$ curl -i -X POST -H "Content-Type: application/json" -H "Accept: application/json" -d  '{"todo" : "Learn Scala","tags":["scala","learning","book-reading"]}' http://todo-domainname.rhcloud.com/api/v1/todos
```


To read 'to do' items, we will use Curl as shown below.
```
$ curl http://todo-domainname.rhcloud.com/api/v1/todos/1

$ curl http://todo-domainname.rhcloud.com/api/v1/todos/2
```

In total we have made four requests -- two POST and two GET requests. If you go to the status page, you can see the number of requests in the Sessions tab in the *express* server configuration, as shown below.

<img src="https://www.openshift.com/sites/default/files/images/HAProxy%20Check%20Number%20Of%20Requests.png" width="600" alt="Check Number of HAProxy Requests">

If at any point you want to clear the existing stats, just restart HAProxy and all the stats will be reset.
```
$ rhc cartridge-restart --app todo --cartridge haproxy
```

## Auto-scaling in Action##

To see auto-scaling in action, we will use Apache Benchmark. Apache Benchmark is a command line utility that can help simulate concurrent user access. 

```
$ ab -n 50000 -c 50 -p post_data.txt -T 'application/json' http://todo-domainname.rhcloud.com/api/v1/todos
```
In the above command we are making 50000 requests with 50 concurrent requests at a time. You can think of it as 50 users making 1000 requests each. We are making a POST request to http://todo-*domainname*.rhcloud.com/api/v1/todos with data contained in a *post\_data.txt* file. The *post_data.txt* file just contains JSON representing a 'to do' item.

```
$ cat post_data.txt 

{
"todo" : "Learn AngularJS",
"tags":["angular","learning","book-reading"]
}

```

When you run this test, OpenShift will start with one gear (shared by HAProxy and JBoss EAP), and proxy all the traffic to the co-located JBoss EAP instance.

<img src="https://www.openshift.com/sites/default/files/images/HAProxy%20Single%20Gear.png" width="600" alt="HAProxy Single Gear">

HAProxy will fire a scale event, which we can view in the HAProxy logs.

```
I, [2014-01-08T06:40:49.752004 #69819]  INFO -- : GEAR_UP - capacity: 206.25% gear_count: 1 sessions: 33 up_thresh: 90.0%
```
OpenShift checks that you have a free gear (out of your three free gears) and then creates another copy of your web cartridge on that new gear. The code in the Git repository is copied to each new gear, but the data directory begins empty. When the new cartridge copy starts it will invoke your build hooks and then HAProxy will begin routing web requests to it. If you push a code change to your web application, all of the running gears will get that update.

After the gear is started, you will start seeing load being distributed to both gears as shown below.

<img src="https://www.openshift.com/sites/default/files/images/HAProxy%20Load%20Shared%20Between%20Gears.png" width="600" alt="HAProxy Load Shared Between Gears">


Apache Benchmark gave the following requests. The application was able to process 86 requests per second.
```
Server Software:        Apache-Coyote/1.1
Server Hostname:        todo-domainname.rhcloud.com
Server Port:            80

Document Path:          /api/v1/todos
Document Length:        0 bytes

Concurrency Level:      50
Time taken for tests:   580.133 seconds
Complete requests:      50000
Failed requests:        1
   (Connect: 0, Receive: 0, Length: 1, Exceptions: 0)
Write errors:           0
Non-2xx responses:      1
Total transferred:      13450665 bytes
Total POSTed:           11600464
HTML transferred:       515 bytes
Requests per second:    86.19 [#/sec] (mean)
Time per request:       580.133 [ms] (mean)
Time per request:       11.603 [ms] (mean, across all concurrent requests)
Transfer rate:          22.64 [Kbytes/sec] received
                        19.53 kb/s sent
                        42.17 kb/s total
```



To test the performance of the application with both gears already running, you can set the minimum number of gears using the command shown below.

```
$ rhc cartridge-scale --min 2 --cartridge jbosseap
```
We can check the performance of the application by running Apache Benchmark again.

```
$ ab -n 50000 -c 50 -p post_data.txt -T 'application/json' http://todo-domainname.rhcloud.com/api/v1/todos

Server Software:        Apache-Coyote/1.1
Server Hostname:        todo-domainname.rhcloud.com
Server Port:            80

Document Path:          /api/v1/todos
Document Length:        0 bytes

Concurrency Level:      50
Time taken for tests:   545.510 seconds
Complete requests:      50000
Failed requests:        0
Write errors:           0
Total transferred:      13492786 bytes
Total POSTed:           11602552
HTML transferred:       0 bytes
Requests per second:    91.66 [#/sec] (mean)
Time per request:       545.510 [ms] (mean)
Time per request:       10.910 [ms] (mean, across all concurrent requests)
Transfer rate:          24.15 [Kbytes/sec] received
                        20.77 kb/s sent
                        44.93 kb/s total

```

As you can see, performance improved from 86 to 91 requests per second.

Let's now fix the number of gears to one, i.e. we will not scale beyond one gear.

```
$ rhc cartridge-scale --min 1 --max 1 --cartridge jbosseap
```

Apache Benchmark results

```
Server Software:        Apache-Coyote/1.1
Server Hostname:        todo-domainname.rhcloud.com
Server Port:            80

Document Path:          /api/v1/todos
Document Length:        0 bytes

Concurrency Level:      50
Time taken for tests:   675.106 seconds
Complete requests:      50000
Failed requests:        0
Write errors:           0
Total transferred:      13500270 bytes
Total POSTed:           11600464
HTML transferred:       0 bytes
Requests per second:    74.06 [#/sec] (mean)
Time per request:       675.106 [ms] (mean)
Time per request:       13.502 [ms] (mean, across all concurrent requests)
Transfer rate:          19.53 [Kbytes/sec] received
                        16.78 kb/s sent
                        36.31 kb/s total
```

## How to Use Round Robin##

You can configure HAProxy to use any balance algorithm. By default, OpenShift configures HAProxy to use the *leastconn* balance algorithm. If you want to use *roundrobin* instead, SSH into the application gear and change the configuration as shown below. In the *roundrobin* algorithm, each server is used in turns, according to their weights.


```
listen express 127.7.89.2:8080

    option httpchk GET /api/v1/ping

    balance roundrobin
    
    server gear-1 host:port  check fall 2 rise 3 inter 2000 weight 2 

    server local-gear host:post check fall 2 rise 3 inter 2000 weight 1

```

As you can see above, we changed the algorithm to *roundrobin*. Also, we added weights to each gear. We have given *gear-1* a weight of 2 and *local-gear* a weight of 1. This will ensure *gear-1* will get twice as many requests as *local-gear*.

That's it for today.

## What's Next

- [Get an OpenShift account](https://www.openshift.com/app/account/new) and host your web apps on the Free Plan today
- Promote your awesome app in the [OpenShift Application Gallery](https://www.openshift.com/application-gallery) by [applying today](https://www.openshift.com/developer-spotlight). 
- Ask an OpenShift question and [get help on StackOverflow](http://stackoverflow.com/questions/tagged/openshift)