var tabId;

async function load() {
    // The user clicked our button, get the active tab in the current window using
    // the tabs API.
    let tabs = await messenger.tabs.query({active: true, currentWindow: true});
    tabId = tabs[0].id;

    let messageDisplay = await messenger.messageDisplay.getDisplayedMessage(tabId);
    let message = await messenger.messages.getFull(messageDisplay.id);
    var messageBody;
    if (message.parts[0].body == null) {
        messageBody = message.parts[0].parts[0].body;
    }else {
        messageBody = message.parts[0].body;
    }
    if (isSupported(messageBody)) {
        document.getElementById("senderEmailAddress").textContent = messageDisplay.author;
        document.getElementById("emailSubject").textContent = messageDisplay.subject;
        document.getElementById("encryptedEmailBody").textContent = messageBody;
    } else {
        notSupportedEmail();
    }
}

document.addEventListener("DOMContentLoaded", load);

function showMessage(type, message) {
    removeMessage();
    if (type) {
        $("#successfulBox").removeClass("d-none");
        $("#successfulMessage").text(message);
    } else {
        $("#warningBox").removeClass("d-none");
        $("#warningMessage").text(message);
    }

    // setInterval(function () {
    //     removeMessage()
    // }, 5000);
}

function removeMessage() {
    $("#successfulBox").addClass("d-none");
    $("#warningBox").addClass("d-none");
    $("#successfulMessage").text("");
    $("#warningMessage").text("");
}

function getEncryptedEmail(value) {
    var subStr = value.match("e/##(.*)##/e");
    return subStr[1];
}

function getHashOfPassword(value) {
    var subStr = String(value.match("h/##[0-9a-f]{32}##/h"));
    var val2 = subStr.substring(4, subStr.length-4);
    return val2;
}

function isSupported(mailContent) {
    return mailContent.includes("Hashed Password:") && mailContent.includes("Email Content:");
}

function notSupportedEmail() {
    $("#displayEmail").addClass("d-none");
    showMessage(false, "This email is not supported by Signal Add-On!");
}

$("#linkButton").click(function () {
    var deviceName = $("#deviceName").val();

    if (deviceName == "") {
        showMessage(false, "Please input a device name!");
    } else {
        window.open("signalcaptcha://link/" + deviceName);
    }
});

$("#decryptEmail").click(function () {
    var key = $("#signalKey").val();
    var encryptedEmail = getEncryptedEmail($("#encryptedEmailBody").text());

    // Decrypt
    var bytes  = CryptoJS.AES.decrypt(encryptedEmail, key);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    $("#decryptedEmailBody").html(plaintext);
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
            $("#displayEmail").addClass("d-none");
            $("#linkForm").removeClass("d-none");
        }
    });
});

$("#findPassword").click(function () {
    $.ajax({
        url: "http://192.168.56.103:5000/api/v1/resources/getPasswordOfHash",
        type: "GET",
        data: {
            hash: getHashOfPassword($("#encryptedEmailBody").text()),
        },
        success: function (data) {
            $("#signalKey").val(data.password);
        },
        error: function (data) {
            showMessage(false, data);
        }
    });
});

$(document).ready(function () {
    $.ajax({
        url: "http://192.168.56.103:5000/api/v1/resources/getRegisteredPhoneNumber",
        type: "GET",
        success: function (data) {
            console.log(data);
            if (data.phoneNumber != "") {
                $("#displayEmail").removeClass("d-none");
                $("#senderVerifiedPhoneNumber").html(data.phoneNumber);
            } else {
                $("#linkForm").removeClass("d-none");
            }
        },
        error: function (data) {
            showMessage(false, data);
        }
    });
});