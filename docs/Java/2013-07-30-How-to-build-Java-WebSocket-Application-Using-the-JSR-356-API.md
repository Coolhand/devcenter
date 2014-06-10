---
title: How to build Java WebSocket Applications Using the JSR 356 API
author: Shekhar Gulati
layout: default
---

<img style='float:left;padding-right:15px;' src="https://www.openshift.com/sites/default/files/phone.jpg" width="400" height="275" alt="Getting started with JSR 356 API for WebSocket" title="Getting started with JSR 356 API for WebSocket" />
It is a well known fact that [HTTP(Hypertext Transfer Protocol)](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) is a stateless request-response protocol. This simple design of the HTTP protocol makes it very scalable but inefficient and unsuitable for highly interactive real-time web applications. HTTP was designed for document sharing and not for building today's highly interactive web applications. HTTP is bit chatty in nature, as for each http request/response, a lot of headers need to be transmitted over the wire. 

**To learn how to use Wildfly with OpenShift please refer to my second post in this series [https://www.openshift.com/blogs/deploy-websocket-web-applications-with-jboss-wildfly](https://www.openshift.com/blogs/deploy-websocket-web-applications-with-jboss-wildfly)**

Before the HTTP 1.1 version, every request made to the server resulted in a new connection. This was improved in HTTP 1.1 with the introduction of [HTTP persistence connections](http://en.wikipedia.org/wiki/HTTP_persistent_connection). Persistent connections allowed web browsers to reuse the same connection for fetching images, scripts, etc. 

HTTP was designed to be half-duplex which means it allows transmission of data in just one direction at a time. A Walkie-talkie is an example of a half duplex device because only one person can speak at a time.  Developers have created some workarounds or hacks to overcome this HTTP shortcoming. Some of these workarounds are polling, long polling, and [streaming](http://ajaxpatterns.org/HTTP_Streaming). 

With polling, the client makes synchronous calls to get information from the server. If the server has new information available it will send back data in the response. Otherwise, no information will be sent to the client and the client will again make a new connection after sometime. This is very inefficient but a very simple way to achieve real-time behavior. Long polling is another workaround in which the client will make a connection to the server and the server will hold the connection until data is available or a designated timeout is achieved. Long polling is also known as comet. Because of the mismatch between synchronous HTTP and these asynchronous applications, it tends to be complicated, non-standard and inefficient.

Over time, the need for a standards-based, bidirectional and full-duplex channel between clients and a server have increased. In this blog, we will look at how WebSockets can help address these problems and then learn how to use JSR 356 API to build WebSocket based applications in Java. 

**Please note that this blog will not talk about OpenShift WebSocket support. If you want to learn about OpenShift WebSocket support, please refer to [this blog](https://www.openshift.com/blogs/paas-websockets) by [Marek Jelen](https://twitter.com/marek_jelen).**

## What is a WebSocket?##

A WebSocket is asynchronous, bidirectional, full-duplex messaging implementation over a single TCP connection. WebSockets are not a HTTP connection , but use HTTP to bootstrap a WebSocket connection. A full-duplex system allows communication in both directions simultaneously. Land-line telephones are an example of a full-duplex device, since they allow both callers to speak and be heard at the same time. It was initially proposed as part of the HTML5 specification which promises to bring ease of development and network efficiency to modern, interactive web applications, but was later moved to a separate standards document to keep the specification focused only on WebSockets. It consists of two things -- the WebSocket protocol specification i.e. [RFC 6455](http://tools.ietf.org/html/rfc6455) which was published in December 2011 and [WebSocket JavaScript API](http://www.w3.org/TR/2011/WD-websockets-20110419/).

The WebSocket protocol leverages the [HTTP upgrade header](http://en.wikipedia.org/wiki/HTTP/1.1_Upgrade_header) to upgrade an HTTP connection to a WebSocket connection. HTML5 WebSockets address many problems that make HTTP unsuitable for real time applications and make application architecture simple by avoiding complex workarounds.

WebSockets are supported by all the latest browsers as shown below in an image. The information is taken from http://caniuse.com/#feat=websockets.

<img src="https://www.openshift.com/sites/default/files/images/WebSockets-support-in-browsers.png" alt="WebSocket browser support" width="750" height="500">


## How Does a WebSocket Work?##

Every WebSocket connection begins its life as an HTTP request. The HTTP request is much like another request, except that it has an [Upgrade header](http://en.wikipedia.org/wiki/HTTP/1.1_Upgrade_header). The Upgrade header indicates that a client would like to upgrade the connection to different protocol. For WebSockets it will upgrade to the WebSocket protocol. The WebSocket connection is established by upgrading from HTTP protocol to the WebSockets protocol during the initial handshake between the client and server over the same underlying connection. Once the WebSocket connection is established, messages can be sent back and forth between the client and server. 

## Efficiency, Simplicity and Less Bandwidth with WebSockets##

1. WebSockets are more efficient and performant than other workarounds like polling. They require less bandwidth and reduce latency.

2. WebSockets simplify real-time application architectures.

3. WebSockets do not require headers to send messages between peers. This considerably lowers the required bandwidth.

## WebSocket Use Cases ##

Some of the possible use-cases of WebSockets are :

* Chat applications
* Multiplayer games
* Stock trading or financial applications
* Collaborative document editing
* Social networking applications


## Working with WebSockets in Java##

As it normally happens in the Java community, different vendors or developers write libraries to use a technology and then after sometime when the technology matures, it is standardized so that developers can interoperate between different implementations without the danger of vendor lock in. There were more than 20 different Java WebSocket implementations when JSR 356 was started. Most of them had  different APIs. [JSR 356](http://jcp.org/en/jsr/detail?id=356) is an effort to standardize a WebSocket API for Java. Developers can use JSR 356 API for creating WebSocket applications independent of the implementation. The WebSocket API is purely event driven.


### JSR 356 -- Java API for WebSockets ###

[JSR 356](http://jcp.org/en/jsr/detail?id=356), Java API for WebSocket, specifies Java API that developers can use to integrate WebSockets into their applications — both on the server side as well as on the Java client side. JSR 356 is part of the upcoming Java EE 7 standard. This means all Java EE 7 compliant application servers will have an implementation of the WebSocket protocol that adheres to the JSR 356 standard. Developers can also use JSR 356 outside Java EE 7 application server as well. Current development version of Apache Tomcat 8 will be adding WebSocket support based on JSR 356 API. 

A Java client can use JSR 356 compliant client implementation to connect to a WebSocket server. For web clients, developers can use WebSocket JavaScript API to communicate with WebSocket server. The difference between a WebSocket client and a WebSocket server lies only in the means by which the two are connected. A WebSocket client is a WebSocket endpoint that initiates a connection to a peer. And a WebSocket server is a WebSocket endpoint that is published and awaits connections from peers. There are callback listeners on both sides -- clients and server -- onOpen , onMessage , onError, onClose. We will look at these in more detail when we will build an application.


### Tyrus -- JSR 356 Reference Implementation ###

[Tyrus](https://tyrus.java.net/) is the reference implementation for JSR 356. We will be using Tyrus in standalone mode to develop a simple application in the next section. All Tyrus components are built using Java SE 7 compiler. It means, you will also need at least Java SE 7 to be able to compile and run this example application. It can't be used with Apache Tomcat 7 because it depends on servlet 3.1 specification upgrade. 

## Developing a WordGame Using WebSockets ##

Now we will build a very simple word game. The user will get a scrambled word and he/she has to unscramble it. We will use a single WebSocket connection per game.

**Source code of this application is available on github https://github.com/shekhargulati/wordgame**

### Step 1 : Create a Template Maven Project###

We will start by creating a template Java project using Maven archetype. Execute the command shown below to create Maven based Java project. 

<code>
$ mvn archetype:generate -DgroupId=com.shekhar -DartifactId=wordgame -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
</code>

### Step 2 : Update pom.xml with Required Dependencies ###

As mentioned in previous section, you need Java SE 7 to build applications using Tyrus. To use Java 7 in your maven project , add the maven compiler plugin with configuration to use Java 7 as mentioned below.

<code>
<build>
	<plugins>
		<plugin>
			<groupId>org.apache.maven.plugins</groupId>
			<artifactId>maven-compiler-plugin</artifactId>
			<version>3.1</version>
			<configuration>
				<compilerVersion>1.7</compilerVersion>
				<source>1.7</source>
				<target>1.7</target>
			</configuration>
		</plugin>
	</plugins>
</build>
</code>

Next, add the dependency for JSR 356 API. The current version of javax.websocket-api is 1.0.

<code>
<dependency>
	<groupId>javax.websocket</groupId>
	<artifactId>javax.websocket-api</artifactId>
	<version>1.0</version>
</dependency>
</code>

Then we will add Tyrus JSR 356 implementation related dependencies. The tyrus-server provides JSR 356 server side WebSocket API implementation and tyrus-client provides JSR356 client side WebSocket API implementation.
<code>
<dependency>
	<groupId>org.glassfish.tyrus</groupId>
	<artifactId>tyrus-server</artifactId>
	<version>1.1</version>
</dependency>
<dependency>
	<groupId>org.glassfish.tyrus</groupId>
	<artifactId>tyrus-client</artifactId>
	<version>1.1</version>
</dependency>
</code>
Finally we will add the tyrus-container-grizzly dependency to our pom.xml. This will provide a standalone container to deploy WebSocket applications.

<code>
<dependency>
	<groupId>org.glassfish.tyrus</groupId>
	<artifactId>tyrus-container-grizzly</artifactId>
	<version>1.1</version>
</dependency>
</code>
You can view the full pom.xml [here](https://github.com/shekhargulati/wordgame/blob/master/pom.xml).

### Step 3 : Write the First JSR 356 WebSocket Server Endpoint###

Now that we have done setup for our project, we will start writing the WebSocket server endpoint. You can declare any Java POJO class WebSocket server endpoint by annotating it with @ServerEndpoint. Developers can also specify URI where endpoints will be deployed. The URI is relative to the root of WebSocket container and must begin with "/". In the code shown below, we have created a very simple WordgameServerEndpoint.

<code>
package com.shekhar.wordgame.server;

import java.io.IOException;
import java.util.logging.Logger;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.CloseReason.CloseCodes;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/game")
public class WordgameServerEndpoint {

    private Logger logger = Logger.getLogger(this.getClass().getName());

    @OnOpen
    public void onOpen(Session session) {
        logger.info("Connected ... " + session.getId());
    }

    @OnMessage
    public String onMessage(String message, Session session) {
        switch (message) {
        case "quit":
            try {
                session.close(new CloseReason(CloseCodes.NORMAL_CLOSURE, "Game ended"));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            break;
        }
        return message;
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        logger.info(String.format("Session %s closed because of %s", session.getId(), closeReason));
    }
}
</code>

The @OnOpen annotation is used to annotate a method which will be called after WebSocket connection is opened. Every connection has a session associated with it. In the code shown above, we printed the session id when onOpen() method is called. The method annotated with @OnOpen will be invoked only once per WebSocket connection.

The @OnMessage annotation is used to annotate a method which will be called each time a message is received. This is the method where all the business code will be written. In the code shown above, we will close the connection when we receive "quit" message from client , else we will just return the message back to the client. So, a WebSocket connection will be open till we don't receive "quit" message.On receiving quit message we call the close method on session object giving it the reason for closing the session. In the code sample above, we say that it is a normal closure as game has ended.

The @OnClose annotation is used to annotate a method which will be called when WebSocket connection is closed.


### Step 4 : Write the First JSR 356 WebSocket Client Endpoint###

The @ClientEndpoint annotation is used to mark a POJO WebSocket client. Similar to javax.websocket.server.ServerEndpoint, POJOs that are annotated with @ClientEndpoint annotation can have methods that using the web socket method level annotations, are web socket lifecycle methods.

<code>
package com.shekhar.wordgame.client;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.CountDownLatch;
import java.util.logging.Logger;

import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.DeploymentException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

import org.glassfish.tyrus.client.ClientManager;

@ClientEndpoint
public class WordgameClientEndpoint {

    private Logger logger = Logger.getLogger(this.getClass().getName());

    @OnOpen
    public void onOpen(Session session) {
        logger.info("Connected ... " + session.getId());
        try {
            session.getBasicRemote().sendText("start");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @OnMessage
    public String onMessage(String message, Session session) {
        BufferedReader bufferRead = new BufferedReader(new InputStreamReader(System.in));
        try {
            logger.info("Received ...." + message);
            String userInput = bufferRead.readLine();
            return userInput;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        logger.info(String.format("Session %s close because of %s", session.getId(), closeReason));
    }


}
</code>
In the code shown above, we send a "start" message to the server when WebSocket connection is opened. The onMessage method annotated with @OnMessage is called each time a message is received from server. It first logs the message and then wait for user input. The user input is then sent to the server. Finally, onClose() method annotated with @OnClose annotation is called when WebSocket connection is closed. As you can see, the programming model for both client and server side code is same. This eases the development of writing WebSocket applications using JSR 356 API.

### Step 5: Create and Start a WebSocket Server ###

We need a server to deploy our WebSocket @ServerEndpoint. The server is created using tyrus server API as shown below. The server will be running on port 8025. The WordgameServerEndpoint will be accessible at ws://localhost:8025/websockets/game.

<code>
package com.shekhar.wordgame.server;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.glassfish.tyrus.server.Server;

public class WebSocketServer {

    public static void main(String[] args) {
        runServer();
    }

    public static void runServer() {
        Server server = new Server("localhost", 8025, "/websockets", WordgameServerEndpoint.class);

        try {
            server.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            System.out.print("Please press a key to stop the server.");
            reader.readLine();
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            server.stop();
        }
    }
}

</code>
If you are using Eclipse, then you can start the server by running it as a Java application(ALT+SHIFT+X,J). You will see logs as shown below.

<code>
Jul 26, 2013 1:39:37 PM org.glassfish.tyrus.server.ServerContainerFactory create
INFO: Provider class loaded: org.glassfish.tyrus.container.grizzly.GrizzlyEngine
Jul 26, 2013 1:39:38 PM org.glassfish.grizzly.http.server.NetworkListener start
INFO: Started listener bound to [0.0.0.0:8025]
Jul 26, 2013 1:39:38 PM org.glassfish.grizzly.http.server.HttpServer start
INFO: [HttpServer] Started.
Jul 26, 2013 1:39:38 PM org.glassfish.tyrus.server.Server start
INFO: WebSocket Registered apps: URLs all start with ws://localhost:8025
Jul 26, 2013 1:39:38 PM org.glassfish.tyrus.server.Server start
INFO: WebSocket server started.
Please press a key to stop the server.
</code>

### Step 6 : Start the WebSocket Client ###

Now that server is started and WebSocket @ServerEndpoint is deployed, we will start the client as a Java application. We will create an instance of ClientManager and connect to server endpoint as shown below. 

<code>
@ClientEndpoint
public class WordgameClientEndpoint {

    private static CountDownLatch latch;

    private Logger logger = Logger.getLogger(this.getClass().getName());

    @OnOpen
    public void onOpen(Session session) {
        // same as above
    }

    @OnMessage
    public String onMessage(String message, Session session) {
		// same as above
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        logger.info(String.format("Session %s close because of %s", session.getId(), closeReason));
        latch.countDown();
    }

    public static void main(String[] args) {
        latch = new CountDownLatch(1);

        ClientManager client = ClientManager.createClient();
        try {
            client.connectToServer(WordgameClientEndpoint.class, new URI("ws://localhost:8025/websockets/game"));
            latch.await();

        } catch (DeploymentException | URISyntaxException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}

</code>

We used CountDownLatch to make sure that main thread does not exit after executing the code. The main thread waits till the time latch decrements the counter in onClose() method. Then program terminates. In the main() method we create instance of ClientManager which is then used to connect to @ServerEndpoint available at ws://localhost:8025/websockets/game.

Run the Client as a Java application(ALT + SHIFT + X , J) and you will see logs as shown below.

<code>
Jul 26, 2013 1:40:26 PM com.shekhar.wordgame.client.WordgameClientEndpoint onOpen
INFO: Connected ... 95f58833-c168-4a5f-a580-085810b4dc5a
Jul 26, 2013 1:40:26 PM com.shekhar.wordgame.client.WordgameClientEndpoint onMessage
INFO: Received ....start
</code>

Send any message like "hello world" and that will be echoed back to you as shown below.

<code>
INFO: Received ....start
hello world
Jul 26, 2013 1:41:04 PM com.shekhar.wordgame.client.WordgameClientEndpoint onMessage
INFO: Received ....hello world
</code>

Send the "quit" message, and WebSocket connection will be closed.

<code>
INFO: Received ....hello world
quit
Jul 26, 2013 1:42:23 PM com.shekhar.wordgame.client.WordgameClientEndpoint onClose
INFO: Session 95f58833-c168-4a5f-a580-085810b4dc5a close because of CloseReason[1000,Game ended]
</code>

### Step 7 : Add Game Logic ###

Now we will add the game logic which will sent a scrambled word to client and on receiving an unscrambled word from client will check whether it is correct or not.
Update the WordgameServerEndpoint code as shown below.

<code>
package com.shekhar.wordgame.server;

import java.io.IOException;
import java.util.logging.Logger;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.CloseReason.CloseCodes;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/game")
public class WordgameServerEndpoint {

    private Logger logger = Logger.getLogger(this.getClass().getName());

    @OnOpen
    public void onOpen(Session session) {
        logger.info("Connected ... " + session.getId());
    }

    @OnMessage
    public String onMessage(String unscrambledWord, Session session) {
        switch (unscrambledWord) {
        case "start":
            logger.info("Starting the game by sending first word");
            String scrambledWord = WordRepository.getInstance().getRandomWord().getScrambledWord();
            session.getUserProperties().put("scrambledWord", scrambledWord);
            return scrambledWord;
        case "quit":
            logger.info("Quitting the game");
            try {
                session.close(new CloseReason(CloseCodes.NORMAL_CLOSURE, "Game finished"));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        String scrambledWord = (String) session.getUserProperties().get("scrambledWord");
        return checkLastWordAndSendANewWord(scrambledWord, unscrambledWord, session);
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        logger.info(String.format("Session %s closed because of %s", session.getId(), closeReason));
    }

    private String checkLastWordAndSendANewWord(String scrambledWord, String unscrambledWord, Session session) {
        WordRepository repository = WordRepository.getInstance();
        Word word = repository.getWord(scrambledWord);
        
        String nextScrambledWord = repository.getRandomWord().getScrambledWord();
        
        session.getUserProperties().put("scrambledWord", nextScrambledWord);
        
        String correctUnscrambledWord = word.getUnscrambbledWord();
        
        if (word == null || !correctUnscrambledWord.equals(unscrambledWord)) {
            return String.format("You guessed it wrong. Correct answer %s. Try the next one .. %s",
                    correctUnscrambledWord, nextScrambledWord);
        }
        return String.format("You guessed it right. Try the next word ...  %s", nextScrambledWord);
    }
}

</code>

Restart the server and client and enjoy the game.


##Conclusion##

In this blog post we looked at how the JSR 356 WebSocket API can help us build realtime full duplex Java applications. JSR 356 WebSocket API is very simple and the annotation based programming model makes it very easy to build WebSocket applications. In the next blog post, we will look at [Undertow](http://undertow.io/), a flexible performant web server written in java from JBoss. 


## Next Steps

* [Sign up for OpenShift Online](https://www.openshift.com/app/account/new) and try this out yourself
* Get your own [private Platform As a Service](https://engage.redhat.com/forms/contact-sales-openshift) (PaaS) by evaluating [OpenShift Enterprise](https://www.openshift.com/products/enterprise/try-enterprise)
* Promote and show off your awesome app in the [OpenShift Application Gallery](https://www.openshift.com/application-gallery) today.