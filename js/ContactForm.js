$("#checkInput").click(function () {
    if ($('#phoneBox').val()==""&&$('#selectBox').val()=="Your contacts") {
        $("#warning").removeClass("invisible");
    }
    else $("#success").removeClass("invisible");

});

