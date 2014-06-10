jQuery(function(){

	//region Mobile menus
	var $d = $(document);

	new MobileMenus();

	function MobileMenus(){

		var mobileMenus = [],
			settings = {
				classOpen: 'pi-menu-open',
				classParentRow: 'pi-section-header-w',
				classMenuWrapper: 'pi-section-menu-mobile-w',
				classMenu: 'pi-section-menu-mobile'
			};

		init();

		$d.bind('pi-dom-updated', function(){
			init();
		});

		function init(){

			$('.pi-mobile-menu-toggler').each(function(){
				var $el = $(this);

				if($el.get(0).piMenuWasInitialized){
					return;
				}

				$el.get(0).piMenuWasInitialized = 1;

				var mobileMenu = {
					toggler: $el,
					wrapper: null,
					menu: null,
					height: null
				};

				mobileMenu.wrapper = mobileMenu.toggler.parents('.' + settings.classParentRow).find('.' + settings.classMenuWrapper);
				mobileMenu.menu = mobileMenu.wrapper.find('.' + settings.classMenu);

				mobileMenu.height = mobileMenu.menu.outerHeight();

				mobileMenu.toggler.click(function(){
					mobileMenu.wrapper.toggleClass(settings.classOpen);
					if(!mobileMenu.wrapper.hasClass(settings.classOpen)){
						mobileMenu.wrapper.height(0);
					} else {
						mobileMenu.wrapper.height(mobileMenu.height);
					}
				});

				mobileMenus.push(mobileMenu);

			});

		};

		return mobileMenus;
	}
	//endregion

});