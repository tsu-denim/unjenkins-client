window.onhashchange = refreshContentAndUriHash();
registerThemeLinks();
refreshContent();
setInterval(refreshContent, 40000);


function refreshContentAndUriHash(){
    registerThemeLinks();
    refreshContent();
}

function refreshContent(){
    var serviceUrl = "http://localhost:8989/api/" + window.location.hash.substr(1);
    var baseConnectionUrl = "http://localhost:8888";
    refreshServerConnection(baseConnectionUrl);
    writeJsonDashboardToDomElement("rest-output", new XMLHttpRequest(), serviceUrl);
}

function refreshServerConnection(baseConnectionUrl){
    var xmlRequest = new XMLHttpRequest();
    var healthCheckUrl = baseConnectionUrl + "/api/healthCheck"
    xmlRequest.open("GET", healthCheckUrl, true);
    xmlRequest.send();
    xmlRequest.onreadystatechange = function() { reconnectServer(xmlRequest, baseConnectionUrl);}

}

function reconnectServer(healthCheckRequest, baseConnectionUrl){

    if (healthCheckRequest.readyState == 4 && healthCheckRequest.status == 200){
        var txt = JSON.parse(healthCheckRequest.responseText);
        if (txt.connected){
            var connectionStatus = document.querySelector("#serverConnection");
            connectionStatus.classList.remove("connecting");
            connectionStatus.classList.remove("md-dark");
        }
        else if(!txt.reconnecting) {
            var connectionStatus = document.querySelector("#serverConnection");
            connectionStatus.classList.add("md-dark");
            connectServer(baseConnectionUrl);
        }

        else if(txt.reconnecting){
            var connectionStatus = document.querySelector("#serverConnection");
            connectionStatus.classList.add("md-dark");
            connectionStatus.classList.add("connecting");
        }
        
    }

}

function connectServer(baseConnectionUrl){
    var xmlRequest = new XMLHttpRequest();
    var connectUrl = baseConnectionUrl + "/api/connect"
    xmlRequest.open("GET", connectUrl, true);
    xmlRequest.send();
    xmlRequest.onreadystatechange = function() {
        if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
            var connectionStatus = document.querySelector("#serverConnection");
            connectionStatus.classList.add("connecting");
        }
    }
}



function writeJsonDashboardToDomElement(domElementId, xmlRequest, url){
    xmlRequest.open("GET", url, true);
    xmlRequest.send();

    var progressBar = document.getElementById("progressBar");
    progressBar.style.visibility = "visible";

    xmlRequest.onreadystatechange = function() { mapJsonDashboardToTable(xmlRequest, domElementId); progressBar.style.visibility = "hidden";}

}

function mapJsonDashboardToTable(xmlRequest, domElementId){
    if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
        var txt = JSON.parse(xmlRequest.responseText);
        var table = document.createElement("table");
        table.className="space";
        for(var i = 0; i < txt.jobs.length; i++) {
            var jobAnchor = document.createElement("a");
            var name = document.createTextNode(txt.jobs[i].name);
            var triageUrl = "http://hatersgonnahate:7000/?view=triage&jobs=" + txt.jobs[i].name;
            jobAnchor.className="job-anchor";
            jobAnchor.href = triageUrl;
            jobAnchor.appendChild(name);
            jobAnchor.target="_blank";
            var tr = document.createElement("tr");
            var td1 = document.createElement("td");
            td1.appendChild(jobAnchor);
            tr.appendChild(td1);

            for(var x = 0; x < txt.jobs[i].builds.length; x++) {
                var td2 = document.createElement("td");
                var number = document.createElement("a");
                var numberText = document.createTextNode(txt.jobs[i].builds[x].buildNumber);
                var dashboardUrl =  txt.jobs[i].builds[x].url;
                td2.className=getColor(txt.jobs[i].builds[x]);
                number.href=dashboardUrl;
                number.appendChild(numberText);
                number.target="_blank";
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

}

function getColor(Build){
    if(Build.passed) {
        return "passed"};
    if(Build.failed){
        return "failed"};
    if(Build.aborted){
        return "aborted"};
    if(Build.unstable){
        return "unstable"};
    if(Build.corrupt && !Build.building){
        return "corrupt"};
    if(Build.building){
        return "building"
    }
}

function switchTheme(){
    themeId = this.id;
    var href = "assets/themes/" + themeId + "/styles/styles.css"
    document.getElementById('cssTheme').href = href;
}

function registerThemeLinks() {

    var className = document.getElementsByClassName("pure-menu-link");
    for (var i = 0; i < className.length; i++) {
        className[i].href = "#" + window.location.hash.substr(1);
        if (className[i].id != "menuLink1"){
            var themeId = className[i].id;
            var theme = document.getElementById(themeId);
            theme.addEventListener("click", switchTheme, false);
        }



    }
}

