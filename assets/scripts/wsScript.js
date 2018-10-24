/**
 * Created by Kurt on 3/16/16.
 */
var socket;
initSocket();

function initSocket(){

    socket = new WebSocket("ws://localhost:8989/subscribe/job");

    socket.onmessage = function (event) {
        if (IsJsonString(event.data)) {
            var text = JSON.parse(event.data);
            console.log("Received server event: " + text.serverEvent)
            if (text.serverEvent === "queryResponse") {
                var element = document.getElementById('results');
                if (element) {
                    element.remove();
                }
                document.getElementById('rest-output').appendChild(makeSearchResults(text, 'pure-menu-children', 'results'));
            }
            if (text.serverEvent === "subscriptionData") {
                mapJsonDashboardToTable(event.data, "dashboard")
            }
            if (text.serverEvent === "jobUpdate") {
                updateFavorites();
                alertUpdated();
            }
        }
    }

    socket.onopen = function (event) {
        console.log("Opening socket...")
        updateFavorites();
    }

    socket.onclose = function (event) {
        var message = event.data;
        console.log("Closing connection")
        console.log(message);
        initSocket();
    };

    socket.onerror = function (error) {
        console.log('WebSocket Error: ' + error);
    };
}


registerEventListeners();

function registerEventListeners() {
    registerSearch();
    registerResult();
    registerRemoveFavorite();
}

function registerSearch() {
    var searchBox = document.getElementById("searchbox");
    searchBox.addEventListener("keyup", callQuery, false);
}

function registerResult() {
    var list = document.getElementById("rest-output");
    list.addEventListener("click", callAddResult, false);
}

function registerRemoveFavorite() {
    var list = document.getElementById("favorites");
    list.addEventListener("click",removeResult, false);
}

function callAddResult(e) {
    var text = e.target.textContent;
    if (text && e.target.classList[0] === 'pure-menu-item') {
        console.log("Add " + text + " to local storage")
        addResult(text);
        updateFavorites();
        alertSubscription(text);
    }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function addResult(result) {
    var isJson = IsJsonString(localStorage["favorites"]);
    if (isJson) {
        var favorites;
        favorites = JSON.parse(localStorage["favorites"]);
        favorites.push(result);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    else {
        var favorites = new Array();
        favorites.push(result);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

function removeResult(e) {
    var result = e.target.textContent;
    var isJson = IsJsonString(localStorage["favorites"]);
    if (isJson) {
        var favorites;
        favorites = JSON.parse(localStorage["favorites"]);
        itemToRemove = favorites.indexOf(result);
        if(itemToRemove != -1) {
            favorites.splice(itemToRemove, 1);
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
        updateFavorites();
    }
    else {
        console.log("Could not remove item from favorites.")
    }
}

function updateFavorites() {
    var isJson = IsJsonString(localStorage["favorites"]);
    if (isJson) {
        var favorites = new Array();
        favorites = JSON.parse(localStorage["favorites"]);
        makeFavorites(favorites);
        callSubscribe(favorites);
    }
    else {
        var favorites = new Array();
        makeFavorites(favorites);
    }
}

function alertSubscription(alertValue) {
    removeElementsByClass('alert-message')
    var alert = document.createElement('div');
    alert.className = 'alert-message';
    var message = document.createElement('p');
    message.appendChild(document.createTextNode("Added " + alertValue + " to favorites!"));
    alert.appendChild(message);
    document.getElementById('wrapper').appendChild(alert);
}

function alertUpdated() {
    removeElementsByClass('alert-message')
    var alert = document.createElement('div');
    alert.className = 'alert-message';
    var message = document.createElement('p');
    message.appendChild(document.createTextNode("Update received from Jenkins!"));
    alert.appendChild(message);
    document.getElementById('wrapper').appendChild(alert);
}

function removeElementsByClass(className) {
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function sendQuery(query) {
    var obj = new Object();
    obj.event = "query";
    obj.userEventType = "query";
    obj.values = [query];
    var jsonString = JSON.stringify(obj);
    socket.send(jsonString);
}

function callQuery() {
    var text = this.value;
    sendQuery(text);
}

function callSubscribe(jobs) {
    var obj = new Object();
    obj.event = "addJobs";
    obj.userEventType = "addJobs";
    obj.values = jobs;
    var jsonString = JSON.stringify(obj);
    socket.send(jsonString);
}

function makeFavorites(array) {

    while (document.getElementById('favorites').firstChild) {
        document.getElementById('favorites').removeChild(document.getElementById('favorites').firstChild)
    }
    // Create the list element:
    var list = document.getElementById("favorites");


    for (var i = 0; i < array.length; i++) {
        if (array[i] !== "\n\n    ") {
            // Create the list item:
            var item = document.createElement('li');
            item.className = "pure-menu-item";

            // Set its contents:
            var anchor = document.createElement('a');
            anchor.appendChild(document.createTextNode(array[i]));
            anchor.className = 'pure-menu-link';
            item.appendChild(anchor);
            // Add it to the list:
            list.appendChild(item);
        }

    }

    // Finally, return the constructed list:
    return list;
}

function makeSearchResults(array, listClass, listId) {
    // Create the list element:
    var list = document.createElement('ul');
    list.className = listClass;
    list.id = listId;

    for (var i = 0; i < array.jobs.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        item.className = 'pure-menu-item pure-menu-link'

        // Set its contents:
        item.appendChild(document.createTextNode(array.jobs[i].name));

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

function mapJsonDashboardToTable(responseText, domElementId) {
    var txt = JSON.parse(responseText);
    var table = document.createElement("table");
    table.className = "space";
    for (var i = 0; i < txt.jobs.length; i++) {
        var jobAnchor = document.createElement("a");
        var name = document.createTextNode(txt.jobs[i].name);
        jobAnchor.className = "job-anchor";
        jobAnchor.href = "#";
        jobAnchor.appendChild(name);
        jobAnchor.target = "_blank";
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.appendChild(jobAnchor);
        tr.appendChild(td1);

        for (var x = 0; x < txt.jobs[i].builds.length; x++) {
            var td2 = document.createElement("td");
            var number = document.createElement("a");
            var numberText = document.createTextNode(txt.jobs[i].builds[x].buildNumber);
            var dashboardUrl = txt.jobs[i].builds[x].url;
            td2.className = getColor(txt.jobs[i].builds[x]);
            number.href = dashboardUrl;
            number.appendChild(numberText);
            number.target = "_blank";
            td2.appendChild(number);
            tr.appendChild(td2);
        }
        table.appendChild(tr);

    }
    var displayNode = document.getElementById(domElementId);
    //Clear contents
    while (displayNode.firstChild) {
        displayNode.removeChild(displayNode.firstChild);
    }
    displayNode.appendChild(table);


}

function getColor(Build) {
    if (Build.building) {
        return "building"
    }
    if (Build.passed) {
        return "passed"
    }
    ;
    if (Build.failed) {
        return "failed"
    }
    ;
    if (Build.aborted) {
        return "aborted"
    }
    ;
    if (Build.unstable) {
        return "unstable"
    }
    ;
    if (Build.corrupt && !Build.building) {
        return "corrupt"
    }
    ;

}

