jQuery(function(){

	//region Google Map
	if($.fn.gMap){
		$('.pi-google-map').each(function (i) {
			var $map = $(this),
				markers = [],
				type = $map.data('mapType') || 'roadmap',
				zoom = $map.data('mapZoom') || 11,
				style = $map.data('mapStyle') || [],
				address = $map.data('mapAddress') || 0,
				scrollwheel = $map.data('mapScrollWheel') || 0,
				markerImg = $map.data('mapMarker') || '',
				markerImgSize = $map.data('mapMarkerSize') || [],
				markerAnchor = $map.data('mapMarkerAnchor') || [];

			if(style && window['googleMapStyle_' + style] && window['googleMapStyle_' + style].length){
				style = window['googleMapStyle_' + style];
			}

			if(markerImg) {

				if(markerImgSize.length > 1){
					markerImgSize = markerImgSize.split(',');
					markerImgSize[0] = parseInt(markerImgSize[0], 10);
					markerImgSize[1] = parseInt(markerImgSize[1], 10);
				}

				if(markerAnchor.length > 1){
					markerAnchor = markerAnchor.split(',');
					markerAnchor[0] = parseInt(markerAnchor[0], 10);
					markerAnchor[1] = parseInt(markerAnchor[1], 10);
				}

				markers = [{
					address: address,
					icon: {
						image: markerImg,
						iconsize: markerImgSize,
						iconanchor: markerAnchor
					}
				}];

			}

			if(address){
				var map = $map.gMap({
					maptype: type,
					address: address,
					zoom: zoom,
					styles: style,
					scrollwheel: scrollwheel,
					markers: markers
				});
			}

		});
	}
	//endregion

});