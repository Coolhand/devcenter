jQuery(function(){

	//region Sliders
	if(typeof(PiSlider) === 'function'){
		$('.pi-slider').each(function(){
			var slider = new PiSlider($(this), {
				debug: 0,
				enableSwipes: 1,
				enablePagination: 1,
				enableArrows: 1,
				enableKeys: 1,
				action: $(this).data('sliderAction')
			});
		});
	}
	//endregion

});