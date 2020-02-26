const fetch = require("node-fetch");
const fs = require("fs");
const querystring = require("querystring");
const secret = ${{ secrets.SECRET }};

function upload_file(file_path, save_slot, save_name) {
    const code = fs.readFileSync(file_path);

    const body = {
        method: "save_code",
        arguments: JSON.stringify({
            slot: save_slot.toString(),
            code: code.toString(),
            name: save_name,
            log: "0"
        })
    };

    const options = {
        method: 'post',
        body: querystring.stringify(body),
        headers: {
            cookie: "auth=" + secret,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }

    return fetch("https://adventure.land/api/save_code", options);
}

module.exports = upload_file;