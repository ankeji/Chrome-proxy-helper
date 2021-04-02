$(function() {
  /*点击切换选项的*/
  $('.menu a').click(function(ev) {
    ev.preventDefault();
    var selected = 'selected';

    $('.mainview > *').removeClass(selected);
    $('.menu li').removeClass(selected);
    setTimeout(function() {
      $('.mainview > *:not(.selected)').css('display', 'none');
    }, 100);

    $(ev.currentTarget).parent().addClass(selected);
    var currentView = $($(ev.currentTarget).attr('href'));
    currentView.css('display', 'block');
    setTimeout(function() {
      currentView.addClass(selected);
    }, 0);

    setTimeout(function() {
      $('body')[0].scrollTop = 0;
    }, 200);
  });
  /*点击输入框确定输入的ip池接口地址*/
  var ip_api = localStorage.ip_api
  if (ip_api) {
    ipAddress = $('.ip_http_url').val(ip_api)
    $('.ip_cancel_btn').css("display", "");
  }else{
    $('.ip_cancel_btn').css("display", "none");
  }
  $('.ip_submit_btn').click(function(){
    var ipAddress = $('.ip_http_url').val()
    localStorage.ip_api = ipAddress;
    if (ipAddress) $('.ip_cancel_btn').css("display", "");
  })
  $('.ip_cancel_btn').click(function(){
    localStorage.ip_api = '';
    $('.ip_cancel_btn').css("display", "none");
    $('.ip_http_url').val("");
    alert('清除成功！')
  })
  $('.mainview > *:not(.selected)').css('display', 'none');
});



/*设置多语言的代码*/
document.addEventListener('DOMContentLoaded',
  function () {
    $('[data-i18n-content]').each(function() {
       var message = chrome.i18n.getMessage(
         this.getAttribute('data-i18n-content'));
      if (message)
         $(this).html(message);
    });
});
