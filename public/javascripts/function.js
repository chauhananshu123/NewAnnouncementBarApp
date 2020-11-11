$(document).ready(function() {
    $('.device-setting ul li.js-mobile ').click(function() {
        $('.preview-wrapper .mobile-preview').show().siblings().hide();
        $(this).addClass("active").siblings().removeClass('active');   
    });
    $('.device-setting ul li.js-desktop ').click(function() {
        $('.preview-wrapper .desktop-preview').show().siblings().hide();
        $(this).addClass("active").siblings().removeClass('active');   
    });
    $('.slider').click(function(){
        $(this).toggleClass('active').find('span').toggleClass('active');
        var status = $(this).parent().find('.status').text();
        if(status == 'Disable'){
            $(this).parent().find('.status').html('Enable')
        }
        else{
            $(this).parent().find('.status').html('Disable')  
        }
    })
    $('.massage input').keyup(function(){
        var mas = $(this).val();
        masLen = mas.length;
        $(this).parent().find('.massage-length').text(mas.length+'/120')
    })
    $('input[type="color"]').hover(function(){
        $(this).parent().find('span').html($(this).val());
    })
    $('.help').click(function(){
        $(this).parent().find('.description').stop().fadeToggle()
    })
    $('.close-icon').click(function(){
        $(this).parents('.section-title').find('.description').stop().fadeOut()
    })
    $(document).on('click', function (e) {
        if ($(e.target).closest(".description").length === 0 && $(e.target).closest(".help").length === 0 ) {
            $(".description").hide();
        }
    });
});