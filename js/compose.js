async function load() {
    // The user clicked our button, get the active tab in the current window using
    // the tabs API.
    let tabs = await messenger.tabs.query({active: true, currentWindow: true});

    let compose = await messenger.compose.getComposeDetails(tabs[0].id);
    document.getElementById("emailSubject").textContent = compose.subject;
    document.getElementById("emailBody").textContent = compose.plainTextBody;
}

document.addEventListener("DOMContentLoaded", load);


$("#encryptEmail").click(function () {
    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt($("#emailBody").text(), $("signalKey").text());

    // Decrypt
    /*var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);*/

    $("#emailBodyCiphertext").html(ciphertext.toString());
});