//------------------------------------------------------------variables
var clear = document.getElementById("clear_list");
var start = document.getElementById('myonoffswitch');
var port;
var pie_chart; var pie_chart_total;
var labels; var chart_data;

initialize();

//------------------------------------------------------------whale
whale.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
        var url_list = document.getElementById('url_list');
        if(request.msg == 'draw'){
            var timer_list = request.timer_list;
            var total_time = request.total_time;

            for(var i = 0; i < timer_list.length; i++){
                if(!labels.includes(timer_list[i].name)){
                    labels.push(timer_list[i].name);
                    chart_data.push(timer_list[i].time);
                }
                else{
                    var found = labels.indexOf(timer_list[i].name);
                    chart_data[found] = timer_list[i].time;
                }
            }
            pie_chart.update();
        }
        else if(request.msg == 'initialize'){
            console.log("Initialize");
            //Create urls
            var timer_list = request.timer_list;
            console.log(timer_list.length);
            for(var i = 0; i < timer_list.length; i++){
                var url = findURL(timer_list[i].name, url_list);
                console.log(url);
                var node;
                if(!url){
                    node = create_url_li(timer_list[i].name, url_list);
                }
                else{
                    node = url;
                }
                node.childNodes[1].checked = timer_list[i].active;
                node.childNodes[1].setAttribute('checked', node.childNodes[1].checked);
                node.childNodes[0].checked = timer_list[i].blocked;
                node.childNodes[0].setAttribute('checked', node.childNodes[0].checked);
            }
            //Sync Buttons
            start.checked = request.start_state;
            start.setAttribute('checked', start.checked);
            //Draw Chart
            pie_chart = draw_chart(request.total_time, request.timer_list);
        }
        else if(request.msg == 'checkbox') handle_checkbox_message(request);
        else if(request.msg == 'clear') clear_list();
    }
);

//-------------------------------------------------------------button
clear.onclick = function(){
    clear_list();
};

start.onchange = function(){
    port.postMessage({msg: 'checkbox', id: 'start_box', state: start.checked});
};

//------------------------------------------------------------function
function checkbox_onChange(checkbox){
    port.postMessage({msg: 'checkbox', id: checkbox.id , state: checkbox.checked});
}

function initialize(){
    //Setup port
    port = chrome.extension.connect({
        name: 'background'
    });
    port.postMessage('initialized');
}

function create_url_li(url, url_list){
  var node = document.createElement('LI');
  var textnode = document.createTextNode(url);

  //Create Check Button
  var warning_box = create_warning_box(url);
  var blocking_box = create_block_box(url);
    warning_box.setAttribute('class', "apple-switch");
    blocking_box.setAttribute('class', "apple-switch");
  //Add new Elements to the url_list
  node.appendChild(blocking_box);
  node.appendChild(warning_box);
  node.appendChild(textnode);
  url_list.appendChild(node);
  return node;
}

function handle_checkbox_message(request){

    if(request.id == 'start_box'){
        start.checked = request.state;
        start.setAttribute('checked', start.checked);
        return;
    }
    var temp = request.id.split(" ");
    var checkbox_type = temp[0];
    var checkbox_name = temp[1];
    var checkbox_state = request.state;

    var url = findURL(checkbox_name, url_list);
    if(checkbox_type == 'warning'){
        url.childNodes[1].checked = checkbox_state;
        url.setAttribute('checked', url.childNodes[1].checked);
    }
    else if(checkbox_type == 'blocking'){
        url.childNodes[0].checked = checkbox_state;
        url.setAttribute('checked', url.childNodes[0].checked);
    }
    return;
}

function findURL(url, list){
    var urls = list.getElementsByTagName('li');
    for(var i = 0; i < urls.length; i++){
        if(urls[i].innerText == url){
            return urls[i];
        }

    }
    return undefined;
}

function update_checkbox(url, url_list, bool){
    var checkbox = findURL(url, url_list).lastChild;
    checkbox.checked = bool;
    checkbox.setAttribute('checked', checkbox.checked);
}

function draw_chart(total_time, timer_list){
    var chart;
    labels = []; chart_data = []; var colors = [];
    for(var i = 0; i < timer_list.length; i++){
        var new_color = getRandomColor();
        colors.push(new_color);
        if(timer_list[i].time > 0){
            labels.push(timer_list[i].name);
            chart_data.push(timer_list[i].time);
        }
    }
    chart = new Chart(document.getElementById("pie-chart"), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: "Time (sec)",
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            hoverBorderColor: "rgb(255,255,0,0.75)",
            data: chart_data
          }]
        },
        options: {
          title: {
            display: true,
            text: '방해사이트'
          },
          tooltips:{
            enabled: true,
            mode: 'single',
            callbacks: {
                title: function(tooltipItems, data){
                    return data.labels[tooltipItems[0].index];
                },
                label: function(tooltipItems, data){
                    var data_time = data.datasets[0].data[tooltipItems.index];
                    var time = new Array(3);
                    for(var i = 0; i < time.length; i++){
                        time[i] = 0;
                    }
                    time[0] = data_time;
                    for(var i = 0; i < time.length-1; i++){
                        while(time[i] > 60){
                            time[i] -= 60;
                            time[i+1] += 1;
                        }
                    }
                    var display_time = "";
                    if(time[2] != 0){
                        display_time += time[2] + "시간";
                    }
                    if(time[1] != 0){
                        display_time += time[1] + "분";
                    }
                    display_time += time[0] + "초";

                    return display_time;
                },
                labelColor: function(tooltipItem, chart) {
                    var display_color = ''
                    display_color = chart.legend.legendItems[tooltipItem.index].fillStyle;
                    display_color = display_color.substring(0,7);
                    console.log(tooltipItem);
                    return {
                        borderColor: display_color,
                        backgroundColor: display_color
                    };
                }
            }
          }
        }
    });
    return chart;
}

function draw_chart_total(total_time, time_list){
    var chart;
    labels = ["productive"]; chart_data = [total_time]; var colors = ["#ff0000"];
    for(var i = 0; i < timer_list.length; i++){
        var new_color = getRandomColor();
        colors.push(new_color);
        if(timer_list[i].time > 0){
            labels.push(timer_list[i].name);
            chart_data.push(timer_list[i].time);
        }
    }
    chart = new Chart(document.getElementById("pie-chart"), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: "Time (sec)",
            backgroundColor: colors,
            data: chart_data
          }]
        },
        options: {
          title: {
            display: true,
            text: '전체 사용 시간'
          }
        }
    });
    return chart;
}

function create_clear(){
    var clear_button = document.createElement('BUTTON');
    var t = document.createTextNode("Clear");
    clear_button.id = "clear_list";
    clear_button.appendChild(t);
    document.getElementById("url_list").appendChild(clear_button);
}

function create_warning_box(url){
  var warning_button = document.createElement("input");
  warning_button.type = 'checkbox';
  warning_button.id = "warning " + url;
  warning_button.checked = true;
  warning_button.onchange = function(){
    checkbox_onChange(warning_button);
  };
  return warning_button;
}

function create_block_box(url){
  var blocking_button = document.createElement("input");
  blocking_button.type = 'checkbox';
  blocking_button.id = "blocking " + url;
  blocking_button.checked = false;
  blocking_button.onchange = function(){
    checkbox_onChange(blocking_button);
  }
  return blocking_button;
}

function clear_list(){
    //Clear Storage
    whale.storage.sync.clear();

    //Clear List
    var url_list = document.getElementById("url_list");
    while(url_list.firstChild){
        url_list.removeChild(url_list.firstChild);
    }
}

document.addEventListener('visibilitychange',function(){
    if(document.visibilityState === 'visible'){
        console.log('visible');
    }
});

function getRandomColor() {
  var letters = '0123456789abcdef';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  color += '55';
  return color;
}
