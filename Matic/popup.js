$(function() {

    chrome.storage.sync.get('arr', function(result){
        var tabs = result.arr;
        for(i=0; i<tabs.length; i++)
        { 
            $("#tabs").append("<tr> <td>"+tabs[i][0]+"</td> <td>"+tabs[i][1]+" "+tabs[i][2]+"</td> <td id=\""+"td"+i+"\">"+"</td> </tr>");
            
            var dellink = document.createElement('span');
            dellink.innerHTML = "delete";
            dellink.id = i;
            if(document.getElementById( "td"+String(i) ) != null)
            {
            document.getElementById( "td"+String(i) ).appendChild(dellink);   
            }
        }
    });

    var parent = document.querySelector('#tabs');
    parent.addEventListener("click", function(e){
        if(e.target.innerHTML == "delete"){

            chrome.storage.sync.get('arr', function(result){
                var list = result.arr;
                list.splice(e.target.id, 1);

                chrome.storage.sync.set({'arr':list}, function(){
                    window.location.reload();
                });
            });
        }
        e.stopPropagation();
    });

    function check(){

    chrome.storage.sync.get('arr', function(result){

        if(result.arr){
        var list = result.arr;

        chrome.storage.sync.get('openList', function(res){
            if(res.openList)
            {
                var toOpen = res.openList
            }
            else{
                var toOpen = new Array();
            }
            
            list.forEach(elem => {
            
            var t = elem[2];
            var difference;

                switch(t)
                {
                case "days":
                    difference = elem[1] * 86400000;  // One day in miliseconds
                    break;
                case "weeks":
                    difference = elem[1] * 604800000;
                    break;
                case "months":
                    difference = elem[1] * 2592000000;
                    break;
                case "hours":
                    difference = elem[1] * 3600000;
                    break;
                }

                if(Date.now() - elem[3] > difference)
                {

                    var duplicate = false;
                        toOpen.forEach(link => {
                            if(link == elem[0]) //check for duplicates
                            {
                                console.log("wystąpił duplikat"); 
                                duplicate = true;
                                return;
                            }
                        })
                    if(duplicate==false)
                    {
                        toOpen.push(elem[0]);
                        elem[3] = Date.now();
                        console.log("dodanie unikatowego linku");   
                    }
                }
            })//foreach in list

            chrome.storage.sync.set({'openList':toOpen}, function(){
                $("#nbr").text( String(toOpen.length) );
            });

            chrome.storage.sync.set({'arr':list}, function(){ });
        
        });// chrome get openList

        }//if != null
        });//chrome get arr

    };//check fn
    
    check();
    
    $("#add").click(function(){
        var link = $("#url").val();
        var nr = $("#number").val();
        var time = $("#time").val();
        var lastOpened = Date.now();

        var record = [link, nr, time, lastOpened];

        chrome.storage.sync.get('arr', function(result){

            if(result.arr)
            {
                list = result.arr;
            }
            else{
                var list = new Array();
            }

            list.push(record);

            chrome.storage.sync.set({'arr':list}, function(){
                window.location.reload();
            });
        });
    });

    $("#clear").click(function(){
        var empty = new Array();
        chrome.storage.sync.set({'openList':empty}, function(){
        window.location.reload();
        });
    });

    $("#open").click(function(){

        chrome.storage.sync.get('openList', function(result){
            if(result.openList)
            {
                var toOpen = result.openList
            }
            else{
                var toOpen = new Array();
            }

            toOpen.forEach(link => {
                chrome.tabs.create({ url:link });
            });

        var empty = new Array();
        chrome.storage.sync.set({'openList':empty}, function(){ });
        });
    });

    $("#open-window").click(function(){

        chrome.storage.sync.get('openList', function(result){
            if(result.openList)
            {
                var toOpen = result.openList
            }
            else{
                var toOpen = new Array();
            }

            chrome.windows.create({incognito:false}, function(window){
                var winId = window.id;

                toOpen.forEach(link => {
                    chrome.tabs.create({ url:link, windowId:winId });
                });
            });
        var empty = new Array();
        chrome.storage.sync.set({'openList':empty}, function(){ });
        });
    });
});