var tabId;

async function load() {
    // The user clicked our button, get the active tab in the current window using
    // the tabs API.
    let tabs = await messenger.tabs.query({active: true, currentWindow: true});
    tabId = tabs[0].id;

    let compose = await messenger.compose.getComposeDetails(tabs[0].id);
    document.getElementById("receiverEmailAddress").textContent = compose.to;
    document.getElementById("emailSubject").textContent = compose.subject;
    document.getElementById("emailBody").innerText = compose.body;
}

document.addEventListener("DOMContentLoaded", load);


$("#encryptEmail").click(function () {
    // Encrypt
    var ciphertext = "e/##" + CryptoJS.AES.encrypt($("#emailBody").text(), $("#signalKey").val()) + "##/e";

    $("#emailBodyCiphertext").html(ciphertext.toString());
});

function phoneValidate(phone) {
    var regexPattern=new RegExp(/^[0-9-+]+$/);    // regular expression pattern
    return regexPattern.test(phone);
}

function showMessage(type, message) {
    removeMessage();
    if (type) {
        $("#successfulBox").removeClass("d-none");
        $("#successfulMessage").text(message);
    } else {
        $("#warningBox").removeClass("d-none");
        $("#warningMessage").text(message);
    }

    setInterval(function () {
        removeMessage()
    }, 5000);
}

function removeMessage() {
    $("#successfulBox").addClass("d-none");
    $("#warningBox").addClass("d-none");
    $("#successfulMessage").text("");
    $("#warningMessage").text("");
}

function loginToSignal(phoneNumber) {
    $.ajax({
        url: "http://192.168.56.103:5000/api/v1/resources/linkUser",
        type: "GET",
        data: {
            phoneNumber: phoneNumber,
        },
        complete: function (data) {
            console.log(data);
        }
    });
}

function sendMessageWithSignal(phoneNumber) {
    var password = $("#signalKey").val();
    var receiverPhoneNumber = $("#contactList").val();

    if (password !== "" && receiverPhoneNumber !== "") {
        var md5 = $.md5(password);
        $.ajax({
            url: "http://192.168.56.103:5000/api/v1/resources/sendMessage",
            type: "GET",
            data: {
                sentDate: new Date(Date.now()),
                senderPhone: phoneNumber,
                receiverPhone: receiverPhoneNumber,
                password: password,
                hash: md5,
            },

            success: function (data) {
                showMessage(true, "Message sent successfully" + data.text());
            },
            error: function (data) {
                showMessage(true, "Sending message Failed!" + data.text());
            }
        });
        var encryptedBody = $("#emailBodyCiphertext").val();
        md5 = "h/##" + md5 + "##/h";
        var bodyText = "Hashed Password: <br>" + md5 + " <br> Email Content: <br>" + encryptedBody;
        messenger.compose.setComposeDetails(tabId, {body: bodyText});
        messenger.compose.sendMessage(tabId, {mode: "sendNow"});
    }else {
        showMessage(false, "Receiver phone number and password fields are mandatory!");
    }
}

$("#sendEmail").click(function () {
    sendMessageWithSignal($("#senderVerifiedPhoneNumber").text());
});

$("#loginToSignalButton").click(function () {
    var senderPhoneNumber = $("#senderPhoneNumber").val();
    if (phoneValidate(senderPhoneNumber)) {
        // showMessage(true, "OK!");
        loginToSignal($("#senderPhoneNumber").val());
    }else {
        showMessage(false, "Invalid phone number.");
    }
});

function syncContactList(phoneNumber) {
    if (!$("#SendMessageForm").hasClass("d-none")) {
        $.ajax({
            url: "http://192.168.56.103:5000/api/v1/resources/contacts/all",
            type: "GET",
            data: {
                phoneNumber: phoneNumber,
            },
            success: function (data) {
                $.each(data.recipients, function (i, item) {
                    if (item.contact.name !== "") {
                        $("#contactList").append($('<option>',{
                            value: item.number,
                            text: item.contact.name
                        }));
                    }
                });
            }
        });
    }
}

$("#updateContactList").click(function () {
    var phoneNumber = $("#senderVerifiedPhoneNumber").text();
    if (!$("#SendMessageForm").hasClass("d-none")) {
        $.ajax({
            url: "http://192.168.56.103:5000/api/v1/resources/contacts/update",
            type: "GET",
            data: {
                phoneNumber: phoneNumber,
            },
            beforeSend: function () {
                showMessage(true, "Contact list update request sent successfully.");
            },
            success: function (data) {
                $("#contactList").empty().append("<option>None</option>");
                syncContactList(data.phoneNumber);
                showMessage(true, "Contact list updated successfully!");
            }
        });
    }
});

$("#logout").click(function () {
    var phoneNumber = $("#senderVerifiedPhoneNumber").text();
    $.ajax({
        url: "http://192.168.56.103:5000/api/v1/resources/logout",
        type: "GET",
        data: {
            phoneNumber: phoneNumber,
        },
        success: function (data) {
            showMessage(true, "You have logout successfully from " + data.phoneNumber);
            $("#sendMessageForm").addClass("d-none");
            $("#linkForm").removeClass("d-none");
        }
    });
});

$("#linkButton").click(function () {
    var deviceName = $("#deviceName").val();

    if (deviceName == "") {
        showMessage(false, "Please input a device name!");
    } else {
        // window.open("signalcaptcha://link/" + deviceName);
        windows.openDefaultBrowser("http://google.com");
    }
});

$(document).ready(function () {
    $.ajax({
        url: "http://192.168.56.103:5000/api/v1/resources/getRegisteredPhoneNumber",
        type: "GET",
        success: function (data) {
            if (data.phoneNumber != "") {
                $("#sendMessageForm").removeClass("d-none");
                $("#senderVerifiedPhoneNumber").html(data.phoneNumber);
                syncContactList(data.phoneNumber);
            } else {
                $("#linkForm").removeClass("d-none");
            }
        },
        error: function (data) {
            showMessage(false, "Something went wrong!");
        }
    });
});