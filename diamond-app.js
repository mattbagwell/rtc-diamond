/* 

JS for a web-based app to provide users with real-time quotes for diamonds.

View the whole thing at http://www.rothschildtrading.com/diamond-calculator-buying-guide


Module Overview:

aspects -   Properties of the diamond such as color, clarity, carat size, etc.
            These include the current value as well as the available range/limits/options

events -    Bindings for when diamond aspects change
            So we can update the visualizer and any other dependent options

basic initialization to set up the UI elements and events

*/

(function ($, Drupal, window, document, undefined) {
    'use strict';

    var DiamondApp = {
        caratCutOffSmall: 0.17,      // diamond size below which minimal options will be shown
        caratCutOff: 0.69,           // diamond size above which extra option panels will be shown

        shape: {
            options: ['Round', 'Princess',  'Emerald', 'Radiant', 'Asscher', 'Pear', 'Oval', 'Heart', 'Marquise'],
            current: 'Round'
        },

        carat: {
            min: 0.01,
            max: 5,
            steps: ['.01', '5.0'],
            step: 0.01,
            current: 1.0,
            old: 1.0,
            value: 1.0,
            slide: function(event, ui){
                DiamondApp.carat.current = ui.value;
                var $slider = $(event.target);

            // keep bottom of tooltip at same height

                event.pageY = $slider.find('.ui-slider-handle').offset().top;

            // display carat size above slider

                var $tooltip = $slider.prev('.slider-tooltip');
                $tooltip.position({ my: 'bottom', at: 'center top', of: event}).html(DiamondApp.carat.current.toFixed(2));

                DiamondApp.updateCarat();
            },
            afterInit: function($el, arg1){
            // minor spacing adjustments
                $el.find('.slider-tooltip').html(arg1.toFixed(2)).css({'left':'-210px', 'top': '-3.6px', 'position':'relative'});
            }
        },

        color: {
            min: 0,
            max: 9,
            steps: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
            step: 1,
            current: 5,
            slide: function(event, ui){
                DiamondApp.color.current = ui.value;
                DiamondApp.updateVisualizer();
            }
        },

        cut: {
            min: 0,
            max: 4,
            steps: ['Excellent', 'Very Good', 'Good', 'Poor', 'N/A'].reverse(),
            step: 1,
            current: 0,
            slide: function(event, ui){
                DiamondApp.cut.current = ui.value;
            }
        },

        clarity: {
            min: 0,
            max: 9,
            steps: ['IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'],
            step: 1,
            current: 4,
            slide: function(event, ui){
                DiamondApp.clarity.current = ui.value;
                DiamondApp.updateVisualizer();
            }
        },

        color_med: {
            min: 0,
            max: 2,
            steps: [ 'G - D<br>(colorless)', 'K - H<br>(near colorless)', 'N - L<br>(colored)'],
            step: 1,
            current: null,
            slide: function(event, ui){
                DiamondApp.color.current = ui.value;
                DiamondApp.updateVisualizer('medium');
            }
        },

        clarity_med: {
            min: 0,
            max: 2,
            steps: ['I<br>(included)', 'SI<br>(slightly included)', 'VS<br>(very slightly included)'].reverse(),
            step: 1,
            current: 0,
            slide: function(event, ui){
                DiamondApp.clarity.current = ui.value;
                DiamondApp.updateVisualizer('medium');
            }
        },

        quality_small: {
            min: 0,
            max: 2,
            steps: ['Mixed', 'Low', 'High'],
            step: 1,
            current: 0,
            slide: function(event, ui){
                DiamondApp.quality_small.current = ui.value;
                DiamondApp.updateVisualizer('small');
            }
        },

        adv: {
            fluorescence:   {   options: ['N/A', 'Faint', 'Medium', 'Strong', 'Very Strong']    },
            laser_drilled:  {   options: ['N/A', 'Yes'] },
            brown_tint:     {   options: ['N/A', 'Yes'] },
            fracture_filled:{   options: ['N/A', 'Yes'] },
            inclusion_type: {   options: ['N/A', 'Black Center', 'White Off Center']    }
        },

        updateCarat: function(){
            var app = this;

            // change which panels are visible at carat breakpoints

            if(app.carat.current <= app.caratCutOffSmall){                // small diamonds

                $('.app-field-wrapper, .field-label').filter('.show-small:hidden').fadeIn();
                $('.app-field-wrapper, .field-label, .field-more-info').filter(':visible').not('.show-small').fadeOut()
                    .find('.arrow-right').removeClass('down').addClass('right');
                DiamondApp.updateVisualizer('small');

            }else if(app.carat.current <= app.caratCutOff){                // medium diamonds

                $('.app-field-wrapper, .field-label').filter('.show-med:hidden').fadeIn();
                $('.app-field-wrapper, .field-label, .field-more-info').filter(':visible').not('.show-med').fadeOut()
                    .find('.arrow-right').removeClass('down').addClass('right');
                DiamondApp.updateVisualizer('medium');

            // only re-initialize sliders and values if we are crossing into a new carat range

                if(app.carat.old > app.caratCutOff){
                    $('#rtc-color-slider, #rtc-clarity-slider').removeClass('lg-slider-bg');
                    $('#rtc-color-slider, #rtc-clarity-slider').addClass('med-slider-bg');
                    app.initializeSlider(app.color_med, $('#rtc-color'));
                    app.initializeSlider(app.clarity_med, $('#rtc-clarity'));

                    app.color.current = 0;
                    app.clarity.current = 0;
                }

            }else if(app.carat.current > app.caratCutOff){                // large diamonds

                $('.app-field-wrapper, .field-label').filter('.show-large:hidden').fadeIn();
                $('.app-field-wrapper, .field-label, .field-more-info').filter(':visible').not('.show-large').fadeOut()
                    .find('.arrow-right').removeClass('down').addClass('right');

                DiamondApp.updateVisualizer();

            // only re-initialize sliders and values if we are crossing into a new carat range

                if(app.carat.old <= app.caratCutOff){
                    $('#rtc-color-slider, #rtc-clarity-slider').removeClass('med-slider-bg');
                    $('#rtc-color-slider, #rtc-clarity-slider').addClass('lg-slider-bg');
                    
                    app.initializeSlider(app.color, $('#rtc-color'));
                    app.initializeSlider(app.clarity, $('#rtc-clarity'));

                    app.color.current = 0;
                    app.clarity.current = 0;
                }
            }
            app.carat.old = app.carat.current;
        },

        updateVisualizer: function(size){
            var app = this;
            var color, clarity, carat = app.carat.current.toFixed(2);

            var color_scale = 1;            // scale the size and opacity of the visualizer graphics
            var clarity_scale = 1;
            var bgScale = 50;
            var bgScaleClarity = 100;

            var reg = new RegExp("(.*)<br>");
            var color_orig = app.color_med.steps[app.color.current];
            var clarity_orig = app.clarity_med.steps[app.clarity.current];

            // no diamond size has been selected yet - set visualizer defaults

            if(typeof size === 'undefined'){

                color = app.color.steps[app.color.current];
                clarity = app.clarity.steps[app.clarity.current];

                color_scale = (app.color.current / app.color.max);
                clarity_scale = (app.clarity.current / app.clarity.max);

            }else if(size === 'medium'){

            // strip extra text out of color and clarity slider values
            // before displaying in visualizer

                color = reg.exec(color_orig);
                clarity = reg.exec(clarity_orig);

            // fall back to original value if this fails, so we have something to display

                color = (color === null) ? color_orig : color[1];
                clarity = (clarity === null) ? clarity_orig : clarity[1];

                color_scale = (app.color.current / app.color_med.max);
                clarity_scale = (app.clarity.current / app.clarity_med.max);

            }else if(size === 'small'){
                color = 'N/A';
                clarity = 'N/A';
                color_scale = 0.5;
                clarity_scale = 0.5;
            }

        // map to a percentage scale of 14 - 77% (this will keep the background image at a nice size)

            bgScale = ((app.carat.current / app.carat.max) * 63) + 14;
            bgScaleClarity = bgScale - 14;

            $('#visualizer .shape-overlay').css({'backgroundSize': bgScale+'%'});

            $('#visualizer .clarity-overlay').css({ 'backgroundSize': bgScaleClarity+'%',
                                                    'opacity'       : clarity_scale});

            $('#visualizer .color-overlay').css({   'backgroundSize': bgScale+'%',
                                                    'opacity'       : color_scale});

            $('#visualizer .carat .val').html(carat);
            $('#visualizer .color .val').html(color);
            $('#visualizer .clarity .val').html(clarity);
        },

    // change diamond image in visualizer

        updateSymbol: function(symbolName){
            var gfxDir = '/sites/all/themes/rothschild/images/apps/svg/'
            symbolName = (typeof symbolName === 'undefined') ? 'round' : symbolName.toLowerCase();
            $('#visualizer .shape-overlay').css({'backgroundImage': 'url('+gfxDir+symbolName+'.svg)'});
            $('#visualizer .color-overlay').css({'backgroundImage': 'url('+gfxDir+symbolName+'_yellow.svg)'});
        },

        updateMoreInfo: function(symbolName){
            symbolName = (typeof symbolName === 'undefined') ? 'round' : symbolName.toLowerCase();
            $('.field-more-info.dynamic .value-more-info-default').hide();
            $('.field-more-info.dynamic .value-more-info').hide().filter('.shape-'+symbolName).show();
        },

        initializeSlider: function(aspect, $element){
            $element.find('.rtc-slider-label').html('');
            $element.find('.rtc-slider.ui-slider').slider('destroy');

        // evenly space out our slider labels
        // depending on the number of steps

            $(aspect.steps).each(function(i, el){
                var width = (100 / (aspect.steps.length - 1)).toFixed(3);
                var marginL = 0;
                var marginR = 0;
                var $sliderItem = $('<div></div>').addClass('slider-item');

                if(i === 0 || i === aspect.steps.length - 1){
                    width = width / 2;
                }

                $sliderItem.css({  'width'          : width+'%',
                                    'margin-left'   : marginL+'%',
                                    'margin-right'  : marginR+'%'})
                                .append('<span>'+el+'</span>');

                $element.find('.rtc-slider-label').append($sliderItem);
            });

            $element.find('.rtc-slider').slider({
                min     : aspect.min,
                max     : aspect.max,
                step    : aspect.step,
                value   : aspect.current,
                slide   : aspect.slide
            });

        // run any additional functions specific to this element/panel

            if(aspect.afterInit){
                aspect.afterInit($element, aspect.value);
            }
        },

        initializeApp: function(){
            var app = this;
            $('a.custom-quote-modal').attr('data-formurl', $('a.custom-quote-modal').attr('href') );

        // create buttons for each diamond shape

            $(app.shape.options).each(function(i,el){
                $('<li class="diamond-shape '+el.toLowerCase()+'"><span class="diamond">'+el+'</span></li>')
                    .button().attr('data-shape-value', el)
                    .appendTo('#rtc-shape-buttons');
            });

            $('#rtc-shape-buttons').selectable({
                selected: function(event, ui){
                    app.shape.current = $(ui.selected).attr('data-shape-value');
                    app.updateSymbol(app.shape.current);
                    app.updateMoreInfo(app.shape.current);
                    if($('.clarity-overlay').is(':hidden')){
                        $('.clarity-overlay').css({'display':'block'});
                    }
                }
            });

        // set up sliders for each diamond aspect

            app.initializeSlider(app.carat, $('#rtc-carat'));
            app.initializeSlider(app.quality_small, $('#rtc-quality'));
            app.initializeSlider(app.color, $('#rtc-color'));
            app.initializeSlider(app.clarity, $('#rtc-clarity'));
            app.initializeSlider(app.cut, $('#rtc-cut'));
            app.updateVisualizer();

            $('.field-label').on('click', function(){
                $(this).find('.arrow-right').toggleClass('down').end().next('.field-more-info').slideToggle();
            });

            $('#rtc-advanced-options').on('click', '.field-title', function(){
                $(this).nextAll('.field-adv-row-container').slideToggle();
                $(this).find('.arrow-right').toggleClass('down');
            });

            $('#visualizer').on('click', '#calculate-price', function(e){
                e.preventDefault();
                return app.submitForm();
            });
        },

        submitForm: function(){
            var app = this;
            var submitData = app;

        // add list of "raw" advanced option values (aka indices) to the data   

            submitData.adv_raw = {
                fluorescence : $('.field-adv-fluorescence input').index( $('input[name="field-adv-fl"]:checked') ),
                laser : $('.field-adv-laser-drilled input').index( $('input[name="field-adv-laser"]:checked') ),
                brown : $('.field-adv-brown-tint input').index( $('input[name="field-adv-brown"]:checked') ),
                fracture : $('.field-adv-fracture-filled input').index( $('input[name="field-adv-fracture"]:checked') ),
                inclusion : $('.field-adv-inclusion-type input').index( $('input[name="field-adv-inclusion"]:checked') )
            };

        // submit diamond information to backend for calculation
        // response is a simplified object with properties to be inserted into the modal webform

            $.post('/app/calculate/diamond', {data: JSON.stringify(submitData)}, function(response){
                var price_range = $.parseJSON(response).range;
                var atts = $.parseJSON(response).atts;
                var qs = '';    // query string used to populate the modal form

            // iterate through data object, adding elements to query string

                $.each(atts, function(i, el){
                    if(typeof el !== 'object'){
                        qs += i+'='+el+'&';
                    }else{
                        $.each(el, function(i_2, el_2){
                            qs += i+'_'+i_2+'='+el_2+'&';
                        });
                    }
                });

            // no price was returned from RapNet service

                if(price_range.low === 0 && price_range.high === 0){
                    qs += 'price_range=Your stone does not match the criteria of any stones in our database.\
                            Please contact us using the form below for a quote.';
                }else{
                    qs += 'price_range=$'+Number(price_range.low).toMoney()+' to $'+Number(price_range.high).toMoney();
                }

            // remove default behavior from Submit button
            // (we need to set the link to the modal form manually to include the new query string)

                var form = $('a.custom-quote-modal').off().attr('data-formurl');
                $('a.custom-quote-modal').attr('href', form+'?'+qs).removeClass('ctools-use-modal-processed');

            // re-initialize the diamond app values and trigger modal form

                setTimeout(function(){
                    Drupal.attachBehaviors();
                    $('a.custom-quote-modal').click();
                }, 100);
            });

            return false;
        }
    };


    Drupal.behaviors.rothschild = {
        attach: function(context, settings) {
        $(window).load(function(){

            DiamondApp.initializeApp();

        // when scrolling, keep diamond visualizer in a fixed sidebar position
        //  but within the vertical bounds of the app

            var scrollBuffer = 20;  // how far before we reach an item to make it "stick"
            var sidebarPos = parseInt($('.app-column-right').offset().top);
            var sidebarH = $('.app-column-right').outerHeight();

            var appPos = $('.app-column-left').offset().top;
            var appH = function(){ return $('.app-column-left').outerHeight(); };

            $(this).scroll(function(){
                var y = $(window).scrollTop();
                var headerH = $('#header-wrapper').outerHeight();

            // account for Drupal administration menu height

                if( $('body').hasClass('admin-menu')){
                    headerH += parseInt($('html').css('margin-top'));
                }

            // if our scroll will move us below the visualizer...

                if( y + headerH + scrollBuffer > sidebarPos ){

                // if the visualizer won't run off bottom of the app, maintain a "fixed" position
                // otherwise, lock it at the bottom of the app

                    if( y + headerH + sidebarH +scrollBuffer<= appPos + appH() ){
                        $('.app-column-right').css({'top': (y + headerH + scrollBuffer - sidebarPos)+'px'});
                    }else{
                        $('.app-column-right').css({'top': (appH() - sidebarH)+'px'});
                    }
                }else{

                // otherwise, we haven't scrolled past the top of the app, so set visualizer at top of the column

                    $('.app-column-right').css({'top': '0px'});
                }
            });
        });
        }
    };

})(jQuery, Drupal, this, this.document);