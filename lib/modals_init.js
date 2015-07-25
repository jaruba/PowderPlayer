$(function() {
	$('.easy-modal').easyModal({
		top: 200,
		overlay: 0.2
	});

	$('.easy-modal-open').click(function(e) {
		var target = $(this).attr('href');
		$(target).trigger('openModal');
		e.preventDefault();
	});
	
	
	$('.main-add-url').click(openUrlModal);

	$('.easy-modal-close').click(function(e) {
		$('.easy-modal').trigger('closeModal');
	});

	$('.easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.animated-close'
	});
	
	$('.second-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.second-animated-close'
	});
	
	$('.third-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.third-animated-close'
	});
	
	$('.forth-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.forth-animated-close'
	});
	
	$('.history-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.history-animated-close'
	});
	
	$('.unsupported-easy-modal-animated').easyModal({
		top: 200,
		overlay: 0.2,
		transitionIn: 'animated bounceInLeft',
		transitionOut: 'animated bounceOutRight',
		closeButtonClass: '.unsupported-animated-close'
	});
});

function openUrlModal(e) {
	var target = $(this).attr('href');
	$(target).trigger('openModal');
	$("#open-url").trigger('openModal');
	e.preventDefault();
	checkInternet(function(isConnected) {
		if (isConnected) {
			$('#internet-error').hide();
			$('#internet-ok').show(1);
			$('#magnetLink').focus();
		} else {
			$('#internet-ok').hide();
			$('#internet-error').show(1);
		}
	});
	$('#open-url').css('top', Math.round(($(window).height() - 187) / 2)+'px');
}
