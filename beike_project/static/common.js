function phoneContactChange(){
	var isChecked = $('#phone-checked').prop( "checked" );
	if(isChecked){
		$('#phone_number_div').show();
	} else {
		$('#phone_number_div').hide();
	}
}


function emailContactChange(){
	var isChecked = $('#email-checked').prop( "checked" );
	if(isChecked){
		$('#email_div').show();
	} else {
		$('#email_div').hide();
	}
}

function qqContactChange(){
	var isChecked = $('#qq-checked').prop( "checked" );
	if(isChecked){
		$('#qq_number_div').show();
	} else {
		$('#qq_number_div').hide();
	}
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-50880603-1', '54.204.4.250');
ga('send', 'pageview');

