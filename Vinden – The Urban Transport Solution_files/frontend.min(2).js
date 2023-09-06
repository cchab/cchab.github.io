( function( $ ) {
    
    /*@ Common start */
    var ee_common = {
        getModelCID: function getModelCID() {
            return ee_common.$element.data('model-cid');
        },
        getElementSettings : function( $element, setting ) {

            var elementSettings = {},
                modelCID        = $element.data( 'model-cid' );

            if ( elementorFrontend.isEditMode() && modelCID ) {
                var settings        = elementorFrontend.config.elements.data[ modelCID ],
                    settingsKeys    = elementorFrontend.config.elements.keys[ settings.attributes.widgetType || settings.attributes.elType ];
                jQuery.each( settings.getActiveControls(), function( controlKey ) {
                    if(settingsKeys){
                        if ( -1 !== settingsKeys.indexOf( controlKey ) ) {
                            elementSettings[ controlKey ] = settings.attributes[ controlKey ];
                        }
                    }
                } );
            } else {
                elementSettings = $element.data('settings') || {};
            }

            return ee_common.getItems( elementSettings, setting );
        },
        getItems : function (items, itemKey) {
            if (itemKey) {
                var keyStack = itemKey.split('.'),
                    currentKey = keyStack.splice(0, 1);

                if (!keyStack.length) {
                    return items[currentKey];
                }

                if (!items[currentKey]) {
                    return;
                }

                return ee_common.getItems(items[currentKey], keyStack.join('.'));
            }

            return items;
        },
        showLoading : function (current){
            current.find('.elementor_extensions_loading_overlay').show();
        },
        hideLoading : function(current){
            current.find('.elementor_extensions_loading_overlay').hide();
        },
        equalheight : function(t) {
            var e, i = 0,
                r = 0,
                h = new Array;
            jQuery(t).each(function() {
                if (e = jQuery(this), jQuery(e).height("auto"), topPostion = e.position().top, r != topPostion) {
                    for (currentDiv = 0; currentDiv < h.length; currentDiv++) h[currentDiv].height(i);
                    h.length = 0, r = topPostion, i = e.height(), h.push(e)
                } else h.push(e), i = i < e.height() ? e.height() : i;
                for (currentDiv = 0; currentDiv < h.length; currentDiv++) h[currentDiv].height(i)
            })
        },
        findObjectByKey : function( array, key, value ) {
            for ( var i = 0; i < array.length; i++ ) {
                if ( array[ i ][ key ] === value ) {
                    return array[ i ];
                }
            }
            return null;
        },
        debounce: function( threshold, callback ) {
            var timeout;

            return function debounced( $event ) {
                function delayed() {
                    callback.call( this, $event );
                    timeout = null;
                }

                if ( timeout ) {
                    clearTimeout( timeout );
                }

                timeout = setTimeout( delayed, threshold );
            };
        },
        getObjectNextKey: function( object, key ) {
            var keys      = Object.keys( object ),
                idIndex   = keys.indexOf( key ),
                nextIndex = idIndex += 1;

            if( nextIndex >= keys.length ) {
                return false;
            }

            var nextKey = keys[ nextIndex ];

            return nextKey;
        },
        getObjectPrevKey: function( object, key ) {
            var keys      = Object.keys( object ),
                idIndex   = keys.indexOf( key ),
                prevIndex = idIndex -= 1;

            if ( 0 > idIndex ) {
                return false;
            }

            var prevKey = keys[ prevIndex ];

            return prevKey;
        },
        getObjectFirstKey: function( object ) {
            return Object.keys( object )[0];
        },
        getObjectLastKey: function( object ) {
            return Object.keys( object )[ Object.keys( object ).length - 1 ];
        }
    }

    /*@ A to Z Listing */
    var ee_atoz = {

        atoz_fun : function( $scope, $ ) {
            
            ee_atoz.atoz_fun.elementSettings = ee_common.getElementSettings( $scope );
            
            var $listing_wrapper = $scope.find('.az-listing-container');

            ee_atoz.atoz_fun.init = function() {
                $listing_wrapper.find('.categories a').on('click', function(){
                    ee_common.showLoading($scope);
                    $listing_wrapper.find('.categories li').removeClass('active');
                    jQuery(this).parent('li').toggleClass('active');

                    var cat_data = jQuery(this).data('setting');
                    var widget_settings = $scope.data('settings');
                    jQuery.ajax({
                        url : ElementorExtensionsFrontendConfig.ajaxurl, 
                        type: 'POST',
                        data: { 
                            'action': 'getPostsByCategory',
                            'cat_data' : cat_data,
                            'widget_settings' : widget_settings
                        },
                        success: function(data){
                            jQuery('#listings').html(data);
                            ee_common.hideLoading($scope);
                        }
                    });
                });

                /*@ Smooth scrolling on click */

                $scope.find("ul.alphabets a").click(function(e) {
                    e.preventDefault();
                    var hash_id = jQuery(this).attr('href');
                    if(jQuery(hash_id).length){
                        jQuery('html, body').animate({
                            scrollTop: jQuery(hash_id).offset().top
                        }, 500);
                    }
                });

                if(window.location.hash) {
                    jQuery(window.location.hash).trigger('click');
                }
            };
        
            ee_atoz.atoz_fun.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-atoz-listing.default', ee_atoz.atoz_fun);
    });

    /*@ Anchor Scroll */
    var ee_anchor = {

        anchor_scroll_fun : function( $scope, $ ) {
            
            ee_anchor.anchor_scroll_fun.elementSettings = ee_common.getElementSettings( $scope );
            
            var $anchor_scroll = $scope.find('.anchor-scroll');

            ee_anchor.anchor_scroll_fun.init = function() {

                $anchor_scroll.anchorScroll({
                    scrollSpeed: 800,
                    offsetTop: 0,
                    scrollStart: function () { 
                      $anchor_scroll.find(".fill-bg").fadeIn( "slow" );
                      $anchor_scroll.find(".popup").text("Scrolling...");
                    },
                    scrollEnd: function () { 
                      $anchor_scroll.find(".fill-bg").delay(1000).fadeOut( "slow" );
                      $anchor_scroll.find(".popup").text("Done!");
                    }
                 });

            };
        
            ee_anchor.anchor_scroll_fun.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-anchor-scroll.default', ee_anchor.anchor_scroll_fun);
    });

    /*@ Document Library */
    var ee_document_library = {

        document_library_fun : function( $scope, $ ) {
            
            var ee_dl_settings = ee_common.getElementSettings( $scope ),
            $document_library = $scope.find('.document_library_wrapper '),
            is_sortable = ee_dl_settings.is_header_sortable,
            dl_tbl = $document_library.find('> table'),
            order_filename_asc = ee_dl_settings.order_filename_asc;

            ee_document_library.document_library_fun.init = function() {
                if(is_sortable === 'yes'){

                    var sort_list = (order_filename_asc === 'yes') ? [[0,0]] : '';
                    dl_tbl.tablesorter({
                        sortList : sort_list
                    });
                }
            };
            ee_document_library.document_library_fun.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-document-library.default', ee_document_library.document_library_fun);
    });

    /*@ Flipbox */
    var ee_mb_flipbox_with_slider = {
        onInit: function ($scope, $) {
           
            var carousel_elem = $scope.find('.elementor-slides').eq(0);
            if (carousel_elem.length > 0) {

                var elementSettings = ee_common.getElementSettings( $scope );
                    if(elementSettings){
                        var slickOptions = {
                            slidesToShow: 1,
                            slidesToScroll:1,
                            autoplay: 'yes' === elementSettings.autoplay,
                            autoplaySpeed: elementSettings.autoplay_speed,
                            infinite: 'yes' === elementSettings.infinite,
                            pauseOnHover: 'yes' === elementSettings.pause_on_hover,
                            speed: elementSettings.speed,
                            arrows: -1 !== ['arrows', 'both'].indexOf(elementSettings.navigation),
                            dots: -1 !== ['dots', 'both'].indexOf(elementSettings.navigation),
                            rtl: 'rtl' === elementSettings.direction,
                            fade: 'fade' === elementSettings.transition,
                        };
                    
                }
                carousel_elem.slick(slickOptions);

                var slideContent = '.elementor-slide-content',
                    animation = elementSettings.content_animation,
                    animated = 'animated';

                carousel_elem.on({
                    beforeChange: function beforeChange() {
                        var $sliderContent = carousel_elem.find(slideContent);
                        $sliderContent.removeClass(animated + ' ' + animation).hide();
                    },
                    afterChange: function afterChange(event, slick, currentSlide) {
                        var $currentSlide = jQuery(slick.$slides.get(currentSlide)).find(slideContent);
                        $currentSlide.show().addClass(animated + ' ' + animation);
                    }
                });

                /*@ On click of icon box flip the box */
                var frontbox = $scope.find('.ee_mb_flipbox_container .ee_mb_flipbox_front'),
                back_slider = $scope.find('.ee_mb_flipbox_container .elementor-slides-wrapper'),
                flip_container = $scope.find('.ee_mb_flipbox_container');

                $scope.find('.ee_mb_flipbox_container .ee_mb_flipbox_front ul li').on('click', function(){
                    /*@ Activate slider as per the frontbox icon index */
                    var li_index = $(this).index();
                    carousel_elem.slick('slickGoTo', li_index, true);

                    /*@ Assign slider height to container */
                    var slider_height = back_slider.height();
                    flip_container.height(slider_height);

                    /*@ Flip the frontbox to back-side */
                    frontbox.css({
                        '-webkit-transform':'rotateX(-180deg)',
                        '-moz-transform':'rotateX(-180deg)',
                        '-ms-transform':'rotateX(-180deg)',
                        '-o-transform':'rotateX(-180deg)',
                        'transform':'rotateX(-180deg)'
                    });

                    /*@ Flip the slider to front-side */
                    back_slider.css({
                        '-webkit-transform':'rotateX(0deg)',
                        '-moz-transform':'rotateX(0deg)',
                        '-ms-transform':'rotateX(0deg)',
                        '-o-transform':'rotateX(0deg)',
                        'transform':'rotateX(0deg)',
                        'overflow' : 'visible'
                    });

                    /*@ Add remove active class for maintaining active height to container on resize window */
                    frontbox.removeClass('active');
                    back_slider.addClass('active');
                });

                $scope.find('.ee_mb_flipbox_container .ee_mb_flip_back').on('click', function(){

                    /*@ Assign front height to container */
                    flip_container.attr('style','');
                    var front_height = frontbox.height();
                    flip_container.height(front_height);

                    /*@ Flip frontbox to front-side */
                    frontbox.css({
                        '-webkit-transform':'rotateX(0deg)',
                        '-moz-transform':'rotateX(0deg)',
                        '-ms-transform':'rotateX(0deg)',
                        '-o-transform':'rotateX(0deg)',
                        'transform':'rotateX(0deg)'
                    });

                    /*@ Flip the slider to back-side */
                    back_slider.css({
                        '-webkit-transform':'rotateX(180deg)',
                        '-moz-transform':'rotateX(180deg)',
                        '-ms-transform':'rotateX(180deg)',
                        '-o-transform':'rotateX(180deg)',
                        'transform':'rotateX(180deg)',
                        'overflow' : 'hidden'
                    });

                    /*@ Add remove active class for maintaining active height to container on resize window */
                    frontbox.addClass('active');
                    back_slider.removeClass('active');
                });

                /*@ On resize assign height of active front or back to the flip container */
                jQuery(window).resize(function(){

                    flip_container.attr('style','');
                    if(frontbox.hasClass('active')){
                        var front_height = frontbox.height();
                        flip_container.height(front_height);
                    }else{
                        var slider_height = back_slider.height();
                        flip_container.height(slider_height);
                    }
                });

            }
        }
    };
      
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-flipbox.default', ee_mb_flipbox_with_slider.onInit);
    });

    /*@ Imagebox Repeater */
    var ee_mb_imagebox_repeater = {

        onInit: function ($scope, $) {
          
            var carousel_elem = $scope.find('.elementor-image-carousel').eq(0);
            
            if (carousel_elem.length > 0) {
        
                var elementSettings = ee_common.getElementSettings($scope);
            
                    if(elementSettings){
                        var slidesToShow = +elementSettings.slides_to_show || 3,
                        isSingleSlide = 1 === slidesToShow,
                        defaultLGDevicesSlidesCount = isSingleSlide ? 1 : 2,
                        breakpoints = elementorFrontend.config.breakpoints;
                        
                    var slickOptions = {
                        slidesToShow: slidesToShow,
                        autoplay: 'yes' === elementSettings.autoplay,
                        autoplaySpeed: elementSettings.autoplay_speed,
                        infinite: 'yes' === elementSettings.infinite,
                        pauseOnHover: 'yes' === elementSettings.pause_on_hover,
                        speed: elementSettings.speed,
                        arrows: -1 !== ['arrows', 'both'].indexOf(elementSettings.navigation),
                        dots: -1 !== ['dots', 'both'].indexOf(elementSettings.navigation),
                        rtl: 'rtl' === elementSettings.direction,
                        responsive: [{
                            breakpoint: breakpoints.lg,
                            settings: {
                                slidesToShow: +elementSettings.slides_to_show_tablet || defaultLGDevicesSlidesCount,
                                slidesToScroll: +elementSettings.slides_to_scroll_tablet || defaultLGDevicesSlidesCount
                            }
                        }, {
                            breakpoint: breakpoints.md,
                            settings: {
                                slidesToShow: +elementSettings.slides_to_show_mobile || 1,
                                slidesToScroll: +elementSettings.slides_to_scroll_mobile || 1
                            }
                        }]
                    };
            
                    if (isSingleSlide) {
                        slickOptions.fade = 'fade' === elementSettings.effect;
                    } else {
                        slickOptions.slidesToScroll = +elementSettings.slides_to_scroll || defaultLGDevicesSlidesCount;
                    }
                }
                carousel_elem.slick(slickOptions);
            }
        }
    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-imagebox-repeater.default', ee_mb_imagebox_repeater.onInit);
    });

    /*@ Multipoint map */
    var ee_mb_google_map = {

        EeMbGoogleMap : function( $scope, $ ) {

            ee_mb_google_map.EeMbGoogleMap.elementSettings = ee_common.getElementSettings( $scope );

            var $map = $scope.find( '.ee-mb-google-map' );
           
            if ( ! $map.length ) return;

            var $pins       = $map.find( '.ee-mb-google-map__pin' ),
                $navigation = $scope.find( '.ee-mb-google-map__navigation' ),
                settings    = ee_mb_google_map.EeMbGoogleMap.elementSettings,
                gmapArgs    = {
                    center                  : [ 48.8583736, 2.2922873 ],

                    mapTypeId               : google.maps.MapTypeId[ settings.map_type ],
                    scrollwheel             : 'yes' === settings.scrollwheel,
                    clickableIcons          : 'yes' === settings.clickable_icons,
                    disableDoubleClickZoom  : 'yes' !== settings.doubleclick_zoom,
                    keyboardShortcuts       : 'yes' === settings.keyboard_shortcuts,
                    draggable               : ( ! elementorFrontend.isEditMode() && 'yes' === settings.draggable ),

                    fullscreenControl       : 'yes' === settings.fullscreen_control,
                    mapTypeControl          : 'yes' === settings.map_type_control,
                    rotateControl           : 'yes' === settings.rotate_control,
                    scaleControl            : 'yes' === settings.scale_control,
                    streetViewControl       : 'yes' === settings.streetview_control,
                    zoomControl             : 'yes' === settings.zoom_control,
                },
                polygonArgs = {
                    default : {
                        strokeColor     : ( settings.polygon_stroke_color ) ? settings.polygon_stroke_color : '#FF0000',
                        strokeWeight    : ( settings.polygon_stroke_weight ) ? settings.polygon_stroke_weight.size : 2,
                        strokeOpacity   : ( settings.polygon_stroke_opacity ) ? settings.polygon_stroke_opacity.size : 0.8,
                        fillColor       : ( settings.polygon_fill_color ) ? settings.polygon_fill_color : '#FF0000',
                        fillOpacity     : ( settings.polygon_fill_opacity ) ? settings.polygon_fill_opacity.size : 0.35,
                    },
                    hover : {
                        strokeColor     : ( settings.polygon_stroke_color_hover ) ? settings.polygon_stroke_color_hover : '#FF0000',
                        strokeWeight    : ( settings.polygon_stroke_weight_hover ) ? settings.polygon_stroke_weight_hover.size : 2,
                        strokeOpacity   : ( settings.polygon_stroke_opacity_hover ) ? settings.polygon_stroke_opacity_hover.size : 0.8,
                        fillColor       : ( settings.polygon_fill_color_hover ) ? settings.polygon_fill_color_hover : '#FF0000',
                        fillOpacity     : ( settings.polygon_fill_opacity_hover ) ? settings.polygon_fill_opacity_hover.size : 0.35,
                    }
                },
                markers     = [],
                paths       = [],
                instance    = null;

            ee_mb_google_map.EeMbGoogleMap.init = function() {

                var mapStyle = settings.map_style_json;

                if ( 'api' === settings.map_style_type && settings.map_style_api ) {
                    var jsonParse = JSON.parse( settings.map_style_api );

                    if ( jsonParse ) {
                        mapStyle = JSON.parse( settings.map_style_api ).json;
                    }
                }
                
                var map_color = $map.data('map-color');

                if(map_color == '00' && undefined !== map_color){
                    gmapArgs.styles = [
                        {elementType: 'geometry', stylers: [{color: settings.map_geometry }]},
                        {elementType: 'labels.text.stroke', stylers: [{color: settings.label_text_stroke }]},
                        {elementType: 'labels.text.fill', stylers: [{color: settings.label_text_fill }]},
                        {
                          featureType: 'administrative.locality',
                          elementType: 'labels.text.fill',
                          stylers: [{color: settings.administrative_locality }]
                        },
                        {
                            featureType: 'poi',
                            elementType: 'geometry',
                            stylers: [{color: settings.map_poi_color }]
                        },
                        {
                            featureType: 'poi',
                            elementType: 'labels.text.fill',
                            stylers: [{color: settings.map_poi_fill }]
                        },
                        {
                            featureType: 'poi.park',
                            elementType: 'geometry.fill',
                            stylers: [{color: settings.map_park_color }]
                        },
                        {
                            featureType: 'poi.park',
                            elementType: 'labels.text.fill',
                            stylers: [{color: settings.map_park_fill }]
                        },
                        {
                          featureType: 'water',
                          elementType: 'geometry',
                          stylers: [{color: settings.water_color }]
                        },
                        {
                          featureType: 'water',
                          elementType: 'labels.text.fill',
                          stylers: [{color: settings.water_text_fill }]
                        },
                        {
                          featureType: 'water',
                          elementType: 'labels.text.stroke',
                          stylers: [{color: settings.water_text_stroke }]
                        },
                        {
                          featureType: 'road',
                          elementType: 'geometry',
                          stylers: [{color: settings.road_color }]
                        },
                        {
                          featureType: 'road',
                          elementType: 'geometry.stroke',
                          stylers: [{color: settings.road_stroke }]
                        },
                        {
                          featureType: 'road.highway',
                          elementType: 'geometry',
                          stylers: [{color: settings.highway_color }]
                        },
                        {
                          featureType: 'road.highway',
                          elementType: 'geometry.stroke',
                          stylers: [{color: settings.highway_stroke }]
                        },
                        {
                          featureType: 'road.highway',
                          elementType: 'labels.text.fill',
                          stylers: [{color: settings.highway_text_fill }]
                        },
                        {
                          featureType: 'transit',
                          elementType: 'geometry',
                          stylers: [{color: settings.transit }]
                        },
                        {
                          featureType: 'transit.station',
                          elementType: 'labels.text.fill',
                          stylers: [{color: settings.transit_text_fill }]
                        },
                    ];
                }

                if ( '' !== $.trim( mapStyle ) && undefined !== mapStyle ) {
                    gmapArgs.styles = ee_mb_google_map.EeMbGoogleMap.parseStyles( mapStyle );
                }

                if ( 'yes' !== settings.fit ) {
                    if ( 'undefined' !== typeof settings.zoom ) {
                        gmapArgs.zoom = settings.zoom.size;
                    }

                    if ( $map.data('lat') && $map.data('lng') ) {
                        gmapArgs.center = [ $map.data('lat'), $map.data('lng') ];
                    }
                }

                instance = $map.gmap3( gmapArgs );

                ee_mb_google_map.EeMbGoogleMap.addPins();

                if ( 'yes' === settings.popups )
                    ee_mb_google_map.EeMbGoogleMap.addInfoWindows();

                if ( 'yes' === settings.route && $pins.length > 1 )
                    ee_mb_google_map.EeMbGoogleMap.addRoute();

                if ( 'yes' === settings.polygon )
                    ee_mb_google_map.EeMbGoogleMap.addPolygon();

                if ( 'yes' === settings.navigation )
                    ee_mb_google_map.EeMbGoogleMap.navigation();

                /* Init events */
                ee_mb_google_map.EeMbGoogleMap.events();

                /* Center to fit or custom */
                ee_mb_google_map.EeMbGoogleMap.center();
            };

            ee_mb_google_map.EeMbGoogleMap.events = function() {
                $map._resize( ee_mb_google_map.EeMbGoogleMap.onResize );
            };

            ee_mb_google_map.EeMbGoogleMap.onResize = function() {
                ee_mb_google_map.EeMbGoogleMap.center();
            };

            ee_mb_google_map.EeMbGoogleMap.center = function() {
                if ( 'yes' === settings.fit ) {
                    instance.wait(2000).fit();
                } else {
                    instance.get(0).setCenter( new google.maps.LatLng( gmapArgs.center[0], gmapArgs.center[1] ) );
                }
            };

            ee_mb_google_map.EeMbGoogleMap.parseStyles = function( style ) {

                try {
                    var json = JSON.parse( style );

                    if ( json && typeof json === "object") { return json; }
                }
                catch ( e ) {
                    alert( 'Invalid JSON' );
                }

                return false;
            };

            ee_mb_google_map.EeMbGoogleMap.addPolygon = function() {

                if ( $pins.length <= 1 )
                    return;

                instance
                    .polygon( {
                        strokeColor     : polygonArgs.default.strokeColor,
                        strokeWeight    : polygonArgs.default.strokeWeight,
                        strokeOpacity   : polygonArgs.default.strokeOpacity,
                        fillColor       : polygonArgs.default.fillColor,
                        fillOpacity     : polygonArgs.default.fillOpacity,
                        paths           : paths,
                    } )
                    .on({
                        mouseover: function ( polygon, event ) {
                            polygon.setOptions( {
                                strokeColor     : polygonArgs.hover.strokeColor,
                                strokeWeight    : polygonArgs.hover.strokeWeight,
                                strokeOpacity   : polygonArgs.hover.strokeOpacity,
                                fillColor       : polygonArgs.hover.fillColor,
                                fillOpacity     : polygonArgs.hover.fillOpacity,
                            } );
                        },
                        mouseout: function ( polygon, event ) {
                            polygon.setOptions( {
                                strokeColor     : polygonArgs.default.strokeColor,
                                strokeWeight    : polygonArgs.default.strokeWeight,
                                strokeOpacity   : polygonArgs.default.strokeOpacity,
                                fillColor       : polygonArgs.default.fillColor,
                                fillOpacity     : polygonArgs.default.fillOpacity,
                            } );
                        }
                    });
            };

            ee_mb_google_map.EeMbGoogleMap.addPins = function() {
                if ( ! $pins.length )
                    return;

                $pins.each( function() {
                    var marker = {},
                        pin = {
                            id          : $(this).data('id'),
                            input       : $(this).data('input'),
                            lat         : $(this).data('lat'),
                            lng         : $(this).data('lng'),
                            trigger     : $(this).data('trigger'),
                            icon        : $(this).data('icon'),
                            label       : $(this).data('label'),
                            label_color : $(this).data('label-color'),
                            content     : $(this).html(),
                        };

                    if ( ! pin.lat || ! pin.lng ) {
                        return;
                    }

                    marker.id       = pin.id;
                    marker.trigger  = pin.trigger;
                    marker.position = [ pin.lat, pin.lng ];

                    paths.push( marker.position );

                    if ( pin.icon ) {
                        var iconSize = ( settings.pin_size ) ? settings.pin_size.size : 50,
                            iconPosition = ee_mb_google_map.EeMbGoogleMap.getIconPosition( iconSize );
                            
                        marker.icon = {
                            url         : pin.icon,
                            scaledSize  : new google.maps.Size( iconSize, iconSize ),
                            origin      : new google.maps.Point( 0, 0 ),
                            anchor      : new google.maps.Point( iconPosition[0], iconPosition[1] ),
                        };

                        if(pin.label){
                            marker.icon.labelOrigin = new google.maps.Point(iconPosition[0], (iconPosition[1] + 10));
                        }

                    }else{

                        if(pin.label){
                            
                            marker.icon = {
                                url: "http://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
                                labelOrigin: new google.maps.Point(15, 55),
                                size: new google.maps.Size(30,45),
                                anchor: new google.maps.Point(16,32)
                            };
                        }
                    }

                    if(pin.label){

                        var markerLabel = pin.label;
                        var maplabelcolor = (pin.label_color) ? pin.label_color : '#FF0000';

                        marker.label = {
                            text: markerLabel,
                            color: maplabelcolor,
                            fontSize: "20px",
                            fontWeight: "bold"
                        };
                    }

                    
                    if ( pin.content && settings.popups )
                        marker.content = pin.content;

                    markers.push( marker );
                });

                instance.marker( markers );
            };

            ee_mb_google_map.EeMbGoogleMap.getIconPosition = function( size ) {
                var horiz = 25,
                    vert = 50;

                switch ( settings.pin_position_horizontal ) {
                    case 'left' :
                        horiz = size;
                        break;
                    case 'center' :
                        horiz = size / 2;
                        break;
                    case 'right' :
                        horiz = 0;
                        break;
                    default :
                        horiz = size / 2;
                }

                switch ( settings.pin_position_vertical ) {
                    case 'top' :
                        vert = size;
                        break;
                    case 'middle' :
                        vert = size / 2;
                        break;
                    case 'bottom' :
                        vert = 0;
                        break;
                    default :
                        vert = size;
                }

                return [ horiz, vert ];
            };

            ee_mb_google_map.EeMbGoogleMap.addInfoWindows = function() {
                if ( ! $pins.length )
                    return;

                instance
                    .infowindow( markers )
                    .then( function( infowindow ) {

                        var map = this.get(0),
                            marker = this.get(1);

                        marker.forEach( function( pin, index ) {

                            if ( 'auto' === pin.trigger ) {
                                infowindow[ index ].open( map, pin );

                                pin.addListener( 'click', function() {
                                    infowindow[ index ].open( map, pin );
                                });
                            } else if ( 'mouseover' === pin.trigger ) {
                                pin.addListener( 'mouseover', function() {
                                    infowindow[ index ].open( map, pin );
                                });
                                pin.addListener( 'mouseout', function() {
                                    infowindow[ index ].close( map, pin );
                                });
                            } else if ( 'click' === pin.trigger ) {
                                pin.addListener( 'click', function() {
                                    infowindow[ index ].open( map, pin );
                                });
                            }
                        })
                    });
            };

            ee_mb_google_map.EeMbGoogleMap.addRoute = function() {

                if ( $pins.length <= 1 )
                    return;

                var points = markers.slice(),
                    origin = ee_mb_google_map.EeMbGoogleMap.getMarkerDataForRoutes( markers[0] ),
                    destination = ee_mb_google_map.EeMbGoogleMap.getMarkerDataForRoutes( markers[ markers.length - 1 ] ),
                    waypoints = ( markers.length >= 3 ) ? ee_mb_google_map.EeMbGoogleMap.getWaypoints( points ) : null; 

                instance
                    .route({
                        origin : origin,
                        destination : destination,
                        waypoints : waypoints,
                        travelMode : google.maps.DirectionsTravelMode.DRIVING
                    })
                    .directionsrenderer( function( results ) {
                        if ( results ) {
                            return {
                                suppressMarkers: 'yes' !== settings.route_markers,
                                directions: results,
                            }
                        }
                    });
            };

            ee_mb_google_map.EeMbGoogleMap.getWaypoints = function( points ) {
                var waypoints = [];

                /* Remove first and last markers */
                points.shift();
                points.pop();

                points.forEach( function( point, index ) {
                    waypoints.push( {
                        location : ee_mb_google_map.EeMbGoogleMap.getMarkerDataForRoutes( point ),
                        stopover : true,
                    } );
                } );

                return waypoints;
            };

            ee_mb_google_map.EeMbGoogleMap.getMarkerDataForRoutes = function( marker ) {
                return new google.maps.LatLng( marker.position[0], marker.position[1] );
            };

            ee_mb_google_map.EeMbGoogleMap.navigation = function() {
                var $items  = $navigation.find( '.ee-mb-google-map__navigation__item' ),
                    $all    = $items.filter( '.ee-mb-google-map__navigation__item--all' );

                $all.addClass( 'ee--is-active' );

                $items.on( 'click', function( e ) {
                    e.preventDefault();
                    e.stopPropagation();

                    $items.removeClass( 'ee--is-active' );
                    $(this).addClass( 'ee--is-active' );

                    var marker = ee_common.findObjectByKey( markers, 'id', $(this).data('id') );

                    if ( marker ) {
                        instance.get(0).setCenter( new google.maps.LatLng( marker.position[0], marker.position[1] ) );
                        instance.get(0).setZoom( 18 );
                    } else {
                        instance.fit();
                    }
                });
            };

            ee_mb_google_map.EeMbGoogleMap.init();
        },
    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/ee-mb-google-map.default', ee_mb_google_map.EeMbGoogleMap );
    });

    /*@ Navigation Menu */
    var ee_nav_menu = {

        ee_navigation_menu_fun : function( $scope, $ ) {

            ee_nav_menu.ee_navigation_menu_fun.elementSettings = ee_common.getElementSettings( $scope );
            var $scroll_hamburger = $scope.find('.scroll_hamburger'),
                windowWidth = jQuery(window).width();

            ee_nav_menu.ee_navigation_menu_fun.init = function() {
                
                if(ee_nav_menu.ee_navigation_menu_fun.elementSettings.layout == 'scroll_hamburger'){
                    if($scroll_hamburger.length > 0){

                        var sticky_menu = $scroll_hamburger.parents('section');
                        sticky_menu.parent().append('<div class="hamburger_icon_wrapper">'+
                            '<div class="arrow_for_scroll">'+
                            '<i class="fa fa-bars"></i>'+
                            '</div>'+
                        '</div>');
                    
                        var toggleed = false;
                        $('.arrow_for_scroll').click(function(e) {
                            e.preventDefault();
                            if (sticky_menu.is(':visible')) {
                                sticky_menu.stop().slideUp();
                            } else {
                                sticky_menu.stop().slideDown();
                            }
                            toggleed = true;
                            setTimeout(function() {
                                toggleed = false;
                            }, 500);
                        });
                    
                        $(window).bind('scroll', function() {
                            if ($(window).width() > 900) {
                                if (!toggleed) {
                                    if ($(window).scrollTop() > 50) {
                                        $('.arrow_for_scroll').fadeIn();
                                        sticky_menu.slideUp();
                                        if(!jQuery(document).find('.elementor-location-header').hasClass('hamburger_fixed_header')){
                                            jQuery(document).find('.elementor-location-header').next().css('padding-top',jQuery('.elementor-location-header').outerHeight());
                                            jQuery(document).find('.elementor-location-header').addClass('hamburger_fixed_header');
                                        }
                                    } else {
                                        $('.arrow_for_scroll').fadeOut();
                                        sticky_menu.slideDown();
                                        if(jQuery(document).find('.elementor-location-header').hasClass('hamburger_fixed_header')){
                                            jQuery(document).find('.elementor-location-header').next().css('padding-top','0px');
                                            jQuery(document).find('.elementor-location-header').removeClass('hamburger_fixed_header');  
                                        }
                                    }
                                }
                            } 
                        });
                    }else{
                        jQuery(document).find('.hamburger_icon_wrapper').remove();
                    }
                }else{
                    if(jQuery(document).find('.scroll_hamburger').length == 0){
                        jQuery(document).find('.hamburger_icon_wrapper').remove();
                    }
                }

                var forEach=function(t,o,r){if("[object Object]"===Object.prototype.toString.call(t))for(var c in t)Object.prototype.hasOwnProperty.call(t,c)&&o.call(r,t[c],c,t);else for(var e=0,l=t.length;l>e;e++)o.call(r,t[e],e,t)};

                var hamburgers = document.querySelectorAll(".hamburger");
                if (hamburgers.length > 0) {
                  forEach(hamburgers, function(hamburger) {
                    hamburger.addEventListener("click", function() {
                      this.classList.toggle("is-active");
                    }, false);
                  });
                }
             
                /*@ If outside click then close the hamburger & sidebar */
                jQuery(document).click(function(e) {
                    if (!jQuery(e.target).is('.hamburger')) {
                        jQuery(document).find('.sidebar').fadeOut('slow');
                        jQuery(document).find('.hamburger').removeClass('is-active');
                    }

                    if(windowWidth <= 1024){
                        if (!jQuery(e.target).is('.ee-mb-megamenu-wrapper .menu-item .elementor-item') && !jQuery(e.target).is('.ee-mb-megamenu-wrapper .btn_menu_back')) {
                            jQuery(document).find('.ee-mb-megamenu-wrapper .ee-mb-nav-shortcode').hide();
                            jQuery(document).find('.ee-mb-megamenu-wrapper .menu-item').removeClass('uparrow');
                        }
                    }
                });

                jQuery(document).on('click', '.hamburger', function(e) {
                    jQuery(this).siblings('.ee-mb-sidebar-menu-wrapper').find(".sidebar").toggle("slide");
                    e.preventDefault();
                    return false;
                });

                if(windowWidth <= 1024){
                    jQuery(document).on('click', '.ee-mb-megamenu-wrapper .menu-item', function() {
                        jQuery(document).find('.ee-mb-megamenu-wrapper .ee-mb-nav-shortcode').hide();
                        jQuery(this).find('.ee-mb-nav-shortcode').slideToggle();
                        jQuery(this).toggleClass('uparrow');
                    });
                }
            };
        
            ee_nav_menu.ee_navigation_menu_fun.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/nav-menu.default', ee_nav_menu.ee_navigation_menu_fun);
    });

    /*@ Event Slider */
    var ee_mb_event_slider = {

        onInit: function ($scope, $) {
          
            var carousel_elem = $scope.find('.elementor-image-carousel').eq(0);
            
            if (carousel_elem.length > 0) {
        
                var elementSettings = ee_common.getElementSettings($scope);
            
                    if(elementSettings){
                        var slidesToShow = +elementSettings.slides_to_show || 3,
                        slideRows = +elementSettings.slides_rows || 1,
                        isSingleSlide = 1 === slidesToShow,
                        defaultLGDevicesSlidesCount = isSingleSlide ? 1 : 2,
                        breakpoints = elementorFrontend.config.breakpoints;
                       
                    var slickOptions = {
                        slidesToShow: slidesToShow,
                        rows: slideRows,
                        autoplay: 'yes' === elementSettings.autoplay,
                        autoplaySpeed: elementSettings.autoplay_speed,
                        infinite: 'yes' === elementSettings.infinite,
                        pauseOnHover: 'yes' === elementSettings.pause_on_hover,
                        speed: elementSettings.speed,
                        arrows: -1 !== ['arrows', 'both'].indexOf(elementSettings.navigation),
                        dots: -1 !== ['dots', 'both'].indexOf(elementSettings.navigation),
                        rtl: 'rtl' === elementSettings.direction,
                        responsive: [{
                            breakpoint: breakpoints.lg,
                            settings: {
                                slidesToShow: +elementSettings.slides_to_show_tablet || defaultLGDevicesSlidesCount,
                                slidesToScroll: +elementSettings.slides_to_scroll_tablet || defaultLGDevicesSlidesCount,
                            }
                        }, {
                            breakpoint: breakpoints.md,
                            settings: {
                                slidesToShow: +elementSettings.slides_to_show_mobile || 1,
                                slidesToScroll: +elementSettings.slides_to_scroll_mobile || 1,
                            }
                        }]
                    };

                    if (isSingleSlide) {
                        slickOptions.fade = 'fade' === elementSettings.effect;
                    } else {
                        slickOptions.slidesToScroll = +elementSettings.slides_to_scroll || defaultLGDevicesSlidesCount;
                    }
                }
                carousel_elem.slick(slickOptions);


                carousel_elem.on('setPosition', function () {
                    ee_common.equalheight('.elementor-widget-event-slider .slick-track > .slick-slide.es_event_slider');
                });
                
            }
        }
    };

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-event-slider.default', ee_mb_event_slider.onInit);
    });
            
    jQuery(window).load(function() {
        ee_common.equalheight('.elementor-widget-event-slider .slick-track > .slick-slide.es_event_slider');
    });
      
    jQuery(window).resize(function(){
        ee_common.equalheight('.elementor-widget-event-slider .slick-track > .slick-slide.es_event_slider');
    });

    /*@ Google Map */
    var ee_mb_map = {

        ee_mb_map_fun : function( $scope, $ ) {

            ee_mb_map.ee_mb_map_fun.init = function() {
                var elementSettings = ee_common.getElementSettings( $scope );

                if(!elementSettings.address){
                    return false;
                }

                var maptype = elementSettings.map_type;

                if(maptype == 'ROADMAP'){

                    var styledMapType = new google.maps.StyledMapType(
                        [
                            {elementType: 'geometry', stylers: [{color: elementSettings.map_geometry }]},
                            {elementType: 'labels.text.stroke', stylers: [{color: elementSettings.label_text_stroke }]},
                            {elementType: 'labels.text.fill', stylers: [{color: elementSettings.label_text_fill }]},
                            {
                              featureType: 'administrative.locality',
                              elementType: 'labels.text.fill',
                              stylers: [{color: elementSettings.administrative_locality }]
                            },
                            {
                                featureType: 'poi',
                                elementType: 'geometry',
                                stylers: [{color: elementSettings.map_poi_color }]
                            },
                            {
                                featureType: 'poi',
                                elementType: 'labels.text.fill',
                                stylers: [{color: elementSettings.map_poi_fill }]
                            },
                            {
                                featureType: 'poi.park',
                                elementType: 'geometry.fill',
                                stylers: [{color: elementSettings.map_park_color }]
                            },
                            {
                                featureType: 'poi.park',
                                elementType: 'labels.text.fill',
                                stylers: [{color: elementSettings.map_park_fill }]
                            },
                            {
                              featureType: 'water',
                              elementType: 'geometry',
                              stylers: [{color: elementSettings.water_color }]
                            },
                            {
                              featureType: 'water',
                              elementType: 'labels.text.fill',
                              stylers: [{color: elementSettings.water_text_fill }]
                            },
                            {
                              featureType: 'water',
                              elementType: 'labels.text.stroke',
                              stylers: [{color: elementSettings.water_text_stroke }]
                            },
                            {
                              featureType: 'road',
                              elementType: 'geometry',
                              stylers: [{color: elementSettings.road_color }]
                            },
                            {
                              featureType: 'road',
                              elementType: 'geometry.stroke',
                              stylers: [{color: elementSettings.road_stroke }]
                            },
                            {
                              featureType: 'road.highway',
                              elementType: 'geometry',
                              stylers: [{color: elementSettings.highway_color }]
                            },
                            {
                              featureType: 'road.highway',
                              elementType: 'geometry.stroke',
                              stylers: [{color: elementSettings.highway_stroke }]
                            },
                            {
                              featureType: 'road.highway',
                              elementType: 'labels.text.fill',
                              stylers: [{color: elementSettings.highway_text_fill }]
                            },
                            {
                              featureType: 'transit',
                              elementType: 'geometry',
                              stylers: [{color: elementSettings.transit }]
                            },
                            {
                              featureType: 'transit.station',
                              elementType: 'labels.text.fill',
                              stylers: [{color: elementSettings.transit_text_fill }]
                            },
                        ],
                        {name: 'Styled Map'}
                    );
                }
                    
                var gstrh = 'cooperative';
                var scrollval = true;
                var defscroll = elementSettings.prevent_scroll;
                if(defscroll == 'yes'){
                    gstrh = 'none';
                    scrollval = false;
                }
                            
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: (elementSettings.zoom.size) ? elementSettings.zoom.size : 10,
                    mapTypeId:google.maps.MapTypeId[ maptype ], 
                    scrollwheel: scrollval,
                    gestureHandling: gstrh,
                    zoomControl: scrollval
                });

                var geocoder = new google.maps.Geocoder();
                ee_mb_map.geocodeAddress(geocoder, map, elementSettings);
                
                /* Associate the styled map with the MapTypeId and set it to display. */
                if(maptype == 'ROADMAP'){
                    map.mapTypes.set('styled_map', styledMapType);
                    map.setMapTypeId('styled_map'); 
                }
                
            };

            ee_mb_map.ee_mb_map_fun.init();
        },
        geocodeAddress : function(geocoder, resultsMap, elementSettings) {
            var address = elementSettings.address;
            geocoder.geocode({'address': address}, function(results, status) {
                if (status === 'OK') {
                    resultsMap.setCenter(results[0].geometry.location);
                    var markerLabel = (elementSettings.map_markerlabel) ? elementSettings.map_markerlabel : '';
                    var maplabelcolor = (elementSettings.map_markerlabel_color) ? elementSettings.map_markerlabel_color : '';
                    if(markerLabel == "" || markerLabel.length == 0){ markerLabel = ' '; }
                    if(maplabelcolor == "" || maplabelcolor.length == 0){ maplabelcolor = '#ff0000'; }
                    
                    var marker = new google.maps.Marker({
                        map: resultsMap,
                        position: results[0].geometry.location,
                        icon: {
                            url: "//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
                            labelOrigin: new google.maps.Point(15, 55),
                            size: new google.maps.Size(30,45),
                            anchor: new google.maps.Point(16,32)
                        },
                        label: {
                            text: markerLabel,
                            color: maplabelcolor,
                            fontSize: "20px",
                            fontWeight: "bold"
                        }
                    }); 
                } else {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-map.default', ee_mb_map.ee_mb_map_fun);
    });

    /*@ Google Calendar */
    var ee_mb_gcal = {
        ee_mb_gcal_fun : function( $scope, $ ) {

            ee_mb_gcal.ee_mb_gcal_fun.init = function() {

                var elementSettings = ee_common.getElementSettings( $scope ),
                    gcal = $scope.find('.ee-mb-google-calendar'),
                    cal_uid = gcal.data('cal-uid'),
                    cal_api_key = gcal.data('cal-api-key'),
                    cal_layout = elementSettings.cal_layout_type,
                    cal_id = elementSettings.cal_id,
                    eventsdata = [],
                    i = 0;

                if(!cal_api_key && !cal_id){
                    return false;
                }

                if(cal_layout == 'grid'){

                    var calendarEl = document.getElementById('calendar-'+cal_uid);

                    var calendar = new FullCalendar.Calendar(calendarEl, {
                        plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list', 'googleCalendar' ],
                        header: {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'month,agendaWeek,agendaDay'
                        },
                        googleCalendarApiKey: cal_api_key,
                        events: {
                            googleCalendarId: cal_id
                        },
                        eventRender: function(event, element) {
                            if(eventsdata.length == 0){
                                eventsdata.push(event.title);
                                i++;
                            }else{
                                var tmp = eventsdata.indexOf(event.title);
                                if(tmp == -1){
                                    eventsdata.push(event.title);
                                    i++;
                                }
                            }

                            if(typeof element !== 'undefined'){
                                element.addClass("custom-event-"+eventsdata.indexOf(event.title));
                            }
                        },
                    });

                    calendar.render();

                }else{
                    
                    var calendarEl = document.getElementById('calendar-'+cal_uid);

                    var calendar = new FullCalendar.Calendar(calendarEl, {
                        plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list', 'googleCalendar' ],
                        defaultView: 'listWeek',
                        views: {
                          listDay: { buttonText: 'list day' },
                          listWeek: { buttonText: 'list week' },
                          listMonth: { buttonText: 'list month' }
                        },
                        header: {
                          left: 'title',
                          center: '',
                          right: 'listDay,listWeek,listMonth'
                        },
                        googleCalendarApiKey: cal_api_key,
                        events: {
                            googleCalendarId: cal_id
                        }
                    }); 

                    calendar.render();
                }
            }
            ee_mb_gcal.ee_mb_gcal_fun.init();
        }
    }
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-google-calendar.default', ee_mb_gcal.ee_mb_gcal_fun);
    });

    /*@ Member */
    var ee_mb_member = {

        ee_mb_member_fun : function( $scope, $ ) {

            ee_mb_member.ee_mb_member_fun.init = function() {
                var elementSettings = ee_common.getElementSettings( $scope );

                jQuery('.ee_mb_drp_member').on('change', function(){
                        
                    var sorting_by = $scope.find('#drp_sorting').val(),
                    industry = $scope.find('#drp_industrial_sector').val(),
                    status = $scope.find('#drp_status').val()
                    params = { sortby:sorting_by, statusby:status, industry: industry },
                    new_url = jQuery.param( params );

                    window.location.search = new_url;
                });

                var sortby = 'sortby',
                filterby = 'statusby',
                url = window.location.href

                if(url.indexOf('?' + sortby + '=') != -1 || url.indexOf('?' + filterby + '=') != -1){
                    jQuery('html, body').animate({
                        scrollTop: jQuery('#members_wrapper').offset().top - 40
                      }, 1200);    
                }
            }

            ee_mb_member.ee_mb_member_fun.init();
        }
    }
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-member.default', ee_mb_member.ee_mb_member_fun);
    });

    /*@ Events */
    var ee_mb_events = {

        ee_mb_events_fun : function( $scope, $ ) {

            ee_mb_events.ee_mb_events_fun.init = function() {

                var elementSettings = ee_common.getElementSettings( $scope ),
                ajaxurl = ElementorExtensionsFrontendConfig.ajaxurl;
    
                jQuery(document).on('click','.myeventon_summary_eventlist_wrapper .summary_filter a',function(e){
                    e.preventDefault();
                    var current = jQuery(this);
                    ee_common.showLoading($scope);
                    var data_month = jQuery(this).attr('data-month');
                    var data_year = jQuery(this).attr('data-year'); 

                    var sumarry_wrapper = current.parents('.myeventon_summary_eventlist_wrapper'),
                    sumarry_filter = sumarry_wrapper.find('> .summary_filter'),
                    enable_event_detail = sumarry_filter.data('event-detail'),
                    disable_event_link = sumarry_filter.data('disable-link'),
                    event_date_layout = sumarry_filter.data('date-layout'),
                    event_limit =  sumarry_filter.data('event-limit'),
                    event_offset =  sumarry_filter.data('event-offset'),
                    hide_past_events =  sumarry_filter.data('hide-past-events');

                    var d = new Date();
                   
                    if(!data_year){
                        var data_year = sumarry_wrapper.find('.summary_filter > .year_filter_wrapper a.current').attr('data-year');
                    }else{
                        sumarry_wrapper.find('> .summary_filter > .year_filter_wrapper a').removeClass('current');
                    }

                    if(!data_month){
                        var data_month = sumarry_wrapper.find('.summary_filter > .month_filter_wrapper > a.current').attr('data-month');
                    }else{
                        sumarry_wrapper.find('> .summary_filter > .month_filter_wrapper a').removeClass('current');
                    }
                    
                    jQuery(this).addClass('current');

                    jQuery.ajax({
                        url:ajaxurl,
                        data:{
                            'action': 'getSummaryListAjax',
                            'month' : data_month,
                            'year' : data_year,
                            'event_date_layout' : event_date_layout,
                            'cat' : '',
                            'limit' : event_limit,
                            'offset' : event_offset,
                            'enable_event_detail' : enable_event_detail,
                            'disable_link' : disable_event_link,
                            'hide_past_events' : hide_past_events,
                        },
                        method:'POST',
                        success:function(data) {
                            sumarry_wrapper.find('.summaryEventList').html(data).append('<div class="elementor_extensions_loading_overlay"><div class="elementor_extensions_loader"></div></div>');
                            ee_common.hideLoading($scope);
                        },
                        error: function(errorThrown){
                            console.log(errorThrown);
                            ee_common.hideLoading($scope);
                        }
                    });    
                });
                
                /*@Next Prev button click*/
                jQuery(document).on('click','#summary_prev,#summary_next',function(){
                    var current = jQuery(this);
                    ee_common.showLoading($scope);

                    var sumarry_wrapper = current.parents('.myeventon_summary_eventlist_wrapper'),
                    sumarry_filter = sumarry_wrapper.find('> .summary_filter'),
                    event_limit =  sumarry_filter.data('event-limit'),
                    event_offset =  sumarry_filter.data('event-offset')
                    month_year = current.data('date'),
                    event_date_layout = current.data('date-layout'),
                    enable_event_detail = current.data('event-detail'),
                    disable_event_link = current.data('disable-link'),
                    hide_past_events = current.data('hide-past-events'),
                    splited = month_year.split('-');
                   
                    jQuery.ajax({
                        url:ajaxurl,
                        data:{
                            'action': 'getSummaryListAjax',
                            'month_year' : month_year,
                            'event_date_layout' : event_date_layout,
                            'enable_event_detail' : enable_event_detail,
                            'disable_link' : disable_event_link,
                            'hide_past_events' : hide_past_events,
                            'limit' : event_limit,
                            'offset' : event_offset,
                        },
                        method:'POST',
                        success:function(data) {
                            jQuery('.myeventon_summary_eventlist_wrapper > .summary_filter  a').removeClass('current');
                            jQuery('.myeventon_summary_eventlist_wrapper > .summary_filter > .year_filter_wrapper a[data-year="'+splited[0]+'"]').addClass('current');
                            jQuery('.myeventon_summary_eventlist_wrapper > .summary_filter > .month_filter_wrapper a[data-month="'+splited[1]+'"]').addClass('current');
                            current.parents('.summaryEventList').html(data).append('<div class="elementor_extensions_loading_overlay"><div class="elementor_extensions_loader"></div></div>');
                            ee_common.hideLoading($scope);
                        },
                        error: function(errorThrown){
                            console.log(errorThrown);
                            ee_common.hideLoading($scope);
                        }
                    }); 
                });

                /*@Show more button click*/
                jQuery(document).on('click','.myeventon_summary_eventlist_wrapper .summaryEventList .show_more_events',function(){
                    var current = jQuery(this);
                    ee_common.showLoading($scope);

                    var sumarry_wrapper = current.parents('.myeventon_summary_eventlist_wrapper'),
                    sumarry_filter = sumarry_wrapper.find('> .summary_filter'),
                    data_year = sumarry_wrapper.find('.summary_filter > .year_filter_wrapper a.current').attr('data-year'),
                    data_month = sumarry_wrapper.find('.summary_filter > .month_filter_wrapper > a.current').attr('data-month'),
                    event_date_layout = sumarry_filter.data('date-layout'),
                    enable_event_detail = sumarry_filter.data('event-detail'),
                    disable_event_link = sumarry_filter.data('disable-link'),
                    hide_past_events = sumarry_filter.data('hide-past-events'),
                    event_offset = parseInt(jQuery(document).find('#hd_offset').val()),
                    event_limit =  sumarry_filter.data('event-limit'),
                    show_future_events = sumarry_filter.data('future-events');

                    /*@ Determine first click */
                    if(current.hasClass('clicked')){
                        event_offset = parseInt(jQuery(document).find('#hd_limit_offset').val());
                    }else{
                        current.addClass('clicked');
                        event_offset = event_limit + event_offset;
                    }

                    jQuery.ajax({
                        url:ajaxurl,
                        data:{
                            'action': 'getSummaryListAjax',
                            'month' : data_month,
                            'year' : data_year,
                            'limit' : '-1',
                            'offset' : event_offset,
                            'event_date_layout' : event_date_layout,
                            'enable_event_detail' : enable_event_detail,
                            'disable_link' : disable_event_link,
                            'hide_past_events' : hide_past_events,
                            'show_future_events' : (show_future_events) ? show_future_events : '',
                        },
                        method:'POST',
                        success:function(data) {
                            current.parents('.summaryEventList').html(data).append('<div class="elementor_extensions_loading_overlay"><div class="elementor_extensions_loader"></div></div>');
                            jQuery(document).find('#hd_offset').val(event_offset);
                            ee_common.hideLoading($scope);
                        },
                        error: function(errorThrown){
                            console.log(errorThrown);
                            ee_common.hideLoading($scope);
                        }
                    }); 
                });

                /*@ Calendar view*/
                var calendar_wrapper_div = jQuery( "div.myeventon_calendar" );
                if(calendar_wrapper_div.length > 0)
                {
                    calendar_wrapper_div.each(function () {
                        var calendar_id = jQuery(this).attr('data-id');
                        var event_list = jQuery(this).data('caldata');
                        var disable_link = jQuery(this).data('disable-link');

                        var calendarEl = document.getElementById('calendar-'+calendar_id);

                        var calendar = new FullCalendar.Calendar(calendarEl, {
                            plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list' ],
                            header: {
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                            },
                            events: event_list,
                            eventRender: function(event, element) {
                                if(typeof element !== 'undefined'){
                                    element.addClass("custom-event");
                                }
                            },
                            eventClick: function(arg) {
                                var clicked_date = arg.event.start;
                                clicked_date = moment(clicked_date).format("YYYY-MM-DD");

                                var current = jQuery(arg.el);
                                jQuery.ajax({
                                    url:ajaxurl,
                                    data:{
                                        'action': 'getEventListByDay',
                                        'date' : clicked_date,
                                        'disable_link' : disable_link
                                    },
                                    method:'POST',
                                    success:function(data) {
                                        current.parents('.myeventon_calendar').siblings('.myeventon_calendar_summaryview').html(data);
                                    },
                                    error: function(errorThrown){
                                    }
                                }); 
                              },
                            dayClick: function(arg) {
                                var clicked_date = arg.event.start;
                                clicked_date = moment(clicked_date).format("YYYY-MM-DD");

                                var current = jQuery(arg.el);
                                jQuery.ajax({
                                    url:ajaxurl,
                                    data:{
                                        'action': 'getEventListByDay',
                                        'date' : clicked_date,
                                        'disable_link' : disable_link,
                                    },
                                    method:'POST',
                                    success:function(data) {
                                        current.parents('.myeventon_calendar').siblings('.myeventon_calendar_summaryview').html(data);
                                    },
                                    error: function(errorThrown){
                                    }
                                }); 
                              }
                        });

                        calendar.render();
                    });
                }

                /*@ Display - Hide summary description no click of event label */
                jQuery(document).on('click','.myeventon_calendar_summaryview li,.summaryEventList li',function(e){
                    jQuery(this).next('.summary_cal_description').slideToggle();
                    e.preventDefault();
                });
            }
            ee_mb_events.ee_mb_events_fun.init();
        }
    }
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-events.default', ee_mb_events.ee_mb_events_fun);
    });

    /*@ Property Search */
    var ee_mb_property_search = {
        
        ee_mb_property_search_fun : function( $scope, $ ) {

            ee_mb_property_search.ee_mb_property_search_fun.init = function() {

                if (typeof google === 'object' && typeof google.maps === 'object'){
                  function ee_mb_property_search_box_autocomplete() {
                    
                      var elementSettings = ee_common.getElementSettings( $scope ),
                      input = document.getElementById('ee_mb_property_txt'),
                      data_setting = $scope.find('.ee_mb_homepage_searchbox_form').data('settings');

                      if(input){
                        var options = {
                          types: ['geocode']
                        };

                        if(data_setting.country_restriction){
                            options.componentRestrictions = {country: data_setting.country_restriction};
                        }

                        var autocomplete = new google.maps.places.Autocomplete(input, options);
                        
                        /** 
                         * Get lat long and add it into the hidden text boxes
                         */
                        google.maps.event.addDomListener(input, 'keydown', function(event) { 
                          if (event.keyCode === 13) { 
                              event.preventDefault(); 
                          }else{
                            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                                var place = autocomplete.getPlace();
                        
                                var lat = place.geometry.location.lat();
                                var lng = place.geometry.location.lng();
                        
                                document.getElementById("ee_mb_property_lat").value = lat;
                                document.getElementById("ee_mb_property_long").value = lng;
                            });
                          }
                        }); 
                      }
                  }
                  
                  google.maps.event.addDomListener(window, 'load', ee_mb_property_search_box_autocomplete);
                }

            }
            ee_mb_property_search.ee_mb_property_search_fun.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-property-search.default', ee_mb_property_search.ee_mb_property_search_fun);
    });

    var ee_mb_properties = {

        fun: function ($scope, $) {

            elementSettings = ee_common.getElementSettings($scope);

            var $listing_wrapper = $scope.find('.ee_mb_property_listing_wrapper');
            var $data_setting = $scope.find('.ee_mb_property_search_page_outer_wrapper').data('settings');

            ee_mb_properties.fun.init = function () {
                ee_mb_properties.fun.addPropertyPageClassInBody();
                ee_mb_properties.fun.get();
                ee_mb_properties.fun.getviews();
                ee_mb_properties.fun.addPromiximityRangeSlider();
                ee_mb_properties.fun.changeEvents();
                if (typeof google === 'object' && typeof google.maps === 'object') {
                    google.maps.event.addDomListener(window, 'load', ee_mb_properties.fun.addAutocompleteLocation());
                }
            };

            ee_mb_properties.fun.get = function () {
                ee_mb_properties.fun.showLoading();
                var ajaxurl = ElementorExtensionsFrontendConfig.ajaxurl;
                var view = ee_mb_properties.fun.getUrlParameter('view');

                jQuery('#ee_mb_property_listing').html('');
                jQuery('#property_pagination').html('');
                jQuery('#search_result').text('');
 
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        'action': 'eeMbPropertySearchAjax',
                        'location': ee_mb_properties.fun.getUrlParameter('location'),
                        'radius': ee_mb_properties.fun.getUrlParameter('radius'),
                        'lat': ee_mb_properties.fun.getUrlParameter('lat'),
                        'long': ee_mb_properties.fun.getUrlParameter('long'),
                        'max': ee_mb_properties.fun.getUrlParameter('max'),
                        'min': ee_mb_properties.fun.getUrlParameter('min'),
                        'room': ee_mb_properties.fun.getUrlParameter('room'),
                        'property_type': ee_mb_properties.fun.getUrlParameter('property_type'),
                        'view': view,
                        'price_sort': ee_mb_properties.fun.getUrlParameter('price_sort'),
                        'paged': ee_mb_properties.fun.getUrlParameter('pagination'),
                        'default_sort': elementSettings.default_sort,
                        'post_per_page': elementSettings.post_per_page,
                    },
                    method: 'POST',
                    success: function (data) {

                        if (data.results || data.results == '0') {
                            jQuery('#search_result').html(data.results);
                        }

                        if (data.results && data.results !== '0') {
                            if (view == 'map') {

                                jQuery('#ee_mb_property_listing').html('<div id="propertymap"></div>');

                                var locations = data.map_properties;

                                var map = new google.maps.Map(document.getElementById('propertymap'), {
                                    zoom: 10,
                                    center: new google.maps.LatLng(locations[0][1], locations[0][2]),
                                    mapTypeId: google.maps.MapTypeId.ROADMAP
                                });

                                var infowindow = new google.maps.InfoWindow();
                                var marker, i, content = "";

                                for (i = 0; i < locations.length; i++) {
                                    var latlng = new google.maps.LatLng(locations[i][1], locations[i][2]);
                                    marker = new google.maps.Marker({
                                        position: latlng,
                                        map: map,
                                        icon: ElementorExtensionsFrontendConfig.ee_mb_path + "assets/img/map-pin.png"
                                    });

                                    var property_img = locations[i][6],
                                        title = locations[i][0],
                                        price = locations[i][3],
                                        bedrooms = locations[i][4],
                                        type = locations[i][5],
                                        listed_on = locations[i][7],
                                        prop_url = locations[i][8];

                                    content = "<div class='map_info_wrapper'><a href=" + prop_url + "><div class='img_wrapper'><img src=" + property_img + "></div>" +
                                        "<div class='property_content_wrap'>" +
                                        "<div class='property_title'>" +
                                        "<span>" + title + "</span>" +
                                        "</div>" +

                                        "<div class='property_price'>" +
                                        "<span>" + price + "</span>" +
                                        "</div>" +

                                        "<div class='property_bed_type'>" +
                                        "<span>" + bedrooms + " beds</span>" +
                                        "<ul><li>" + type + "</li></ul>" +
                                        "</div>" +

                                        "<div class='property_listed_date'>" +
                                        "<span>Listed on " + listed_on + "</span>" +
                                        "</div>" +
                                        "<div class='btn_visit_marker'><span>View more</span></div>"
                                    "</div></a></div>";

                                    google.maps.event.addListener(marker, 'click', (function (marker, content, i) {
                                        return function () {
                                            infowindow.setContent(content);
                                            infowindow.open(map, marker);
                                        }
                                    })(marker, content, i));
                                }

                            } else {
                                jQuery.each(data.property, function (index, value) {
                                    jQuery('#ee_mb_property_listing').append(value);
                                });
                                jQuery('#property_pagination').html(data.next_pagination);
                            }
                        }

                        ee_mb_properties.fun.hideLoading();
                    },
                    error: function (errorThrown) {}
                });
            };

            ee_mb_properties.fun.addPropertyPageClassInBody = function () {
                jQuery(document).find('body').addClass('property-search-page');
            };

            ee_mb_properties.fun.addPromiximityRangeSlider = function () {
                var slider = document.getElementById("promiximity_range");

                if(slider){
                    var output = document.getElementById("txt_miles");
                    output.innerHTML = slider.value + ' miles'; /* Display the default slider value */

                    /* Update the current slider value (each time you drag the slider handle) */
                    slider.oninput = function () {
                        output.innerHTML = this.value + ' miles';
                    }
                }
            };

            ee_mb_properties.fun.addAutocompleteLocation = function () {

                    var input = document.getElementById('ee_mb_property_txt');

                    if (input) {
                        var options = {
                            types: ['geocode']
                        };

                        if($data_setting.country_restriction){
                            options.componentRestrictions = {country: $data_setting.country_restriction};
                        }

                        var autocomplete = new google.maps.places.Autocomplete(input, options);

                        /** 
                         * Get lat long and add it into the hidden text boxes
                         */
                        google.maps.event.addListener(autocomplete, 'place_changed', function () {
                            var place = autocomplete.getPlace();

                            var current_add = jQuery('#ee_mb_property_txt').val();

                            var lat = place.geometry.location.lat();
                            var lng = place.geometry.location.lng();

                            document.getElementById("ee_mb_property_lat").value = lat;
                            document.getElementById("ee_mb_property_long").value = lng;

                            var newurl = ee_mb_properties.fun.replaceUrlParam('location', encodeURIComponent(current_add));
                            history.pushState(null, null, newurl);

                            var newurl = ee_mb_properties.fun.replaceUrlParam('lat', lat);
                            history.pushState(null, null, newurl);

                            var newurl = ee_mb_properties.fun.replaceUrlParam('long', lng);
                            history.pushState(null, null, newurl);
                        });
                    }
                };

            ee_mb_properties.fun.getUrlParameter = function (name) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            };

            ee_mb_properties.fun.changeEvents = function () {
                jQuery("#drp_min_price").on('change', function () {
                    var newurl = ee_mb_properties.fun.replaceUrlParam('min', jQuery(this).val());
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });

                jQuery("#drp_max_price").on('change', function () {
                    var newurl = ee_mb_properties.fun.replaceUrlParam('max', jQuery(this).val());
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });

                jQuery("#drp_bedrooms").on('change', function () {
                    var newurl = ee_mb_properties.fun.replaceUrlParam('room', jQuery(this).val());
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });

                jQuery("#drp_property_type").on('change', function () {
                    var newurl = ee_mb_properties.fun.replaceUrlParam('property_type', jQuery(this).val());
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });

                jQuery("#promiximity_range").on('change', function () {
                    var newurl = ee_mb_properties.fun.replaceUrlParam('radius', jQuery(this).val());
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });

                jQuery("#price_sort").on('change', function () {
                    var newurl = ee_mb_properties.fun.replaceUrlParam('price_sort', jQuery(this).val());
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });

                jQuery("#btn_property_search").on('click', function () {
                    ee_mb_properties.fun.get();
                });

                jQuery(document).on('click', '.page-numbers', function (e) {
                    e.preventDefault();
                    var pagination_link = jQuery(this).attr('href');
                    paged = pagination_link.split('?');
                    paged = paged[1].split('=');
                    var newurl = ee_mb_properties.fun.replaceUrlParam('pagination', paged[1]);
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });
            };

            ee_mb_properties.fun.replaceUrlParam = function (paramName, paramValue) {
                var url = window.location.href;
                if (paramValue == null) {
                    paramValue = '';
                }
                var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
                if (url.search(pattern) >= 0) {
                    return url.replace(pattern, '$1' + paramValue + '$2');
                }
                url = url.replace(/[?#]$/, '');
                return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
            };

            ee_mb_properties.fun.showLoading = function () {
                jQuery(document).find('.elementor_ee_mb_loading_overlay.property_search').show();
            };

            ee_mb_properties.fun.hideLoading = function () {
                jQuery(document).find('.elementor_ee_mb_loading_overlay.property_search').hide();
            };

            ee_mb_properties.fun.getviews = function () {
                jQuery('#btn_view_group li').on('click', function () {
                    var view = jQuery(this).data('view');

                    if (view == 'list') {
                        jQuery('#ee_mb_property_listing').removeClass('grid');
                        jQuery('#ee_mb_property_listing').removeClass('map');
                        jQuery('#ee_mb_property_listing').addClass('list');
                    } else if (view == 'grid') {
                        jQuery('#ee_mb_property_listing').addClass('grid');
                        jQuery('#ee_mb_property_listing').removeClass('list');
                        jQuery('#ee_mb_property_listing').removeClass('map');
                    } else if (view == 'map') {
                        jQuery('#ee_mb_property_listing').removeClass('grid');
                        jQuery('#ee_mb_property_listing').removeClass('list');
                        jQuery('#ee_mb_property_listing').addClass('map');
                    }

                    jQuery('#btn_view_group li').removeClass('active');
                    jQuery(this).addClass('active');
                    var newurl = ee_mb_properties.fun.replaceUrlParam('view', view);
                    history.pushState(null, null, newurl);
                    ee_mb_properties.fun.get();
                });
            };

            ee_mb_properties.fun.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-properties.default', ee_mb_properties.fun);
    });

    /*@ Scroll navigation */
     var eeMbScrollNavigation = function( $scope, $ ) {
        var $target         = $scope.find( '.ee-mb-scroll-navigation' ),
            instance        = null,
            settings        = $target.data( 'settings' );

        instance = new ee_mb_scroll_navigation( $target, settings );
        instance.init();
    };

    window.ee_mb_scroll_navigation = function( $selector, settings ) {
        var self            = this,
            $window         = $( window ),
            $document       = $( document ),
            $instance       = $selector,
            $htmlBody       = $( 'html, body' ),
            $itemsList      = $( '.ee-mb-scroll-navigation__item', $instance ),
            sectionList     = [],
            defaultSettings = {
                speed: 500,
                blockSpeed: 500,
                offset: 200,
                sectionSwitch: false
            },
            settings        = $.extend( {}, defaultSettings, settings ),
            sections        = {},
            currentSection  = null,
            isScrolling     = false,
            isSwipe         = false,
            hash            = window.location.hash.slice(1),
            timeout         = null,
            timeStamp       = 0,
            platform        = navigator.platform;

        jQuery.extend( jQuery.easing, {
            easeInOutCirc: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
            }
        });

        self.init = function() {
            self.setSectionsData();

            $itemsList.on( 'click.ee_mb_scroll_navigation', self.onAnchorChange );

            $window.on( 'scroll.ee_mb_scroll_navigation', self.onScroll );
            $window.on( 'resize.ee_mb_scroll_navigation orientationchange.ee_mb_scroll_navigation', ee_common.debounce( 50, self.onResize ) );
            $window.on( 'load', function() { self.setSectionsData(); } );
            $instance.parents('.elementor-column').css('min-height','auto');
            $document.keydown( function( event ) {

                if ( 38 == event.keyCode ) {
                    self.directionSwitch( event, 'up' );
                }

                if ( 40 == event.keyCode ) {
                    self.directionSwitch( event, 'down' );
                }
            } );

            if ( settings.sectionSwitch ) {
                if ( 'onwheel' in window ) {
                }
                $document.on( 'mousewheel.ee_mb_scroll_navigation DOMMouseScroll.ee_mb_scroll_navigation', self.onWheel );
            }

            if ( hash && sections.hasOwnProperty( hash ) ) {
                $itemsList.addClass( 'invert' );
            }

            for ( var section in sections ) {
                var $section = sections[section].selector;

                elementorFrontend.waypoint( $section, function( direction ) {
                    var $this = $( this ),
                        sectionId = $this.attr( 'id' );

                        if ( 'down' === direction && ! isScrolling && ! isSwipe ) {
                            window.history.pushState( null, null, '#' + sectionId );
                            currentSection = sectionId;
                            $itemsList.removeClass( 'active' );
                            $( '[data-anchor=' + sectionId + ']', $instance ).addClass( 'active' );

                            $itemsList.removeClass( 'invert' );

                            if ( sections[sectionId].invert ) {
                                $itemsList.addClass( 'invert' );
                            }
                        }
                }, {
                    offset: '95%',
                    triggerOnce: false
                } );

                elementorFrontend.waypoint( $section, function( direction ) {
                    var $this = $( this ),
                        sectionId = $this.attr( 'id' );

                        if ( 'up' === direction && ! isScrolling && ! isSwipe ) {
                            window.history.pushState( null, null, '#' + sectionId );
                            currentSection = sectionId;
                            $itemsList.removeClass( 'active' );
                            $( '[data-anchor=' + sectionId + ']', $instance ).addClass( 'active' );

                            $itemsList.removeClass( 'invert' );

                            if ( sections[sectionId].invert ) {
                                $itemsList.addClass( 'invert' );
                            }
                        }
                }, {
                    offset: '0%',
                    triggerOnce: false
                } );
            }
        };

        self.onAnchorChange = function( event ) {
            var $this     = $( this ),
                sectionId = $this.data('anchor'),
                offset    = null;

            if ( ! sections.hasOwnProperty( sectionId ) ) {
                return false;
            }

            offset = sections[sectionId].offset - settings.offset;

            if ( ! isScrolling ) {
                isScrolling = true;
                window.history.pushState( null, null, '#' + sectionId );
                currentSection = sectionId;

                $itemsList.removeClass( 'active' );
                $this.addClass( 'active' );

                $itemsList.removeClass( 'invert' );

                if ( sections[sectionId].invert ) {
                    $itemsList.addClass( 'invert' );
                }

                $htmlBody.stop().clearQueue().animate( { 'scrollTop': offset }, settings.speed, 'easeInOutCirc', function() {
                    isScrolling = false;
                } );
            }
        };

        self.directionSwitch = function( event, direction ) {
            var direction = direction || 'up',
                sectionId,
                nextItem = $( '[data-anchor=' + currentSection + ']', $instance ).next(),
                prevItem = $( '[data-anchor=' + currentSection + ']', $instance ).prev();

            if ( isScrolling ) {
                return false;
            }

            if ( 'up' === direction ) {
                if ( prevItem[0] ) {
                    prevItem.trigger( 'click.ee_mb_scroll_navigation' );
                }
            }

            if ( 'down' === direction ) {
                if ( nextItem[0] ) {
                    nextItem.trigger( 'click.ee_mb_scroll_navigation' );
                }
            }
        };

        self.onScroll = function( event ) { 
            if ( isScrolling || isSwipe ) {
                event.preventDefault();
            }
        };

        self.onWheel = function( event ) {

            if ( isScrolling || isSwipe ) {
                event.preventDefault();
                return false;
            }

            var $target         = $( event.target ),
                $section        = $target.closest( '.elementor-top-section' ),
                sectionId       = $section.attr( 'id' ),
                offset          = 0,
                newSectionId    = false,
                prevSectionId   = false,
                nextSectionId   = false,
                delta           = event.originalEvent.wheelDelta || -event.originalEvent.detail,
                direction       = ( 0 < delta ) ? 'up' : 'down',
                windowScrollTop = $window.scrollTop();

            if ( self.beforeCheck() ) {
                sectionId = ee_common.getObjectFirstKey( sections );
            }

            if ( self.afterCheck() ) {
                sectionId = ee_common.getObjectLastKey( sections );
            }

            if ( sectionId && sections.hasOwnProperty( sectionId ) ) {

                prevSectionId = ee_common.getObjectPrevKey( sections, sectionId );
                nextSectionId = ee_common.getObjectNextKey( sections, sectionId );

                if ( 'up' === direction ) {
                    if ( ! nextSectionId && sections[sectionId].offset < windowScrollTop ) {
                        newSectionId = sectionId;
                    } else {
                        newSectionId = prevSectionId;
                    }
                }

                if ( 'down' === direction ) {
                    if ( ! prevSectionId && sections[sectionId].offset > windowScrollTop + 5 ) {
                        newSectionId = sectionId;
                    } else {
                        newSectionId = nextSectionId;
                    }
                }

                if ( newSectionId ) {

                    if ( event.timeStamp - timeStamp > 10 && 'MacIntel' == platform ) {
                        timeStamp = event.timeStamp;
                        event.preventDefault();
                        return false;
                    }

                    event.preventDefault();

                    offset = sections[newSectionId].offset - settings.offset;
                    window.history.pushState( null, null, '#' + newSectionId );
                    currentSection = newSectionId;

                    $itemsList.removeClass( 'active' );
                    $( '[data-anchor=' + newSectionId + ']', $instance ).addClass( 'active' );

                    $itemsList.removeClass( 'invert' );

                    if ( sections[newSectionId].invert ) {
                        $itemsList.addClass( 'invert' );
                    }

                    isScrolling = true;
                    self.scrollStop();
                    $htmlBody.animate( { 'scrollTop': offset }, settings.blockSpeed, 'easeInOutCirc', function() {
                        isScrolling = false;
                    } );
                }
            }

        };

        self.setSectionsData = function() {
            $itemsList.each( function() {
                var $this         = $( this ),
                    sectionId     = $this.data('anchor'),
                    sectionInvert = 'yes' === $this.data('invert') ? true : false,
                    $section      = $( '#' + sectionId );

                $section.addClass( 'ee-mb-scroll-navigation-section' );
                $section.attr( { 'touch-action': 'none'} );

                if ( $section[0] ) {
                    sections[ sectionId ] = {
                        selector: $section,
                        offset: Math.round( $section.offset().top ),
                        height: $section.outerHeight(),
                        invert: sectionInvert
                    };
                }
            } );
        };

        self.beforeCheck = function( event ) {
            var windowScrollTop = $window.scrollTop(),
                firstSectionId = ee_common.getObjectFirstKey( sections ),
                offset = sections[ firstSectionId ].offset,
                topBorder = windowScrollTop + $window.outerHeight();

            if ( topBorder > offset ) {
                return false;
            }

            return true;
        };

        self.afterCheck = function( event ) {
            var windowScrollTop = $window.scrollTop(),
                lastSectionId = ee_common.getObjectLastKey( sections ),
                offset = sections[ lastSectionId ].offset,
                bottomBorder = sections[ lastSectionId ].offset + sections[ lastSectionId ].height;

            if ( windowScrollTop < bottomBorder ) {
                return false;
            }

            return true;
        };

        self.onResize = function( event ) {
            self.setSectionsData();
        };

        self.scrollStop = function() {
            $htmlBody.stop( true );
        };

        self.mobileAndTabletcheck = function() {
            var check = false;

            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);

            return check;
        };

    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-scroll-navigation.default', eeMbScrollNavigation);
    });

     /*@ Table */
    var ee_mb_table = {
        ee_table : function( $scope, $ ) {
            
            ee_mb_table.ee_table.elementSettings = ee_common.getElementSettings( $scope );
        
            var $table              = $scope.find('table.ele-site-table'),
                sortableInstance    = $table.data('tablesorter');
        
            ee_mb_table.ee_table.init = function() {
                
                if ( 'scrollable' == ee_mb_table.ee_table.elementSettings.scrollable ) {
                    $scope.css('overflow-x','auto');
                }
                
                if ( 'yes' == ee_mb_table.ee_table.elementSettings.sortable ) {
                    $table.tablesorter({
                        cssHeader   : 'ele-site-table__sort',
                        cssAsc      : 'ele-site-table__sort--up',
                        cssDesc     : 'ele-site-table__sort--down',
                    });
                } else {
                    $table.removeData('tablesorter');
                }
            };
        
            ee_mb_table.ee_table.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-table.default', ee_mb_table.ee_table);
    });

    /*@ Testimonial Swiper */
    var ee_testimonial_swiper = {
        getDefaultSettings: function getDefaultSettings() {
            return {
                selectors: {
                    mainSwiper: '.elementor-main-swiper',
                    swiperSlide: '.swiper-slide'
                },
                slidesPerView: {
                    desktop: 3,
                    tablet: 2,
                    mobile: 1
                }
            };
        },
        ee_testi_fun : function( $scope, $ ) {
          
            var elementSettings = ee_common.getElementSettings( $scope );

            if ('progress' === elementSettings.pagination) {
                elementSettings.pagination = 'progressbar';
            }

            var swiperOptions = {
                grabCursor: true,
                initialSlide: 1,
                slidesPerView: (elementSettings.slides_per_view) ? elementSettings.slides_per_view : 1,
                slidesPerGroup: (elementSettings.slides_to_scroll) ? elementSettings.slides_to_scroll : 1,
                spaceBetween: (elementSettings.space_between.size) ? elementSettings.space_between.size : 10,
                loop: 'yes' === elementSettings.loop,
                speed: elementSettings.speed,
                effect: "slide",
            };

            if (elementSettings.show_arrows) {
                swiperOptions.navigation = {
                    prevEl: '.elementor-swiper-button-prev',
                    nextEl: '.elementor-swiper-button-next'
                };
            }

            if (elementSettings.pagination) {
                swiperOptions.pagination = {
                    el: '.swiper-pagination',
                    type: elementSettings.pagination,
                    clickable: true
                };
            }

            if (elementSettings.autoplay) {
                swiperOptions.autoplay = {
                    delay: elementSettings.autoplay_speed,
                    disableOnInteraction: !!elementSettings.pause_on_interaction
                };
            }

            swiperOptions.breakpoints = {
                767: {
                    slidesPerGroup: (elementSettings.slides_to_scroll_mobile) ? elementSettings.slides_to_scroll_mobile : 1,
                    slidesPerView: (elementSettings.slides_per_view_mobile) ? elementSettings.slides_per_view_mobile : 1,
                    spaceBetween: (elementSettings.space_between_mobile.size) ? elementSettings.space_between_mobile.size : 10,
                },
                1024: {
                    slidesPerGroup: (elementSettings.slides_to_scroll_tablet) ? elementSettings.slides_to_scroll_tablet : 1,
                    slidesPerView: (elementSettings.slides_per_view_tablet) ? elementSettings.slides_per_view_tablet : 1,
                    spaceBetween: (elementSettings.space_between_tablet.size) ? elementSettings.space_between_tablet.size : 10,
                }
            };

            var $slider_wrapper = $scope.find('.elementor-main-swiper');

            ee_testimonial_swiper.ee_testi_fun.init = function() {
                 new Swiper($slider_wrapper, swiperOptions);
            };

            /*@ Change the height of image as per content */
            $slider_wrapper.find('.elementor-testimonial__content').each(function(){
                var tallness = jQuery(this).outerHeight();
                jQuery(this).siblings('.elementor-testimonial__footer').height(tallness);
            });

            jQuery(window).resize(function(){
                $slider_wrapper.find('.elementor-testimonial__content').each(function(){
                    var tallness = jQuery(this).outerHeight();
                    jQuery(this).siblings('.elementor-testimonial__footer').height(tallness);
                });
            });
        
            ee_testimonial_swiper.ee_testi_fun.init();
        }
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/ee-mb-testimonial-swiper.default', ee_testimonial_swiper.ee_testi_fun);
    });
     
} )( jQuery );


jQuery( document ).ready(function() {
  jQuery('#ee_mb_cookie_close_btn').click(function() {
      jQuery('#ee_mb_cookie_msg').slideUp();
      /* Set cookie */
      cookieHelper.create('accepted', true);
  });
});

jQuery(function () {
  /* If cookie hasnt reveioly been accepted, show banner */
  if( !cookieHelper.read('accepted') ) {
      jQuery('#ee_mb_cookie_msg').slideDown();
  }
});

/* Cookies set inside object */
var cookieHelper = {
  /* Cookies */
  create: function (name, value, days) {
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          var expires = "; expires=" + date.toGMTString();
      }
      else var expires = "";

      document.cookie = name + "=" + value + expires + "; path=/";
  },

  read: function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
  },

  erase: function(name) {
      createCookie(name, "", -1);
  }
}