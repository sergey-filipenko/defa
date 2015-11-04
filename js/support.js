$(document).ready(function () {
/*
    var backendDataUrl = '/scripts/reklamasjon/form.php?lang=' + currentLanguage;
    var formUrl = "/" + currentLanguage + "/corporate/contact_and_support/automotive/return_form/";
    var previewUrl = "/" + currentLanguage + "/corporate/contact_and_support/automotive/return_form_preview/";
*/
    var backendDataUrl = '/form.php?lang=' + currentLanguage;
    var formUrl = "/default-return-form.html";
    var previewUrl = "/default-return-form-preview-site.html";

    var mathenticate = {
        bounds: {
            lower: 5,
            upper: 50
        },
        first: 0,
        second: 0,
        generate: function () {
            this.first = Math.floor(Math.random() * this.bounds.lower) + 1;
            this.second = Math.floor(Math.random() * this.bounds.upper) + 1;
        },
        show: function () {
            return this.first + ' + ' + this.second;
        },
        solve: function () {
            return this.first + this.second;
        }
    };

    var initMathCaptcha = function() {
        mathenticate.generate();
        $('#calcResponse').val('');
        $('#calcCaptcha .calc-number.first').html(mathenticate.first);
        $('#calcCaptcha .calc-number.second').html(mathenticate.second);

    };
    
    $.urlParam = function(name, url) {
        if (!url) {
            url = window.location.href;
        }
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
        if (!results) {
            return 0;
        }
        return results[1] || 0;
    }

    if ($('#formPurchase').length > 0) {
        if (currentLanguage == 'fi') {
            $('#org_num').data('length', 8);
        }	  
        var productsCount = 1;
        $('input.store_item').focusout(function(e) {
            amplify.store($(this).attr('id'), $(this).val());
        });

        $.ajax({
            url: backendDataUrl,
            dataType: "json",
            success: function(data) {
                $('.input-holder').removeClass('error');
                console.log(data);
                if (data && data instanceof Object != false) {
                    $('input, textarea').each(function() {
                        var elementId = $(this).attr('id');
                        if (data[elementId]) {
                            $(this).val(data[elementId]);
                            $(this).trigger('keyup');
                        }
                    });
                    if (data.remember == "on") {
                        $('#remember').attr('checked', 'checked');
                    }
                    if (data.ref_shipping_comp == "on") {
                        $('#ref_shipping_comp').attr('checked', 'checked');
                    }

                    if (data.refund == 1) {
                        $('#dataRefund1').attr('checked', 'checked');
                    }

                    var radio = $('#dataRefund0');
                    var n = 1;
                    if(data.product) {
                        $.each(data.product, function(i, product) {
                            if(product.defa_number) {
                                if (n > 1) {
                                    productsForms.generateNewBlock();
                                }
                                if (n < data.product.length) {
                                    productsForms.newBlock.removeClass(productsForms.options.disabledClass);
                                }
                                $('#productDefaNumber' + n).val(product.defa_number).trigger('keyup');
                                $('#productSaleDate' + n).val(product.sale_date).trigger('keyup');
                                if(product.replacement) {
                                    $('#productReplacement' + n).trigger('click');
                                }
                                $('#productManufacturer' + n).val(product.manufacturer).trigger('keyup');
                                $('#productYear' + n).val(product.year).trigger('keyup');
                                $('#productType' + n).val(product.type).trigger('keyup');
                                $('#productNumber' + n).val(product.number).trigger('keyup');
                                $('#productOwner' + n).val(product.owner).trigger('keyup');
                                $('#productComment' + n).val(product.comment).trigger('keyup');
                                $('#productMountedBy' + n).val(product.mounted_by).trigger('keyup');
                                n++;
                                productsCount++;
                            }
                        });
                    }
                } else {
                    $.each(amplify.store(), function( index, value ) {
                        var field = $('#'+index);
                        if (field.length > 0) {
                            field.val(value).trigger('keyup');
                        }
                    });
                    productsForms.refreshState();

                }
            }
        });
        $( "#formPurchase").submit(function( event ) {
            if($(this).hasClass('form-success')) {
                $.post( backendDataUrl, $( "#formPurchase" ).serialize(), function( data ) {
                    window.location.href = previewUrl;
                });
            } else {
                alert(formIsNotCompletedMessage);
            }
            event.preventDefault();
        });
        $('#products-holder').on('click', '.btn-delete', function(e) {
            e.preventDefault();
            var cnt = $('#products-holder>.container-holder:not(.disabled-product)').length;
            if (cnt <= 1) {
                return false;
            }
            var block = $('#productDetails' + $(this).data('index'));
            block.find('.datepicker').datepicker('destroy');
            block.remove();
            $.each($('#products-holder>.container-holder'), function( index, value ) {
                $(value).find('.counter').html(index+1);
            });
            productsForms.allBlocks = $('#products-holder>.container-holder');
            productsForms.refreshState();
        })
    } else {
        var contactId = $.urlParam('contact_id');
        var queryStr = '';
        if (contactId) {
            $('.print-page .unique-number').html($.datepicker.formatDate('yymmdd', new Date()) + contactId.substring(1));
            queryStr = '&contact_id=' + contactId;
            $('#goBack').hide();
            $('#sendInn').hide();
        } else {
			$('#printInn').hide();
            $('.print-page .unique-number').html($.datepicker.formatDate('yymmdd', new Date()));
            $('#goBack').click(function(event){
                event.preventDefault();
                window.location.href = formUrl;
            });
            initMathCaptcha();
            $('#sendInn').click(function(e){
                e.preventDefault();
                if ($('#calcResponse').val() != mathenticate.solve()) {
                    $('#calcCaptcha .calc-error').html(captchaCalculatorErrorMessage).show();
                    initMathCaptcha();
                    return false;
                }
                $('#calcCaptcha .calc-error').hide();
                $.ajax({
                    url: backendDataUrl,
                    dataType: "json",
                    data:  {send_inn:true},
                    type:'POST',
                    success: function(data) {
                        if(data && data.new_id) {
                            document.title = data.new_id;
                            $('#printInn').show();
                            $('#sendInn').hide();
                            $('#goBack').hide();
                            $('#calcCaptcha').hide();
                            $('.fields-text').hide();
                            $('.opener').addClass('hidden');
                            $('.container-slide').css('display', 'none');
                            $('.print-page .unique-number').html($.datepicker.formatDate('yymmdd', new Date()) + data.new_id.substring(1));
                            $('#formMessage').html(formSubmitSuccessMessage );
                        } else {
                            $('#formMessage').html(formSubmitErrorMessage);
                        }
                    }
                });
            });
        }
        $.ajax({
            url: backendDataUrl + queryStr,
            dataType: "json",
            success: function(data) {
                document.title = contactId;
                if (data && data.name) {
                    var productContent = $('#products_container').html();

                    $('#products_container').html('');

                    $('.dataName').text(data.name);
                    $('.dataAddress1').text(data.address1);
                    $('.dataAddress2').text(data.address2);
                    $('.dataAddress3').text(data.address3);
                    $('.dataContactEmail').text(data.contact_email);
                    $('.dataContactName').text(data.contact_name);
                    $('.dataContactPhone').text(data.contact_phone);
                    $('.dataOrgNum').text(data.org_num);
                    $('.dataRefBanknum').text(data.ref_banknum);
                    $('.dataRefComment').text(data.ref_comment);
                    $('.dataRefEmail').text(data.ref_email);
                    $('.dataRefNum').text(data.ref_num);
                    if(data.product) {
                        var n = 1;
                        $.each(data.product, function(i, product) {
                            var product1 = productContent.replace(/__n__/g, n);
                            $('#products_container').append(product1);

                            jQuery('#productOpenClose'+n).openClose({
                                activeClass: 'active',
                                opener: '.add-more',
                                slider: '.container-wrap',
                                animSpeed: 400,
                                effect: 'slide'
                            });
                            if (product.replacement && product.replacement == '1') {
                                $('#productReplacement' + n).addClass('check');
                            }
                            $('#defaNumber' + n).text(product.defa_number);
                            $('#productSaleDate' + n).text(product.sale_date);
                            $('#productManufacturer' + n).text(product.manufacturer);
                            $('#productYear' + n).text(product.year);
                            $('#productType' + n).text(product.type);
                            $('#productNumber' + n).text(product.number);
                            $('#productOwner' + n).text(product.owner);
                            $('#productComment' + n).text(product.comment);
                            $('#productMountedBy' + n).text(product.mounted_by);
                            n++
                        });
                    } else {
                        // window.location.href = "/" + currentLanguage + "/corporate/contact_and_support/automotive/return_form_sent/";
                    }
                    if (data.remember == "on") {
                        $('#remember').attr('checked', 'checked');
                    }
                    if (data.ref_shipping_comp == "on") {
                        $('#ref_shipping_comp').addClass('check');
                    }
                    if (contactId) {
                        if (data.date_created){
                            var dateStr = $.datepicker.formatDate('yymmdd', $.datepicker.parseDate('yy-mm-dd', data.date_created));
                        } else {
                            var dateStr = $.datepicker.formatDate('yymmdd', new Date());
                        }
                        $('.print-page .unique-number').html(dateStr + contactId.substring(1));
                    }
                    initPrintBlock();
                } else {
                    window.location.href = formUrl;
                }
            }
        });
    }

});