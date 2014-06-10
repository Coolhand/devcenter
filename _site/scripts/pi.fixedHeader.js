jQuery(function(){

	//region Fixed header
	var $w = $(window),
		$d = $(document),
		$b = $('body'),
		$hrW = $('.pi-section-header-w'),
		$fixedHrRows = $('.pi-header-row-fixed'),
		rowDuplications = [],
		headerHeight = 0 ,
		fixedHeaderTreshold = 300,
		classDuplication = 'pi-row-duplication',
		сlassDuplicationShown = 'pi-fixed-header-rows-shown',
		сlassDuplicationReduced = 'pi-header-row-reduced',
		сlassDuplicationActive = 'pi-active',
		scrollCheckTmt,
		isFixedRowScrollEventListenerAttached = 0;

	$hrW.each(function(){
		headerHeight += $(this).height();
	});

	if($fixedHrRows.length){
		PI_attachFixedRowScrollEventListener();
		PI_duplicateFixedRows();
		PI_activateFixedRow();
		fixActiveRow();
	}

	function PI_attachFixedRowScrollEventListener(){
		if(!isFixedRowScrollEventListenerAttached) {
			$w.scroll(function(){
				clearTimeout(scrollCheckTmt);
				scrollCheckTmt = setTimeout(function(){
					fixActiveRow();
				}, 100);
			});
			isFixedRowScrollEventListenerAttached = 1;
		}
	}

	function PI_duplicateFixedRows(){

		var $duplication;

		$fixedHrRows = $('.pi-header-row-fixed');

		$fixedHrRows.each(function(){
			var $curRow = $(this);
			if($curRow[0].piDuplication === undefined){
				$duplication = $curRow.clone();
				modifyCloneIDS($duplication);

				$duplication.addClass(classDuplication + ' ' + сlassDuplicationReduced + ' ' + 'pi-hidden-md');
				$curRow[0].piDuplication = $duplication;
				$b.append($duplication);
				rowDuplications.push($duplication);

				$d.trigger('pi-dom-updated');
			}
		});
	}

	function fixActiveRow(){
		var scrollTop = $w.scrollTop();
		if(scrollTop >= headerHeight + fixedHeaderTreshold){
			$b.addClass(сlassDuplicationShown);
		} else {
			$b.removeClass(сlassDuplicationShown);
		}
	}

	function PI_activateFixedRow(n){

		for(var i = 0; i < rowDuplications.length; i++){
			rowDuplications[i].removeClass(сlassDuplicationActive);
		}

		if(n < 0){
			return;
		}

		var $duplicatedRow,
			$duplication;

		if(n === undefined){
			$duplicatedRow = $fixedHrRows.last();
		} else {
			$duplicatedRow = $hrW.eq(n);
		}

		if($duplicatedRow) {
			$duplication = $duplicatedRow[0].piDuplication;
			if($duplication) {
				$duplication.addClass(сlassDuplicationActive);
			}
		}
	}

	function modifyCloneIDS($el){
		var id = $el.attr('id'),
			newIdPostfix = '_copy';

		if(id){
			$el.attr('id', id + newIdPostfix);
		}

		$el.children().each(function(){
			modifyCloneIDS($(this));
		});
	}
	//endregion

	window.PI_attachFixedRowScrollEventListener = PI_attachFixedRowScrollEventListener;
	window.PI_duplicateFixedRows = PI_duplicateFixedRows;
	window.PI_activateFixedRow = PI_activateFixedRow;

});