$("#checkInput").click(function () {
    if ($('#phoneBox').val()==""&&$('#selectBox').val()=="Your contacts") {
        $("#warning").removeClass("d-none");
        $("#success").addClass("d-none");
    }
    else {
        $("#success").removeClass("d-none");
        $("#warning").addClass("d-none");
    }

});

