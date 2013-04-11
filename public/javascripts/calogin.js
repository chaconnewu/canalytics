$(document).ready(function() {
	$("body").height($(window).height());
	$("body").width($(window).width());
	windows = new dhtmlXWindows();
	windows.setImagePath("/imgs/");
	windows.setSkin("dhx_terrace");
	$(window).resize(function() {
		windows.forEachWindow(function(win) {
			win.centerOnScreen();
		})
	})
	
	var login_window = windows.createWindow("login_window", 0, 0, 380, 220);
	login_window.centerOnScreen();
	login_window.button("park").hide();
	login_window.button("minmax1").hide();
	login_window.button("close").hide();
	login_window.clearIcon();
	login_window.setText("Log In")
	
	var signup_window = windows.createWindow("signup_window", 0, 0, 360, 280);
	signup_window.centerOnScreen();
	signup_window.button("park").hide();
	signup_window.button("minmax1").hide();
	signup_window.button("close").hide();
	signup_window.clearIcon();
	signup_window.setText("Sign Up")
	signup_window.hide();
	
	var forgot_window = windows.createWindow("forgot_window", 0, 0, 380, 200);
  forgot_window.centerOnScreen();
	forgot_window.button("park").hide();
	forgot_window.button("minmax1").hide();
	forgot_window.button("close").hide();
	forgot_window.clearIcon();
	forgot_window.setText("Find Password")
	forgot_window.hide();
	
  var login_form_structure = [
		{type:"settings", position:"label-left", labelWidth:80, inputWidth:120, labelAlign:"left"},
    {type:"input", name:"username", label:"Username:", required:true, offsetLeft:20, offsetTop:10},
    {type:"password", name:"password", label:"Password:", required:true, offsetLeft:20, offsetTop: 10},
    {type:"button", name:"login", width:80, position:"absolute", offsetLeft:120, offsetTop:90, value:"Log In"},
		{type:"template", name:"signup", value:"Not a member yet?", format: format_a, offsetLeft:220, offsetTop:20},
		{type:"template", name:"forgot", value:"Forgot password?", format: format_a, offsetLeft:220, offsetTop:10}
  ];

	var signup_form_structure = [
		{type:"settings", position:"label-left", labelWidth:80, inputWidth:120, labelAlign:"left"},
    {type:"input", name:"username", label:"Username:", required:true, offsetLeft:20, offsetTop:10},
    {type:"password", name:"password", label:"Password:", required:true, offsetLeft:20, offsetTop: 10},
		{type:"password", name:"repassword", label:"Confirm Password:", required:true, offsetLeft:20, offsetTop: 10},
		{type:"input", name:"email", label:"Email:", required:true, offsetLeft:20, offsetTop:0},
		{type:"button", name:"signup", width:80, position:"absolute", offsetLeft:110, offsetTop:170, value:"Sign Up"},
		{type:"template", name:"login", value:"Already a member?", format: format_a, offsetLeft:200, offsetTop:25},
  ];

	var forgot_form_structure = [
		{type:"settings", position:"label-left", labelWidth:60, inputWidth:200, labelAlign:"left"},
    {type:"input", name:"email", label:"Email:", required:true, offsetLeft:20, offsetTop:10},
		{type:"button", name:"send", width:80, position:"absolute", offsetLeft:40, offsetTop:50, value:"Send"},
		{type:"template", name:"login", value:"Go Back", format: format_a, offsetLeft:140, offsetTop:20},
  ];
  
	var login_form = windows.window("login_window").attachForm(login_form_structure);
	login_form.setSkin('dhx_terrace');
	
	var signup_form = windows.window("signup_window").attachForm(signup_form_structure);
	signup_form.setSkin('dhx_terrace');
	
	var forgot_form = windows.window("forgot_window").attachForm(forgot_form_structure);
	forgot_form.setSkin('dhx_terrace');
	
	login_form.attachEvent("onButtonClick", function(id) {
		this.send("/login", "post", function(res){
			if(res.xmlDoc.status === 200) {
				windows.unload();
				window.location.reload();
			}
		});
	});
	
	signup_form.attachEvent("onButtonClick", function(id) {
		this.send("/signup", "post", function(res){
			alert(res);
		})
	});
	
	forgot_form.attachEvent("onButtonClick", function(id) {
		this.send("/signup", "post", function(res){
			alert(res);
		})
	});
	
	function format_a(name, value) {
		return "<a href=\"javascript:changeModal('" + name + "');\">" + value + "</a>";
	}
});

function changeModal(id) {
	if(id === "signup") {
		windows.window("login_window").hide();
		windows.window("forgot_window").hide();
		windows.window("signup_window").show();
	} else if(id === "forgot") {
		windows.window("login_window").hide();
		windows.window("signup_window").hide();
		windows.window("forgot_window").show();
	} else {
		windows.window("login_window").show();
		windows.window("signup_window").hide();
		windows.window("forgot_window").hide();
	}
};