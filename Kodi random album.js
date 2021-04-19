import QtQuick 2.0
import nymea 1.0

// this script sets a playlist in Kodi and starts playing it
// a playlist (in this case a random album) has to be created with Kodi first, f.i. profile/playlists/music/RandomAlbum.xsp which is used below
// more info on smart xsp playlists: https://kodi.wiki/view/Smart_playlists/XSP_Method

Item {
    id: root;
    
    ThingState {
        id:playRandom
        thingId: "{uuid}" // "Kodi-play-random" switch
        stateName: "power"
    }
        
    ThingState {
        thingId: "{uuid}" // "Kodi-play-random" switch
        stateName: "power"
            
        onValueChanged: {
            if (value == true) {
                var http = new XMLHttpRequest()
                var url = "http://url:8080/jsonrpc"; // insert IP address and change port if required
                var params = "{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"Playlist.Clear\",\"params\":{\"playlistid\": 0}}";
                
                http.open("POST", url, true);
                http.setRequestHeader("Content-type", "application/json");
                http.setRequestHeader("Authorization", "Basic base64encodedlogininfo"); // insert the base64 encoded version of username:password
                http.setRequestHeader("Content-length", params.length);
                http.setRequestHeader("Connection", "close");
                http.onreadystatechange = function() {
                    if (http.readyState == 4) {
                        if (http.status == 200) {
                            console.log("Kodi Playlist.Clear OK");
                            var reply = http.response;
                            var http2 = new XMLHttpRequest()
                            var params2 = "{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"Playlist.Add\",\"params\":{\"playlistid\":0,\"item\":{\"recursive\":true, \"directory\":\"special://profile/playlists/music/RandomAlbum.xsp\"}}}";
                            http2.open("POST", url, true);
                            http2.setRequestHeader("Content-type", "application/json");
                            http2.setRequestHeader("Authorization", "Basic base64encodedlogininfo"); // insert the base64 encoded version of username:password
                            http2.setRequestHeader("Content-length", params2.length);
                            http2.setRequestHeader("Connection", "close");
                            http2.onreadystatechange = function() {
                                if (http2.readyState == 4) {
                                    if (http2.status == 200) {
                                        console.log("Kodi random playlist selected");
                                        var http3 = new XMLHttpRequest()
                                        var progparams = "{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"Player.Open\",\"params\":{\"item\":{\"playlistid\":0,\"position\":0}}}";
                                        http3.open("POST", url, true);
                                        http3.setRequestHeader("Content-type", "application/json");
                                        http3.setRequestHeader("Authorization", "Basic base64encodedlogininfo=="); // insert the base64 encoded version of username:password
                                        http3.setRequestHeader("Content-length", progparams.length);
                                        http3.setRequestHeader("Connection", "close");
                                        http3.onreadystatechange = function() {
                                            if (http3.readyState == 4) {
                                                if (http3.status == 200) {
                                                    console.log("Kodi playlist started");
                                                    var reply = http3.response;           
                                                } else {
                                                    console.log("Kodi playlist start failed");
                                                    var reply = http3.response;
                                                    var statuscode = reply.statusCode;
                                                    var message = reply.message;
                                                    console.log(statuscode + " - " + message);
                                                }
                                            }
                                        }
                                        http3.send(progparams);
                                    } else {
                                        console.log("Kodi random playlist selection failed");
                                        var reply = http2.response;
                                        var statuscode = reply.statusCode;
                                        var message = reply.message;
                                        console.log(statuscode + " - " + message);
                                    }
                                }
                            }
                            http2.send(params2);
                        } else {
                            console.log("Kodi Playlist.Clear failed");
                            var reply = http.response;
                            var statuscode = reply.statusCode;
                            var message = reply.message;
                            console.log(statuscode + " - " + message);
                        }
                    }
                }
                http.send(params);
                playRandom.value = false;
            }
        }
    }
}