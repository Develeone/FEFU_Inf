var myApp = new Framework7({
	modalTitle: 'TEST',
	material: true,
	swipePanel: 'left',
	modalButtonCancel: 'Отмена',
	modalPreloaderTitle: "Загрузка...",
	hideNavbarOnPageScroll: true,
	hideToolbarOnPageScroll: true,
	hideTabbarOnPageScroll: true,
	scrollTopOnNavbarClick: true,
	preloadPreviousPage: true,
	materialRipple: false,
});
var $$ = Dom7;
var mainView = myApp.addView('.view-main', {});
var rightView = myApp.addView('.view-right', {});
$$(document).on('ajaxStart', function(e) {
	myApp.showIndicator();
});
$$(document).on('ajaxComplete', function() {
	myApp.hideIndicator();
});

myApp.onPageInit('messages', function(page) {
	var conversationStarted = false;
	var answers = ['Yes!', 'No', 'Hm...', 'I am not sure', 'And what about you?', 'May be ;)', 'Lorem ipsum dolor sit amet, consectetur', 'What?', 'Are you sure?', 'Of course', 'Need to think about it', 'Amazing!!!', ];
	var people = [{
		name: 'Kate Johnson',
		avatar: 'http://lorempixel.com/output/people-q-c-100-100-9.jpg'
	}, {
		name: 'Blue Ninja',
		avatar: 'http://lorempixel.com/output/people-q-c-100-100-7.jpg'
	}, ];
	var answerTimeout, isFocused;
	var myMessages = myApp.messages('.messages');
	var myMessagebar = myApp.messagebar('.messagebar');
	$$('.messagebar a.send-message').on('touchstart mousedown', function() {
		isFocused = document.activeElement && document.activeElement === myMessagebar.textarea[0];
	});
	$$('.messagebar a.send-message').on('click', function(e) {
		if (isFocused) {
			e.preventDefault();
			myMessagebar.textarea[0].focus();
		}
		var messageText = myMessagebar.value();
		if (messageText.length === 0) {
			return;
		}
		myMessagebar.clear();
		myMessages.addMessage({
			text: messageText,
			avatar: 'http://lorempixel.com/output/people-q-c-200-200-6.jpg',
			type: 'sent',
			date: 'Now'
		});
		conversationStarted = true;
		if (answerTimeout) clearTimeout(answerTimeout);
		answerTimeout = setTimeout(function() {
			var answerText = answers[Math.floor(Math.random() * answers.length)];
			var person = people[Math.floor(Math.random() * people.length)];
			myMessages.addMessage({
				text: answers[Math.floor(Math.random() * answers.length)],
				type: 'received',
				name: person.name,
				avatar: person.avatar,
				date: 'Just now'
			});
		}, 2000);
	});
});




// here goes interesting standard code

function createContentPage() {
	mainView.router.loadContent(
		'  <!-- Page, data-page contains page name-->' +
		'  <div data-page="dynamic-content" class="page">' +
		'    <!-- Top Navbar-->' +
		'    <div class="navbar">' +
		'      <div class="navbar-inner">' +
		'        <div class="left"><a href="#" class="back link icon-only"><i class="icon icon-back"></i></a></div>' +
		'        <div class="center">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
		'      </div>' +
		'    </div>' +
		'    <!-- Scrollable page content-->' +
		'    <div class="page-content">' + 
		'      <div class="content-block">' + 
		'        <p>Here is a dynamic page created on ' + new Date() + ' !</p>' + 
		'        <p>Go <a href="#" class="back">back</a> or generate <a href="#" class="ks-generate-page">one more page</a>.</p>' + 
		'      </div>' +
		'    </div>' + 
		'  </div>');
	return;
}
$$(document).on('click', '.ks-generate-page', createContentPage);




function loadScript(url, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onload = callback;
	head.appendChild(script);
}

var socket;

document.addEventListener("menubutton", function() {
	loadScript('js/socket.io.js', function () {
		
		socket = io.connect("http://54.149.145.13:1313");

		console.log("connecting");
		
		socket.send("lol", function (data) {
			alert(data);
		});

		socket.on('ping', function (data) {
			console.log(data.message);
			socket.emit('pong', { message: 'Hello from client!' });
		});

		socket.on('connect', function () {
			console.log("connected");
		});

		socket.on('error', function () {
			console.log("error");
		});
	});
}, false);







/* MY CODE STARTS HERE */

var user_logged_in = false;

// Prevent exit on backbutton click
document.addEventListener("deviceready", function() {
	intel.xdk.device.addVirtualPage();
},false);

document.addEventListener("backbutton", function() {
	intel.xdk.device.addVirtualPage();

	var closing_done = false;
	
	// Чтоб нельзя было вернуться на основную страничку во время туториала
	if ("page_name" == "tutorial") {
		myApp.alert("Пока что Вам нельзя так делать.");
		return;
	}
	
	$$(".panel").each( function () {
		if ($$(this).hasClass("active")) {
			closing_done = true;
			myApp.closePanel();
		}
	});
	
	if (!closing_done) {
		mainView.router.back();
	}
	
}, false);

// System functions
function GoToPage(url) {
	mainView.router.loadPage(url);
}

document.addEventListener("deviceready", function() {
	if (!user_logged_in)
		Auth();
},false);

myApp.onPageInit('photos', function (page) {
	var photos_all_page = $$('#photos_all_page');
 	
	photos_all_page.on('refresh', function (e) {
		myApp.alert("Обновление фоточек");
		setTimeout(function () {
			myApp.pullToRefreshDone();
		}, 5000);
	});
	
	// Loading flag
	var loading = false;
 
	// Append items per load
	var itemsPerLoad = 20;
 
	// Attach 'infinite' event handler
	photos_all_page.on('infinite', function () {

		// Exit, if loading in progress
		if (loading) return;
 
		// Set loading flag
		loading = true;
 
		// Emulate 1s loading
		setTimeout(function () {
			// Reset loading flag
			loading = false;

			var gotEnd = false;
			if (gotEnd) {
				// Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
				myApp.detachInfiniteScroll(photos_all_page);
				// Remove preloader
				$$('.infinite-scroll-preloader').remove();
				return;
			}

			// Generate new items HTML
			var html = '';
			for (var i = 1; i <= 10; i++) {
			  //html += '<li class="item-content"><div class="item-inner"><div class="item-title">Item ' + i + '</div></div></li>';
				html += '<div class="card ks-facebook-card">'+
					'<div class="card-header">'+
						'<div class="ks-facebook-avatar">'+
							'<img src="http://lorempixel.com/68/68/people/3/" width="34" height="34"/>'+
						'</div>'+
						'<div class="ks-facebook-name">Бабков Леонид</div>'+
						'<div class="ks-facebook-date">Понедельник 2:15 PM</div>'+
					'</div>'+
					'<div class="card-content">'+
        				'<div class="card-content-inner">'+
          					'<p>И зачем я это делаю?.. '+i+' </p>'+
							'<img src="http://lorempixel.com/1000/700/?nocache='+ Math.random() +'" width="100%"/>'+
          					'<p class="color-gray">Нравится: 112 &nbsp;&nbsp; Комментарии: 43</p>'+
        				'</div>'+
      				'</div>'+
      				'<div class="card-footer">'+
						'<a href="#" class="link">Нравится</a>'+
						'<a href="#" class="link">Комментировать</a>'+
						'<a href="#" class="link">Поделиться</a>'+
					'</div>'+
    			'</div>';
			}

			// Append new items
			$$('#photos_all_list').append(html);
		}, 1000);
	});          
});

myApp.onPageInit('events', function (page) {
	var events_all_page = $$('#events_all_page');

	events_all_page.on('refresh', function (e) {
		mainView.refreshPage();
		myApp.pullToRefreshDone();
	});
	
	var loading = false;
 
	var loadedCount = 0;
 
	events_all_page.on('infinite', LoadEventsChunk);
	
	LoadEventsChunk();
	
	function LoadEventsChunk () {

		if (loading) return;
 
		loading = true;
 
		$$.get("http://awake.su/FEFU_Informer/systems/events/events_list_get.php?s="+loadedCount, function (data) {

			if (data == "ended") {
				myApp.detachInfiniteScroll(events_all_page);
				$$('.infinite-scroll-preloader').remove();
				return;
			}
			
			data = JSON.parse(data);

			console.log(data);
			
			loading = false;

			var html = '';
			for (var i = 0; i < data.length; i++) {
			  //html += '<li class="item-content"><div class="item-inner"><div class="item-title">Item ' + i + '</div></div></li>';
				html += '<div class="card event-card-header-pic">'+
					'<div style="background-image:url(http://awake.su/FEFU_Informer/systems/events/pictures/'+ data[i]["picture"] +'.jpg);" valign="bottom" class="card-header color-white no-border">'+
					'<H4>'+data[i]["overlay"]+'</H4>'+
				'</div>'+
				'<div class="card-content">'+
					'<div class="card-content-inner"><H2 style="margin:0px;">'+data[i]["name"]+"</H2>"+
						'<p class="color-gray">Начало '+data[i]["date"]+'</p>'+
						'<p>'+data[i]["description"]+'</p>'+
					'</div>'+
				'</div>'+
				'<div class="card-footer">'+
					'<a href="#" class="link">Пойду ('+Math.floor(Math.random()*1000)+')</a>'+
					'<a href="#" class="link">Подробнее</a>'+
				'</div>'+
			'</div>';
			}

			$$('#events_all_list').append(html);
			
			loadedCount += 5;
		});
	};          
});

myApp.onPageInit('event_add', function (page) {
	$$("#user_id").val(intel.xdk.device.uuid);
	$$("#hash").val(CryptoJS.MD5(intel.xdk.device.uuid + "fuck_you"));
});

myApp.onPageInit('people', function (page) {
	var people_all_page = $$('#people_all_page');

	people_all_page.on('refresh', function (e) {
		mainView.refreshPage();
		myApp.pullToRefreshDone();
	});
	
	var loading = false;
 
	var loadedCount = 0;
 
	people_all_page.on('infinite', LoadPeopleChunk);
	
	LoadPeopleChunk();
	
	function LoadPeopleChunk () {

		if (loading) return;
 
		loading = true;
 
		$$.get("http://awake.su/FEFU_Informer/systems/people/people_list_get.php?s="+loadedCount, function (data) {

			if (data == "ended") {
				myApp.detachInfiniteScroll(people_all_page);
				$$('.infinite-scroll-preloader').remove();
				return;
			}
			
			data = JSON.parse(data);

			console.log(data);
			
			loading = false;

			var html = '';
			for (var i = 0; i < data.length; i++) {
				html += "" +
					'<div class="card ks-facebook-card">' +
						'<div class="card-header" style="vertical-align:middle;">' +
							'<div class="ks-facebook-avatar"><div style="background-image:url(\'http://awake.su/FEFU_Informer/systems/users/avatars/' +data[i]["user_id"] + "_" + data[i]["avatar"] + '.jpg\');" class="people-list-avatar"></div></div>' +
							'<div class="ks-facebook-name">' + data[i]["last_name"] + " " + data[i]["first_name"] + '</div>' +
							'<div class="ks-facebook-date">' + data[i]["role"] + '&nbsp;</div>'+
						'</div>' +
					'</div>';
			}

			$$('#people_all_list').append(html);
			
			loadedCount += 15;
			
			if (data.length < 15) {
				myApp.detachInfiniteScroll(people_all_page);
				$$('.infinite-scroll-preloader').remove();
			}
		});
	};          
});

var cars_selected_tab_name = "requests";
myApp.onPageInit('cars', function (page) {

	var cars_all_page = $$('#cars_all_page');

	cars_all_page.on('refresh', function (e) {
		mainView.refreshPage();
		myApp.pullToRefreshDone();
	});
	
	var loading = false;
 
	var loadedCount = 0;
 
	cars_all_page.on('infinite', LoadCarsChunk);

	cars_selected_tab_name == "requests" ? RequestsSelect() : DriversSelect();
	
	$$("#requests-tab-button").click(function () {
		RequestsSelect();
		RefreshList();
	});
	
	$$("#drivers-tab-button").click(function () {
		DriversSelect();
		RefreshList();
	});
	
	function RequestsSelect () {
		cars_selected_tab_name = "requests";
		$$("#drivers-tab-button").removeClass("active");
		$$("#requests-tab-button").addClass("active");
		$$(".tab-link-highlight").css("transform", "translate3d(0%, 0px, 0px)");
		$$(".tab-link-highlight").css("-webkit-transform", "translate3d(0%, 0px, 0px)");
	}
	
	function DriversSelect () {
		cars_selected_tab_name = "drivers";
		$$("#requests-tab-button").removeClass("active");
		$$("#drivers-tab-button").addClass("active");
		$$(".tab-link-highlight").css("transform", "translate3d(100%, 0px, 0px)");
		$$(".tab-link-highlight").css("-webkit-transform", "translate3d(100%, 0px, 0px)");
	}
	
	function RefreshList () {
		$$('#cars_all_list').html('<div class="pull-to-refresh-layer"><div class="preloader"></div><div class="pull-to-refresh-arrow"></div></div>');
		loadedCount = 0;
		LoadCarsChunk();
	}
	
	LoadCarsChunk();
	
	function LoadCarsChunk () {

		if (loading) {
			alert("fuck");
			return;
		}
 
		loading = true;
 
		$$.get("http://awake.su/FEFU_Informer/systems/cars/cars_list_get.php?s="+loadedCount+"&t="+cars_selected_tab_name, function (data) {

			loading = false;
			
			if (data == "ended") {
				myApp.detachInfiniteScroll(cars_all_page);
				$$('.infinite-scroll-preloader').remove();
				return;
			}
			
			data = JSON.parse(data);

			console.log(data);
			

			var html = '';
			for (var i = 0; i < data.length; i++) {
				html += "" +
					'<a href="tel:'+ data[i]["phone"] +'"><div class="card ks-facebook-card">' +
						'<div class="card-header" style="vertical-align:middle;">' +
							'<div class="ks-facebook-name" style="margin-left: 4px;">Откуда: ' + data[i]["place_from"] + "<br>Куда: " + data[i]["place_to"] + "<br>Цена: " + data[i]["bulletin_price"] + "р.<br>"+ data[i]["bulletin_description"] +"</div>" +
							'<div class="ks-facebook-date" style="margin-left: 4px;">' + data[i]["actual_time"] + '&nbsp;</div>'+
						'</div>' +
					'</div></a>';
			}

			$$('#cars_all_list').append(html);
			
			loadedCount += 15;
			
			if (data.length < 15) {
				myApp.detachInfiniteScroll(cars_all_page);
				$$('.infinite-scroll-preloader').remove();
			}
		});
	};          
});

myApp.onPageInit('cars_add', function (page) {
	$$("#user_id").val(intel.xdk.device.uuid);
	$$("#hash").val(CryptoJS.MD5(intel.xdk.device.uuid + "fuck_you"));
});


var slide_index = 1;
myApp.onPageInit('tutorial', function (page) {
	
	intel.xdk.device.hideStatusBar();
	
	slide_index = 0;
	SwitchSlide();
	
	var slides_names = [
		"Общение",
		"События",
		"Люди",
		"Фотографии",
		"Обучение",
		"Новости",
		"Объявления",
		"Подвезу",
		"Опросы",
	];
	
	var slides_points1 = [
		"• Общие чаты",
		"• События ДВФУ и города",
		"• Вы",
		"• Ваши",
		"• Собирайте одногруппников",
		"• Новости ДВФУ",
		"• Продам кота и утюг",
		"• Подкиньте в город",
		"• Что сделать в Информере",
	];
	var slides_points1_descs = [
		"(например, \"общий чат ДВФУ\")",
		"(например, \"весенний бал\")",
		"(ведь вам есть чем похвастаться)",
		"(ведь вам есть чем похвастаться)",
		"(это очень удобно)",
		"(будьте в курсе событий)",
		"(в добрые руки, к. 6.1)",
		"(за 150 рублей)",
		"(учитываем ваши пожелания)",
	];
	
	var slides_points2 = [
		"• Чаты учебных групп", 
		"• Неофициальные события", 
		"• Ваши друзья", 
		"• Ваших друзей",
		"• Просто управляйте расписанием",
		"• Всякие разные другие новости",
		"• Куплю Доширак срочно",
		"• Отвезу на Кампус",
		"• Что сделать в ДВФУ",
	];
	var slides_points2_descs = [
		"(+ расширенные возможности)", 
		"(например, \"мафия в 6.1\")", 
		"(им тоже есть чем похвастаться)", 
		"(им тоже есть чем похвастаться)",
		"(и оно всегда будет под рукой)",
		"(например, обновы Информера)",
		"(очень хочется есть)",
		"(хоть денег на дошир заработаю)",
		"(вдруг, верха прислушаются)",
	];
	
	var slides_points3 = [
		"• Ваши собственные чаты", 
		"• Ваши собственные события", 
		"• Всякие интересные личности", 
		"• Всяких интересных личностей",
		"• Быстро сообщайте новости",
		"• Создавайте свои новости",
		"• Перееду из к. 11 в к. 6.1",
		"• Кто едет в Москву через пару часов?",
		"• Ваши собственные опросы",
	];
	var slides_points3_descs = [
		"(открытые, закрытые)", 
		"(например, \"едем бухать\")", 
		"(а им - уж точно есть, чем)", 
		"(а им - уж точно есть, чем)",
		"(все будут информированы)",
		"(расскажите что-нибудь обществу)",
		"(поближе к городу)",
		"(и такое бывает)",
		"(если интересно общее мнение)",
	];
	
	$$("#tutorial-next-button").click(function () {
		slide_index++;
		SwitchSlide();
	});
	
	function SwitchSlide () {
			
		$$("#tutorial-page-background").css("transition", "opacity 400ms");
		$$("#tutorial-page-background").css("opacity", "0");
		
		setTimeout(function () {
			if (slide_index < 9) {
				NextSlide();
			} else if (slide_index == 9) {
				StartRegistration();
			}

			setTimeout(function () {
				$$("#tutorial-page-background").css("opacity", "1");
			}, 200);
		}, 400);
	}
	
	function NextSlide () {
		$$("#slide-name").html(slides_names[slide_index]);

		$$("#slide-image").prop("src", "./img/TutorialSplashScreen/"+slide_index+".png");

		$$("#slide-point-1").html(slides_points1[slide_index]);
		$$("#slide-point-2").html(slides_points2[slide_index]);
		$$("#slide-point-3").html(slides_points3[slide_index]);

		$$("#slide-point-1-desc").html(slides_points1_descs[slide_index]);
		$$("#slide-point-2-desc").html(slides_points2_descs[slide_index]);
		$$("#slide-point-3-desc").html(slides_points3_descs[slide_index]);
	}
	
	function StartRegistration () {
		$$("#info-slide").css("display", "none");
		$$("#tutorial-next-button").css("display", "none");
		$$("#top-space").css("height", "15%");
		$$("#registration-slide").css("display", "block");
		
		setTimeout(function(){
			$$("#register-button").css("display", "block");
		},1000);
		
		var seconds = 1;
		var secondsInterval = setInterval(function () {
			if (seconds <= 40)
				$$("#seconds-counter").html(seconds++);
			else {
				$$("#seconds-counter").html(":)");
				$$("#seconds-note").html("");
				clearInterval(secondsInterval);
			}
		}, 1300);

		var register_button_pressed = false;
		// Нажатие на кнопку "Зарегистрироваться"
		$$("#register-button").click(function () {
			clearInterval(secondsInterval);
			$$("#seconds-counter").html(":)");
			$$("#seconds-note").html("");

			var first_name = $$("#first-name").val();
			var last_name = $$("#last-name").val();
			
			while (first_name[first_name.length-1] == " ") {
				first_name = first_name.substr(0, first_name.length-1);
			}
			while (last_name[last_name.length-1] == " ") {
				last_name = last_name.substr(0, last_name.length-1);
			}
			
			first_name = first_name[0].toUpperCase() + first_name.substr(1, first_name.length-1).toLowerCase();
			last_name = last_name[0].toUpperCase() + last_name.substr(1, last_name.length-1).toLowerCase();
			
			
			var letters='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя-';
			
			for (var i = 0; i < first_name.length; i++) {
				if (letters.indexOf(first_name[i]) == -1) {
					NameError("first");
					return;
				}
			}
			for (var i = 0; i < last_name.length; i++) {
				if (letters.indexOf(last_name[i]) == -1) {
					NameError("last");
					return;
				}
			}
			
			function NameError (name) {
				$$("#"+name+"-name").css("transition", "background-color 500ms");
				$$("#"+name+"-name").css("background-color", "red");
				setTimeout(function(){
					$$("#"+name+"-name").css("background-color", "white");
				},500);
			}

			if ((first_name.length < 2) || (first_name.length > 19))
					NameError("first");
			else if ((last_name.length < 2) || (last_name.length > 19))
					NameError("last");
			else {
				if (!register_button_pressed)
					SetUserName(first_name, last_name);
				register_button_pressed = true;
			}
		}, false);
	}
});


function convertImgToBase64URL(url, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'), dataURL;
	  	var coeff = this.width > this.height ? 350/this.width : 350/this.height;
        canvas.width = this.width*coeff;
        canvas.height = this.height*coeff;
	  	//alert("Was: "+this.width+"x"+this.height+" -> "+(this.width/this.height) + "\nNow: "+canvas.width+"x"+canvas.height+" -> "+(canvas.width/canvas.height));
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
        canvas = null; 
    };
    img.src = url;
}

function SendSMS (text, to) {
	intel.xdk.device.sendSMS(text, to);
}

/* Users */

// Auth/Registration on Application start

function Auth() {
	// Authenticate
	$$.post(
		"http://awake.su/FEFU_Informer/systems/users/auth_register.php",
		{
			user_id: intel.xdk.device.uuid,
			hash: CryptoJS.MD5(intel.xdk.device.uuid + "fuck_you")
		},
		function (data) {
			
			if (data == "register_success") {
				GoToPage('./pages/tutorial.html');
				return;
			}
			
			var user_data = data.split('|');
			
			if (user_data[2] != "")
				$$("#avatar").css("background-image", "url('http://awake.su/FEFU_Informer/systems/users/avatars/"+intel.xdk.device.uuid+"_"+user_data[2]+".jpg')");
			
			if ((user_data[0] != "") && (user_data[1] != "")) {
				$$('#user_name').html(user_data[1]+"<br>"+user_data[0]);
				user_logged_in = true;
			}
			else
				GoToPage('./pages/tutorial.html');
		}
	);
}

var is_username_setting_up = false;
function SetUserName (first_name, last_name) {
	if (is_username_setting_up)
		return;
	
	is_username_setting_up = true;
	
	myApp.showIndicator();
	
	$$.post(
		"http://awake.su/FEFU_Informer/systems/users/change_name.php",
		{
			user_id: intel.xdk.device.uuid,
			hash: CryptoJS.MD5(intel.xdk.device.uuid + "fuck_you"),
			first_name: first_name,
			last_name: last_name
		},
		function (data) {
			if (data != 'change_success') {
				myApp.alert(data, "Опачки...");
			} else {
				user_logged_in = true;
				myApp.hideIndicator();
				$$('#user_name').html(last_name+"<br>"+first_name);
				mainView.router.back();
				myApp.alert('Данные сохранены', 'Успех!');
			}
		}
	);
}

// Avatar change
$$('#avatar').on('click', function () {
	myApp.confirm('Вы действительно хотите изменить изображение профиля?', 'Изображение профиля', function () {
		document.addEventListener("intel.xdk.camera.picture.add", onTakeProfilePictureSuccess);
		intel.xdk.camera.takePicture(2,true,"jpg");
	});
	
	function onTakeProfilePictureSuccess(evt) {
		if (evt.success == true) {	  
			convertImgToBase64URL(intel.xdk.camera.getPictureURL(evt.filename), function(base64Img){
				PostAvatar(base64Img);
			});
		}
		else {
			if (evt.message != undefined) {
				alert(evt.message);
			}
			else
			{
				alert("error capturing picture");
			}
		}
	}
	
	function PostAvatar (imageBase64) {
		$$.post(
			"http://awake.su/FEFU_Informer/systems/users/change_avatar.php",
			{
				user_id: intel.xdk.device.uuid,
				hash: CryptoJS.MD5(intel.xdk.device.uuid + "fuck_you"),
				image: imageBase64
			},
			function (data) {
				$$("#avatar").css("background-image", "url('http://awake.su/FEFU_Informer/systems/users/avatars/"+data+"')");
				window.plugins.socialsharing.share("У меня новая аватарка в ДВФУ Информере!","Новые новости! :-)","http://awake.su/FEFU_Informer/systems/users/avatars/"+data, "");
			}
		);
	}

});
