$("#submit").click(function () {
    if ($('#floatingInput').val()=="") {
        $("#warning").removeClass("d-none");
        $("#success").addClass("d-none");
    }
    else {
        $("#success").removeClass("d-none");
        $("#warning").addClass("d-none");
    }
});
