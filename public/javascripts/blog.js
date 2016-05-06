// $(function() {
//     $(".content").each(function(i) {
//         var divH = $(this).height();
//         var $p = $("p", $(this)).eq(0);
//         while ($p.outerHeight() > divH) {
//             $p.text($p.text().replace(/(\s)*([a-zA-Z0-9]+|\W)(\.\.\.)?$/, "..."));
//         };
//     });
// })

// var wordLimit = function() {
//     $('.content').each(function() {
//         var copyThis = $(this.cloneNode(true)).hide().css({'position ': 'absolute','width ': 'auto','overflow ': 'visible'});
//         $(this).after(copyThis);
//         if (copyThis.width() > $(this).width()) {
//             $(this).text($(this).text().substring(0, $(this).html().length - 4));
//             $(this).html($(this).html() + '…');
//             copyThis.remove();
//             wordLimit();
//         } else {
//             copyThis.remove(); //清除复制
//             return;
//         }
//     });
// }
// wordLimit();
